import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import axios from 'axios'
import middy from '@middy/core'
import * as cheerio from 'cheerio'
import { v4 as uuidv4 } from 'uuid'
import { DynamoDBClient, PutItemCommand, type PutItemInput } from '@aws-sdk/client-dynamodb'
import { SFNClient, StartExecutionCommand, type StartExecutionCommandInput } from '@aws-sdk/client-sfn'
import { marshall } from '@aws-sdk/util-dynamodb'

const SERVICE_NAME = 'feed-subscriber'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())

const NEWS_SUBSCRIPTION_TABLE = process.env.NEWS_SUBSCRIPTION_TABLE
const INGESTION_STEP_FUNCTION = process.env.INGESTION_STEP_FUNCTION

interface FeedSubscriberInput {
  url: string
  discoverable: boolean
}

interface SubscriptionData {
  url: string
  subscriptionId: string
  feedType: 'RSS' | 'ATOM'
  discoverable: boolean
}

const lambdaHander = async (event: FeedSubscriberInput): Promise<SubscriptionData> => {
  logger.debug('Starting Feed Subscriber, input: ' + JSON.stringify(event))
  metrics.addMetric('SubscriberInvocations', MetricUnits.Count, 1)
  const { url, discoverable = false } = event
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data as string, { xmlMode: true })

    const subscriptionId = uuidv4()
    let feedType: 'RSS' | 'ATOM'
    if ($('rss').length > 0 && $('rss').attr('version') === '2.0') {
      metrics.addMetric('RSSFeeds', MetricUnits.Count, 1)
      logger.debug('Found RSS feed')
      feedType = 'RSS'
    } else if ($('feed').length > 0 && $('feed').attr('xmlns') === 'http://www.w3.org/2005/Atom') {
      metrics.addMetric('ATOMFeeds', MetricUnits.Count, 1)
      logger.debug('Found ATOM feed')
      feedType = 'ATOM'
    } else {
      metrics.addMetric('InvalidFeedFormat', MetricUnits.Count, 1)
      throw Error('Unknown feed format. The URL provided must be a URL to a RSS feed or ATOM feed.')
    }
    const subscriptionData: SubscriptionData = { url, subscriptionId, feedType, discoverable }
    await storeSubscriptionData(subscriptionData)
    await startIngestionStepFunction(subscriptionId)
    return subscriptionData
  } catch (error) {
    logger.error('There was an error subscribing to the provided URL', { data: error })
    tracer.addErrorAsMetadata(error as Error)
    throw error
  }
}

const storeSubscriptionData = async (subscriptionData: SubscriptionData): Promise<void> => {
  logger.debug('Storing subscription data', { data: subscriptionData })
  const input: PutItemInput = {
    TableName: NEWS_SUBSCRIPTION_TABLE,
    Item: marshall({
      subscriptionId: subscriptionData.subscriptionId,
      url: subscriptionData.url,
      feedType: subscriptionData.feedType,
      createdAt: new Date().toISOString(),
      compoundSortKey: 'subscription',
      enabled: true
    })
  }
  const command = new PutItemCommand(input)
  const response = await dynamodb.send(command)
  if (response.$metadata.httpStatusCode !== 200) {
    tracer.putAnnotation('error', 'Error storing subscription data')
    tracer.putMetadata('FailedDDBPut', command)
    metrics.addMetric('DDBPutFailed', MetricUnits.Count, 1)
    throw Error('Error storing subscription data')
  } else {
    metrics.addMetric('DDBPutSuccessful', MetricUnits.Count, 1)
  }
}

const startIngestionStepFunction = async (subscriptionId: string): Promise<void> => {
  const input: StartExecutionCommandInput = {
    stateMachineArn: INGESTION_STEP_FUNCTION,
    input: JSON.stringify({ subscriptionId })
  }
  const command = new StartExecutionCommand(input)
  const response = await new SFNClient().send(command)
  if (response.$metadata.httpStatusCode !== 200) {
    tracer.putAnnotation('error', 'Error starting ingestion step function')
    tracer.putMetadata('FailedSFNStart', command)
    metrics.addMetric('SFNStartFailed', MetricUnits.Count, 1)
    throw Error('Error starting ingestion step function')
  } else {
    metrics.addMetric('SFNStartSuccessful', MetricUnits.Count, 1)
  }
}

export const handler = middy()
  .handler(lambdaHander)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
