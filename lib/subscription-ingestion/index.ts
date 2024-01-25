import * as cdk from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { ApplicationLogLevel, Architecture, LambdaInsightsVersion, LogFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { IngestionStepFunction as NewsIngestionStepFunction } from './ingestion-step-function'
import { SubscriptionPollStepFunction } from './subscription-poll-step-function'
import { type StateMachine } from 'aws-cdk-lib/aws-stepfunctions'
import { Stack } from 'aws-cdk-lib'

export const newsSubscriptionTableTypeIndex = 'type-index'
export const newsSubscriptionTableLSI = 'lsi-date-index'

export class NewsSubscriptionIngestion extends Construct {
  public readonly newsSubscriptionTable: Table
  public readonly dataIngestBucket: Bucket
  public readonly ingestionStepFunctionStateMachine: StateMachine
  public readonly subscriptionPollStepFunctionStateMachine: StateMachine
  public readonly feedSubscriberFunction: NodejsFunction

  constructor (scope: Construct, id: string) {
    super(scope, id)
    const newsSubscriptionTable = new Table(this, 'NewsSubscriptionTable', {
      tableName: Stack.of(this).stackName + '-NewsSubscriptionTable',
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      partitionKey: {
        name: 'subscriptionId',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'compoundSortKey',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST
    })

    newsSubscriptionTable.addLocalSecondaryIndex({
      indexName: newsSubscriptionTableLSI,
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING
      }
    })

    newsSubscriptionTable.addGlobalSecondaryIndex({
      indexName: newsSubscriptionTableTypeIndex,
      partitionKey: {
        name: 'compoundSortKey',
        type: AttributeType.STRING
      }
    })

    const newsDataIngestBucket = new Bucket(this, 'NewsDataIngestBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    const ingestionStepFunction = new NewsIngestionStepFunction(this, 'IngestionStepFunction', {
      description: 'Step Function Responsible for ingesting data from RSS/ATOM feeds, generating summarizations and storing the information.',
      newsSubscriptionTable,
      newsDataIngestBucket
    })

    const subscriptionPollStepFunction = new SubscriptionPollStepFunction(this, 'SubscriptionPollStepFunction', {
      description: 'Step Function Responsible for getting enabled subscriptions and starting ingestion for each one.',
      newsIngestionStateMachine: ingestionStepFunction.stateMachine,
      newsSubscriptionTable,
      newsSubscriptionTableTypeIndex
    })

    const feedSubscriberFunction = new NodejsFunction(this, 'feed-subscriber', {
      description: 'Function responsible for subscribing to a specified RSS/ATOM feed',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        NEWS_SUBSCRIPTION_TABLE: newsSubscriptionTable.tableName,
        INGESTION_STEP_FUNCTION: ingestionStepFunction.stateMachine.stateMachineArn
      },
      timeout: cdk.Duration.minutes(1)
    })

    newsSubscriptionTable.grantWriteData(feedSubscriberFunction)
    ingestionStepFunction.stateMachine.grantStartExecution(subscriptionPollStepFunction.stateMachine)
    ingestionStepFunction.stateMachine.grantStartExecution(feedSubscriberFunction)

    this.newsSubscriptionTable = newsSubscriptionTable
    this.dataIngestBucket = newsDataIngestBucket
    this.feedSubscriberFunction = feedSubscriberFunction
    this.ingestionStepFunctionStateMachine = ingestionStepFunction.stateMachine
    this.subscriptionPollStepFunctionStateMachine = subscriptionPollStepFunction.stateMachine
  }
}
