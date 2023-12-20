import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import middy from '@middy/core'
import { DynamoDBClient, QueryCommand, type QueryCommandInput } from '@aws-sdk/client-dynamodb'
import { type FeedArticle } from '../types/newsletter-ingestion'

const SERVICE_NAME = 'filter-ingested-articles'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())

const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE

interface FilterIngestedArticlesInput {
  subscriptionId: string
  articles: FeedArticle[]
}

const lambdaHandler = async (event: FilterIngestedArticlesInput): Promise<FeedArticle[]> => {
  logger.debug('Filtering ingested articles for subscription ID ' + event.subscriptionId)
  logger.debug('Unfiltered new article count = ' + event.articles.length)
  const existingArticles = await getExistingArticles(event.subscriptionId)
  const filteredArticles = event.articles.filter(article => !existingArticles.includes(article.guid))
  logger.debug('Filtered new article count = ' + filteredArticles.length)
  logger.debug('Filtered new article IDs = ' + filteredArticles.map(article => article.guid).join(', '))
  return filteredArticles
}

const getExistingArticles = async (subscriptionId: string): Promise<string[]> => {
  logger.debug('Getting existing articles for subscription ' + subscriptionId)
  const input: QueryCommandInput = {
    TableName: NEWSLETTER_TABLE,
    KeyConditionExpression: '#subscriptionId = :subscriptionId',
    FilterExpression: '#type = :type',
    ExpressionAttributeValues: {
      ':subscriptionId': { S: subscriptionId },
      ':type': { S: 'article' }
    },
    ExpressionAttributeNames: {
      '#subscriptionId': 'subscriptionId',
      '#type': 'type'
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
