/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { type Table } from 'aws-cdk-lib/aws-dynamodb'
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { IngestionStepFunction } from './ingestion-step-function'
import { DataFeedPollStepFunction } from './data-feed-poll-step-function'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import {
  ApplicationLogLevel,
  Architecture,
  LambdaInsightsVersion,
  LoggingFormat,
  Runtime,
  Tracing
} from 'aws-cdk-lib/aws-lambda'
import { NagSuppressions } from 'cdk-nag'

interface RssAtomFeedProps {
  dataFeedTable: Table
  dataFeedTableTypeIndex: string
  dataFeedTableLSI: string
  loggingBucket: Bucket
}

export class RssAtomFeedConstruct extends Construct {
  public readonly ingestionStepFunction: IngestionStepFunction
  public readonly dataFeedPollStepFunction: DataFeedPollStepFunction
  public readonly feedSubscriberFunction: NodejsFunction
  public readonly rssAtomDataBucket: Bucket
  constructor (scope: Construct, id: string, props: RssAtomFeedProps) {
    super(scope, id)
    const { dataFeedTable, dataFeedTableTypeIndex, loggingBucket } = props
    const rssAtomDataBucket = new Bucket(this, 'RssAtomDataBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: loggingBucket,
      serverAccessLogsPrefix: 'rss-atom-feed-data-bucket-access-logs/',
      enforceSSL: true,
      encryption: BucketEncryption.S3_MANAGED
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
      loggingFormat: LoggingFormat.JSON,
      applicationLogLevelV2: ApplicationLogLevel.DEBUG,
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

    /**
     * CDK NAG Suppressions
     */
    NagSuppressions.addResourceSuppressions(
      [feedSubscriberFunction],
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'Allowing CloudWatch & XRay'
        }
      ],
      true
    )
  }
}
