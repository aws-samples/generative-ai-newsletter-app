/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import middy from '@middy/core'
import {
  DynamoDBClient,
  QueryCommand,
  type QueryCommandInput
} from '@aws-sdk/client-dynamodb'
import { type FeedArticle } from '../../shared/common'

const SERVICE_NAME = 'filter-ingested-articles'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())

const DATA_FEED_TABLE = process.env.DATA_FEED_TABLE

interface FilterIngestedArticlesInput {
  dataFeedId: string
  articles: FeedArticle[]
}

const lambdaHandler = async (
  event: FilterIngestedArticlesInput
): Promise<FeedArticle[]> => {
  logger.debug(
    'Filtering ingested articles for Data Feed ID ' + event.dataFeedId
  )
  logger.debug('Unfiltered new article count = ' + event.articles.length)
  const existingArticles = await getExistingArticles(event.dataFeedId)
  const filteredArticles = event.articles.filter(
    (article) => !existingArticles.includes(article.guid)
  )
  logger.debug('Filtered new article count = ' + filteredArticles.length)
  logger.debug(
    'Filtered new article IDs = ' +
      filteredArticles.map((article) => article.guid).join(', ')
  )
  return filteredArticles
}

const getExistingArticles = async (dataFeedId: string): Promise<string[]> => {
  logger.debug('Getting existing articles for data feed ' + dataFeedId)
  const input: QueryCommandInput = {
    TableName: DATA_FEED_TABLE,
    KeyConditionExpression:
      '#dataFeedId = :dataFeedId and begins_with(#type,:type)',
    ExpressionAttributeValues: {
      ':dataFeedId': { S: dataFeedId },
      ':type': { S: 'article' }
    },
    ExpressionAttributeNames: {
      '#dataFeedId': 'dataFeedId',
      '#type': 'sk'
    }
  }
  const command = new QueryCommand(input)
  const result = await dynamodb.send(command)
  if (result.Items !== undefined) {
    logger.debug('Found existing articles', {
      itemCount: result.Items.length
    })
    const articles = []
    for (const item of result.Items) {
      if (item.articleId?.S !== undefined) {
        articles.push(item.articleId.S)
      }
    }
    logger.debug('Verified existing articles', {
      itemCount: articles.length
    })
    return articles
  } else {
    return []
  }
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
