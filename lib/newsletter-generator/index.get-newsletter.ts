import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { type Newsletter, type GetNewsletterInput, type DataFeedSubscription } from '@shared/api/API'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const SERVICE_NAME = 'get-newsletter'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())

const NEWSLETTER_DATA_TABLE = process.env.NEWSLETTER_DATA_TABLE
const NEWS_SUBSCRIPTION_TABLE = process.env.NEWS_SUBSCRIPTION_TABLE

const lambdaHandler = async (event: GetNewsletterInput): Promise<Newsletter | null> => {
  logger.debug('Starting get newsletter', { event })
  const { newsletterId } = event
  if (newsletterId !== null && newsletterId.length > 0) {
    try {
      const newsletter = await getNewsletterData(newsletterId)
      if (newsletter == null) {
        metrics.addMetric('NewsletterNotFound', MetricUnits.Count, 1)
        return null
      } else {
        metrics.addMetric('NewsletterFound', MetricUnits.Count, 1)
        if (newsletter?.subscriptionIds !== undefined && newsletter.subscriptionIds !== null && newsletter.subscriptionIds.length > 0) {
          newsletter.subscriptions = await getNewsletterSubscriptionsData(newsletter.subscriptionIds)
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

const getNewsletterData = async (newsletterId: string): Promise<Newsletter | null> => {
  const result = await dynamodb.send(new GetItemCommand({
    TableName: NEWSLETTER_DATA_TABLE,
    Key: marshall({ newsletterId, compoundSortKey: 'newsletter' })
  }))
  return (result.Item != null) ? unmarshall(result.Item) as Newsletter : null
}

const getNewsletterSubscriptionsData = async (subscriptionIds: string[]): Promise<DataFeedSubscription[]> => {
  logger.debug('Getting newsletter subscriptions', { subscriptionIds })
  metrics.addMetric('SubscriptionsForNewsletterLookups', MetricUnits.Count, subscriptionIds.length)
  try {
    const subscriptions: DataFeedSubscription[] = []
    for (const subscriptionId of subscriptionIds) {
      const result = await dynamodb.send(new GetItemCommand({
        TableName: NEWS_SUBSCRIPTION_TABLE,
        Key: marshall({ subscriptionId, compoundSortKey: 'subscription' })
      }))
      if (result.Item != null) {
        subscriptions.push(unmarshall(result.Item) as DataFeedSubscription)
      }
    }
    return subscriptions
  } catch (error) {
    logger.error('Error getting newsletter subscriptions', { error })
    metrics.addMetric('ErrorGettingNewsletterSubscriptions', MetricUnits.Count, 1)
    return []
  }
}

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
