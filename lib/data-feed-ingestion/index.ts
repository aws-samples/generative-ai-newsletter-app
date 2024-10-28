/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import * as cdk from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { type NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { type Bucket } from 'aws-cdk-lib/aws-s3';
import { type StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';
import { RssAtomFeedConstruct } from './rss-atom-ingestion';

export class NewsSubscriptionIngestion extends Construct {
  public readonly dataFeedTable: Table;
  public readonly rssAtomDataBucket: Bucket;
  public readonly rssAtomIngestionStepFunctionStateMachine: StateMachine;
  public readonly dataFeedPollStepFunctionStateMachine: StateMachine;
  public readonly feedSubscriberFunction: NodejsFunction;
  public readonly dataFeedTableTypeIndex = 'type-index';
  public readonly dataFeedTableLSI = 'lsi-date-index';

  constructor (scope: Construct, id: string, props: { loggingBucket: Bucket }) {
    super(scope, id);
    const { loggingBucket } = props;
    const dataFeedTable = new Table(this, 'DataFeedTable', {
      tableName: Stack.of(this).stackName + '-DataFeedTable',
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      partitionKey: {
        name: 'dataFeedId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    dataFeedTable.addLocalSecondaryIndex({
      indexName: this.dataFeedTableLSI,
      sortKey: {
        name: 'createdAt',
        type: AttributeType.STRING,
      },
    });

    dataFeedTable.addGlobalSecondaryIndex({
      indexName: this.dataFeedTableTypeIndex,
      partitionKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'accountId',
        type: AttributeType.STRING,
      },
    });

    const rssAtomIngestion = new RssAtomFeedConstruct(
      this,
      'RssAtomIngestion',
      {
        dataFeedTable,
        dataFeedTableTypeIndex: this.dataFeedTableTypeIndex,
        dataFeedTableLSI: this.dataFeedTableLSI,
        loggingBucket,
      },
    );

    this.dataFeedTable = dataFeedTable;
    this.rssAtomDataBucket = rssAtomIngestion.rssAtomDataBucket;
    this.feedSubscriberFunction = rssAtomIngestion.feedSubscriberFunction;
    this.rssAtomIngestionStepFunctionStateMachine =
      rssAtomIngestion.ingestionStepFunction.stateMachine;
    this.dataFeedPollStepFunctionStateMachine =
      rssAtomIngestion.dataFeedPollStepFunction.stateMachine;
  }
}
