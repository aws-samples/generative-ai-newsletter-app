/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import * as cdk from 'aws-cdk-lib'
import { RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import { type Table } from 'aws-cdk-lib/aws-dynamodb'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import {
  ApplicationLogLevel,
  Architecture,
  LambdaInsightsVersion,
  LoggingFormat,
  Runtime,
  Tracing
} from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { type Bucket } from 'aws-cdk-lib/aws-s3'
import {
  DefinitionBody,
  JsonPath,
  LogLevel,
  Map,
  StateMachine,
  TaskInput
} from 'aws-cdk-lib/aws-stepfunctions'
import {
  DynamoAttributeValue,
  DynamoGetItem,
  LambdaInvoke
} from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { NagSuppressions } from 'cdk-nag'
import { Construct } from 'constructs'

interface IngestionStepFunctionProps extends StackProps {
  dataFeedTable: Table
  rssAtomDataBucket: Bucket
}

export class IngestionStepFunction extends Construct {
  public readonly stateMachine: StateMachine
  constructor (scope: Construct, id: string, props: IngestionStepFunctionProps) {
    super(scope, id)
    const { dataFeedTable, rssAtomDataBucket } = props

    const feedReaderFunction = new NodejsFunction(this, 'feed-reader', {
      description:
        'Function responsible for reading feeds and return the articles for ingestion',
      handler: 'handler',
      entry: new URL(
        import.meta.url.replace(/(.*)(\..+)/, '$1.' + 'feed-reader' + '$2')
      ).pathname,
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      tracing: Tracing.ACTIVE,
      loggingFormat: LoggingFormat.JSON,
      applicationLogLevelV2: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG'
      },
      timeout: cdk.Duration.minutes(5)
    })

    const filterIngestedArticlesFunction = new NodejsFunction(
      this,
      'filter-ingested-articles',
      {
        description:
          'Function responsible for filtering out already ingested articles',
        handler: 'handler',
        entry: new URL(
          import.meta.url.replace(
            /(.*)(\..+)/,
            '$1.' + 'filter-ingested-articles' + '$2'
          )
        ).pathname,
        runtime: Runtime.NODEJS_20_X,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        loggingFormat: LoggingFormat.JSON,
        applicationLogLevelV2: ApplicationLogLevel.DEBUG,
        insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
        timeout: cdk.Duration.minutes(5),
        environment: {
          DATA_FEED_TABLE: dataFeedTable.tableName
        }
      }
    )
    dataFeedTable.grantReadData(filterIngestedArticlesFunction)

    const articleIngestionFunction = new NodejsFunction(
      this,
      'article-ingestor',
      {
        description:
          "Function responsible for ingesting each article's content, summarizing it, and storing the data in DDB",
        handler: 'handler',
        entry: new URL(
          import.meta.url.replace(
            /(.*)(\..+)/,
            '$1.' + 'article-ingestor' + '$2'
          )
        ).pathname,
        runtime: Runtime.NODEJS_20_X,
        tracing: Tracing.ACTIVE,
        architecture: Architecture.ARM_64,
        loggingFormat: LoggingFormat.JSON,
        applicationLogLevelV2: ApplicationLogLevel.DEBUG,
        insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
        environment: {
          NEWS_DATA_INGEST_BUCKET: rssAtomDataBucket.bucketName,
          POWERTOOLS_LOG_LEVEL: 'DEBUG',
          DATA_FEED_TABLE: dataFeedTable.tableName
        },
        timeout: cdk.Duration.minutes(5)
      }
    )
    dataFeedTable.grantReadWriteData(articleIngestionFunction)
    articleIngestionFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: ['*'],
        effect: Effect.ALLOW
      })
    )

    const filterArticlesWithBedrockFunction = new NodejsFunction(
      this,
      'filter-articles-with-bedrock',
      {
        description:
          'Function responsible for filtering out using a user provided prompt and Amazon Bedrock.',
        handler: 'handler',
        entry: new URL(
          import.meta.url.replace(
            /(.*)(\..+)/,
            '$1.' + 'filter-articles-with-bedrock' + '$2'
          )
        ).pathname,
        runtime: Runtime.NODEJS_20_X,
        architecture: Architecture.ARM_64,
        tracing: Tracing.ACTIVE,
        loggingFormat: LoggingFormat.JSON,
        applicationLogLevelV2: ApplicationLogLevel.DEBUG,
        insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
        timeout: cdk.Duration.minutes(5),
        environment: {
          DATA_FEED_TABLE: dataFeedTable.tableName
        }
      }
    )
    dataFeedTable.grantReadData(filterArticlesWithBedrockFunction)
    filterArticlesWithBedrockFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: ['*'],
        effect: Effect.ALLOW
      })
    )

    const getDataFeedDetailsJob = new DynamoGetItem(
      this,
      'GetDataFeedDetailsJob',
      {
        key: {
          dataFeedId: DynamoAttributeValue.fromString(
            JsonPath.stringAt('$.dataFeedId')
          ),
          sk: DynamoAttributeValue.fromString('dataFeed')
        },
        table: props.dataFeedTable,
        resultSelector: {
          url: JsonPath.stringAt('$.Item.url.S'),
          id: JsonPath.stringAt('$.Item.dataFeedId.S'),
          accountId: JsonPath.stringAt('$.Item.accountId.S'),
          feedType: JsonPath.stringAt('$.Item.feedType.S'),
          summarizationPrompt: JsonPath.stringAt('$.Item.summarizationPrompt.S')
        },
        resultPath: '$.dataFeed'
      }
    )

    const readFeedJob = new LambdaInvoke(this, 'ReadFeed', {
      lambdaFunction: feedReaderFunction,
      payload: TaskInput.fromJsonPathAt('$.dataFeed'),
      resultSelector: {
        'articles.$': '$.Payload'
      },
      resultPath: '$.articlesData'
    })

    const filterIngestedArticlesJob = new LambdaInvoke(
      this,
      'FilterIngestedArticles',
      {
        lambdaFunction: filterIngestedArticlesFunction,
        inputPath: JsonPath.stringAt('$'),
        payload: TaskInput.fromObject({
          dataFeedId: JsonPath.stringAt('$.dataFeedId'),
          articles: JsonPath.objectAt('$.articlesData.articles')
        }),
        resultSelector: {
          'articles.$': '$.Payload'
        },
        resultPath: '$.articlesData'
      }
    )

    dataFeedTable.grantReadData(filterIngestedArticlesFunction)

    const ingestArticleJob = new LambdaInvoke(this, 'IngestArticle', {
      lambdaFunction: articleIngestionFunction,
      payload: TaskInput.fromJsonPathAt('$')
    })

    const filterArticlesWithBedrockJob = new LambdaInvoke(
      this,
      'FilterArticlesWithBedrock',
      {
        lambdaFunction: filterArticlesWithBedrockFunction,
        inputPath: JsonPath.stringAt('$'),
        payload: TaskInput.fromObject({
          dataFeedId: JsonPath.stringAt('$.dataFeedId'),
          articles: JsonPath.objectAt('$.articlesData.articles')
        }),
        resultSelector: {
          'articles.$': '$.Payload'
        },
        resultPath: '$.articlesData'
      }
    )

    const mapArticles = new Map(this, 'MapArticles', {
      itemsPath: '$.articlesData.articles',
      itemSelector: {
        summarizationPrompt: JsonPath.stringAt(
          '$.dataFeed.summarizationPrompt'
        ),
        input: JsonPath.stringAt('$$.Map.Item.Value')
      }
    })

    mapArticles.itemProcessor(ingestArticleJob)

    const definition = getDataFeedDetailsJob
      .next(readFeedJob)
      .next(filterIngestedArticlesJob)
      .next(filterArticlesWithBedrockJob)
      .next(mapArticles)

    const stateMachine = new StateMachine(this, 'IngestionStateMachine', {
      comment:
        'State machine responsible for ingesting data from RSS feeds, summarizing the data, and storing the data',
      definitionBody: DefinitionBody.fromChainable(definition),
      logs: {
        destination: new LogGroup(this, 'IngestionStateMachineLogGroup', {
          logGroupName: `/aws/vendedlogs/states/${Stack.of(this).stackName}-ingestion-state-machine-log-group`,
          removalPolicy: RemovalPolicy.DESTROY
        }),
        includeExecutionData: true,
        level: LogLevel.ALL
      },
      tracingEnabled: true
    })
    props.dataFeedTable.grantReadData(stateMachine)
    feedReaderFunction.grantInvoke(stateMachine)
    filterIngestedArticlesFunction.grantInvoke(stateMachine)
    articleIngestionFunction.grantInvoke(stateMachine)
    filterArticlesWithBedrockFunction.grantInvoke(stateMachine)
    props.dataFeedTable.grantWriteData(articleIngestionFunction)
    props.rssAtomDataBucket.grantPut(stateMachine)
    this.stateMachine = stateMachine

    /**
     * CDK NAG Suppressions
     */
    NagSuppressions.addResourceSuppressions(
      [
        feedReaderFunction,
        articleIngestionFunction,
        filterIngestedArticlesFunction,
        filterArticlesWithBedrockFunction,
        stateMachine
      ],
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'Allowing CloudWatch/X-Ray'
        }
      ],
      true
    )
  }
}
