import * as cdk from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { type StateMachine } from 'aws-cdk-lib/aws-stepfunctions'
import { Stack } from 'aws-cdk-lib'
import { type NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { type Bucket } from 'aws-cdk-lib/aws-s3'
import { RssAtomFeedConstruct } from './rss-atom-ingestion'

export const dataFeedTableTypeIndex = 'type-index'
export const dataFeedTableLSI = 'lsi-date-index'

export class NewsSubscriptionIngestion extends Construct {
  public readonly dataFeedTable: Table
  public readonly rssAtomDataBucket: Bucket
  public readonly rssAtomIngestionStepFunctionStateMachine: StateMachine
  public readonly dataFeedPollStepFunctionStateMachine: StateMachine
  public readonly feedSubscriberFunction: NodejsFunction

  constructor (scope: Construct, id: string) {
    super(scope, id)
    const dataFeedTable = new Table(this, 'DataFeedTable', {
      tableName: Stack.of(this).stackName + '-DataFeedTable',
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      partitionKey: {
        name: 'dataFeedId',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST
    })

    dataFeedTable.addLocalSecondaryIndex({
      indexName: dataFeedTableLSI,
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING
      }
    })

    dataFeedTable.addGlobalSecondaryIndex({
      indexName: dataFeedTableTypeIndex,
      partitionKey: {
        name: 'sk',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'accountId',
        type: AttributeType.STRING
      }
    })

    const rssAtomIngestion = new RssAtomFeedConstruct(this, 'RssAtomIngestion', {
      dataFeedTable,
      dataFeedTableTypeIndex,
      dataFeedTableLSI
    })

    this.dataFeedTable = dataFeedTable
    this.rssAtomDataBucket = rssAtomIngestion.rssAtomDataBucket
    this.feedSubscriberFunction = rssAtomIngestion.feedSubscriberFunction
    this.rssAtomIngestionStepFunctionStateMachine = rssAtomIngestion.ingestionStepFunction.stateMachine
    this.dataFeedPollStepFunctionStateMachine =
      rssAtomIngestion.dataFeedPollStepFunction.stateMachine
  }
}
