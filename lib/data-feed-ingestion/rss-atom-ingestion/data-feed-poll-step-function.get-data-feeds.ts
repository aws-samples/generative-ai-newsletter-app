/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import {
  DynamoDBClient,
  QueryCommand,
  type QueryCommandInput
} from '@aws-sdk/client-dynamodb'

const SERVICE_NAME = 'get-data-feeds'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())

const DATA_FEED_TABLE = process.env.DATA_FEED_TABLE
const DATA_FEED_TABLE_TYPE_INDEX =
  process.env.DATA_FEED_TABLE_TYPE_INDEX

interface GetDataFeedsOutput {
  dataFeeds: string[]
  success: boolean
}

const lambdaHandler = async (): Promise<GetDataFeedsOutput> => {
  logger.debug('Getting all data feeds')
  try {
    const input: QueryCommandInput = {
      TableName: DATA_FEED_TABLE,
      IndexName: DATA_FEED_TABLE_TYPE_INDEX,
      KeyConditionExpression: '#type = :type',
      FilterExpression: '#enabled = :enabled',
      ExpressionAttributeNames: {
        '#type': 'sk',
        '#enabled': 'enabled'
      },
      ExpressionAttributeValues: {
        ':type': { S: 'dataFeed' },
        ':enabled': { BOOL: true }
      }
    }
    const command = new QueryCommand(input)
    const response = await dynamodb.send(command)
    if (response.Items === undefined) {
      throw new Error('No data feeds found')
    }
    logger.debug('Data Feeds Found: ' + response.Items.length)
    const dataFeeds: string[] = []
    for (const item of response.Items) {
      if (item.dataFeedId?.S !== undefined) {
        metrics.addMetric('DataFeedsToPoll', MetricUnits.Count, 1)
        dataFeeds.push(item.dataFeedId.S)
      }
    }
    logger.debug('Data Feeds: ' + dataFeeds.length)
    return {
      dataFeeds,
      success: true
    }
  } catch (error) {
    logger.error('Error getting data feeds: ', { error })
    return {
      dataFeeds: [],
      success: false
    }
  }
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
