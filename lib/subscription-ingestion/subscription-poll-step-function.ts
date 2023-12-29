import * as cdk from 'aws-cdk-lib'
import { type StackProps } from 'aws-cdk-lib'
import { type Table } from 'aws-cdk-lib/aws-dynamodb'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import { ApplicationLogLevel, Architecture, LambdaInsightsVersion, LogFormat, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { StateMachine, IntegrationPattern, Map, DefinitionBody, JsonPath } from 'aws-cdk-lib/aws-stepfunctions'
import { LambdaInvoke, StepFunctionsStartExecution } from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { SfnStateMachine as StateMachineTarget } from 'aws-cdk-lib/aws-events-targets'
import { Construct } from 'constructs'

interface SubscriptionPollStepFunctionProps extends StackProps {
  newsSubscriptionTable: Table
  newsIngestionStateMachine: StateMachine
  newsSubscriptionTableTypeIndex: string
}

export class SubscriptionPollStepFunction extends Construct {
  public readonly stateMachine: StateMachine
  constructor (scope: Construct, id: string, props: SubscriptionPollStepFunctionProps) {
    super(scope, id)

    const getSubscriptionsFunction = new NodejsFunction(this, 'get-subscriptions', {
      description: 'Function responsible for getting all enabled subscriptions to poll',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        NEWS_SUBSCRIPTION_TABLE: props.newsSubscriptionTable.tableName,
        NEWS_SUBSCRIPTION_TABLE_TYPE_INDEX: props.newsSubscriptionTableTypeIndex
      },
      timeout: cdk.Duration.seconds(30)
    })

    // Step Function Tasks
    // Get Subscriptions from newsletterTable
    const getSubscriptionsJob = new LambdaInvoke(this, 'GetSubscriptions', {
      lambdaFunction: getSubscriptionsFunction,
      payloadResponseOnly: true,
      resultPath: '$'
    })

    const startIngestionStepFunctionJob = new StepFunctionsStartExecution(this, 'StartIngestionStepFunction', {
      stateMachine: props.newsIngestionStateMachine,
      integrationPattern: IntegrationPattern.RUN_JOB
    })

    const mapSubscriptions = new Map(this, 'MapSubscriptions', {
      itemsPath: '$.subscriptions',
      parameters: {
        subscriptionId: JsonPath.stringAt('$$.Map.Item.Value')
      }
    })

    mapSubscriptions.iterator(startIngestionStepFunctionJob)

    const definition = getSubscriptionsJob.next(mapSubscriptions)

    const stateMachine = new StateMachine(this, 'StateMachine', {
      comment: 'State machine responsible for starting each feed\'s ingestion process',
      definitionBody: DefinitionBody.fromChainable(definition)
    })
    getSubscriptionsFunction.grantInvoke(stateMachine)
    props.newsSubscriptionTable.grantReadData(getSubscriptionsFunction)

    new Rule(this, 'SubscriptionCheckRule', {
      schedule: Schedule.rate(cdk.Duration.days(1)),
      targets: [
        new StateMachineTarget(stateMachine)
      ]
    })

    this.stateMachine = stateMachine
  }
}
