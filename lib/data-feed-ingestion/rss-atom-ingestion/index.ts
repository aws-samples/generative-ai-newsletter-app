import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { type Table } from 'aws-cdk-lib/aws-dynamodb'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { IngestionStepFunction } from './ingestion-step-function'
import { DataFeedPollStepFunction } from './data-feed-poll-step-function'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { ApplicationLogLevel, Architecture, LambdaInsightsVersion, LogFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'

interface RssAtomFeedProps {
  dataFeedTable: Table
  dataFeedTableTypeIndex: string
  dataFeedTableLSI: string
}

export class RssAtomFeedConstruct extends Construct {
  public readonly ingestionStepFunction: IngestionStepFunction
  public readonly dataFeedPollStepFunction: DataFeedPollStepFunction
  public readonly feedSubscriberFunction: NodejsFunction
  public readonly rssAtomDataBucket: Bucket
  constructor (scope: Construct, id: string, props: RssAtomFeedProps) {
    super(scope, id)
    const { dataFeedTable, dataFeedTableTypeIndex } = props
    const rssAtomDataBucket = new Bucket(this, 'RssAtomDataBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    const ingestionStepFunction = new IngestionStepFunction(
      this,
      'IngestionStepFunction',
      {
        description:
'Step Function Responsible for ingesting data from RSS/ATOM feeds, generating summarizations and storing the information.',
        dataFeedTable,
        rssAtomDataBucket
      }
    )

    const dataFeedPollStepFunction = new DataFeedPollStepFunction(
      this,
      'DataFeedPollStepFunction',
      {
        description:
'Step Function Responsible for getting enabled data feeds and starting ingestion for each one.',
        dataFeedIngestionStateMachine: ingestionStepFunction.stateMachine,
        dataFeedTable,
        dataFeedTableTypeIndex
      }
    )

    const feedSubscriberFunction = new NodejsFunction(this, 'feed-subscriber', {
      description:
'Function responsible for subscribing to a specified RSS/ATOM feed',
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
        DATA_FEED_TABLE: dataFeedTable.tableName,
        INGESTION_STEP_FUNCTION:
ingestionStepFunction.stateMachine.stateMachineArn
      },
      timeout: Duration.minutes(1)
    })

    dataFeedTable.grantWriteData(feedSubscriberFunction)
    ingestionStepFunction.stateMachine.grantStartExecution(
      dataFeedPollStepFunction.stateMachine
    )
    ingestionStepFunction.stateMachine.grantStartExecution(
      feedSubscriberFunction
    )

    this.rssAtomDataBucket = rssAtomDataBucket
    this.dataFeedPollStepFunction = dataFeedPollStepFunction
    this.feedSubscriberFunction = feedSubscriberFunction
    this.ingestionStepFunction = ingestionStepFunction
  }
}
