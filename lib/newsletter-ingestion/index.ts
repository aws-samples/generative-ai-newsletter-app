import * as cdk from 'aws-cdk-lib'
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { ApplicationLogLevel, LambdaInsightsVersion, LogFormat, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'
import { IngestionStepFunction } from './ingestion-step-function'
import { SubscriptionPollStepFunction } from './subscription-poll-step-function'
import { type StateMachine } from 'aws-cdk-lib/aws-stepfunctions'

export class NewsletterIngestionStack extends cdk.Stack {
  public readonly newsletterTable: Table
  public readonly dataIngestBucket: Bucket
  public readonly ingestionStepFunctionStateMachine: StateMachine
  public readonly subscriptionPollStepFunctionStateMachine: StateMachine
  public readonly feedSubscriberFunction: NodejsFunction
  constructor (scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    const newsletterTableTypeIndex = 'type-index'
    const newsletterTable = new Table(this, 'NewsletterTable', {
      tableName: 'NewsletterData',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'subscriptionId',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'compoundSortKey',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES
    })

    newsletterTable.addGlobalSecondaryIndex({
      indexName: newsletterTableTypeIndex,
      partitionKey: {
        name: 'type',
        type: AttributeType.STRING
      }
    })

    const dataIngestBucket = new Bucket(this, 'DataIngestBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    const ingestionStepFunction = new IngestionStepFunction(this, 'IngestionStepFunction', {
      newsletterTable,
      dataIngestBucket
    })

    const subscriptionPollStepFunction = new SubscriptionPollStepFunction(this, 'SubscriptionPollStepFunction', {
      description: 'Step Function Responsible for getting enabled subscriptions and starting ingestion for each one.',
      ingestionStateMachine: ingestionStepFunction.stateMachine,
      newsletterTable,
      newsletterTableTypeIndex
    })

    const feedSubscriberFunction = new NodejsFunction(this, 'feed-subscriber', {
      description: 'Function responsible for subscribing to a specified RSS/ATOM feed',
      handler: 'handler',
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        NEWSLETTER_TABLE: newsletterTable.tableName
      },
      timeout: cdk.Duration.minutes(1)
    })

    newsletterTable.grantWriteData(feedSubscriberFunction)
    ingestionStepFunction.stateMachine.grantStartExecution(subscriptionPollStepFunction.stateMachine)
    ingestionStepFunction.stateMachine.grantStartExecution(feedSubscriberFunction)

    this.newsletterTable = newsletterTable
    this.dataIngestBucket = dataIngestBucket
    this.ingestionStepFunctionStateMachine = ingestionStepFunction.stateMachine
    this.subscriptionPollStepFunctionStateMachine = subscriptionPollStepFunction.stateMachine
    // this.ragEngine = ragEngine
  }
}
