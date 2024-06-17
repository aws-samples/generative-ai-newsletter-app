/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { Logger } from '@aws-lambda-powertools/logger'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import {
  type Newsletter,
  type GetNewsletterInput,
  type DataFeed
} from '../shared/api/API'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const SERVICE_NAME = 'get-newsletter'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())

const NEWSLETTER_DATA_TABLE = process.env.NEWSLETTER_DATA_TABLE
const DATA_FEED_TABLE = process.env.DATA_FEED_TABLE

const lambdaHandler = async (
  event: GetNewsletterInput
): Promise<Newsletter | null> => {
  logger.debug('Starting get newsletter', { event })
  const { id: newsletterId } = event
  if (newsletterId !== null && newsletterId.length > 0) {
    try {
      const newsletter = await getNewsletterData(newsletterId)
      if (newsletter == null) {
        metrics.addMetric('NewsletterNotFound', MetricUnits.Count, 1)
        return null
      } else {
        metrics.addMetric('NewsletterFound', MetricUnits.Count, 1)
        const dataFeedIds = newsletter?.dataFeedIds
        if (
          dataFeedIds !== undefined &&
          dataFeedIds !== null &&
          dataFeedIds.length > 0
        ) {
          newsletter.dataFeeds = await getNewsletterDataFeedData(dataFeedIds)
        }
        return newsletter
      }
    } catch (error) {
      logger.error('Error getting newsletter', { error })
      metrics.addMetric('ErrorGettingNewsletter', MetricUnits.Count, 1)
      throw Error('Error getting Newsletter details')
    }
  } else {
    throw new Error('newsletterId is required')
  }
}

const getNewsletterData = async (
  newsletterId: string
): Promise<Newsletter | null> => {
  const result = await dynamodb.send(
    new GetItemCommand({
      TableName: NEWSLETTER_DATA_TABLE,
      Key: marshall({ newsletterId, sk: 'newsletter' })
    })
  )
  return result.Item != null ? (unmarshall(result.Item) as Newsletter) : null
}

const getNewsletterDataFeedData = async (
  dataFeedIds: string[]
): Promise<DataFeed[]> => {
  logger.debug('Getting newsletter feeds', { dataFeedIds })
  metrics.addMetric(
    'SubscriptionsForNewsletterLookups',
    MetricUnits.Count,
    dataFeedIds.length
  )
  try {
    const dataFeeds: DataFeed[] = []
    for (const dataFeedId of dataFeedIds) {
      const result = await dynamodb.send(
        new GetItemCommand({
          TableName: DATA_FEED_TABLE,
          Key: marshall({
            dataFeedId,
            sk: 'dataFeed'
          })
        })
      )
      if (result.Item != null) {
        dataFeeds.push(unmarshall(result.Item) as DataFeed)
      }
    }
    return dataFeeds
  } catch (error) {
    logger.error('Error getting newsletter data feeds', { error })
    metrics.addMetric('ErrorGettingNewsletterDataFeeds', MetricUnits.Count, 1)
    return []
  }
}

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
