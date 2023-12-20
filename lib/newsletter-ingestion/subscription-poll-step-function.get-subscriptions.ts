import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import { DynamoDBClient, QueryCommand, type QueryCommandInput } from '@aws-sdk/client-dynamodb'

const SERVICE_NAME = 'get-subscriptions'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())

const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE
const NEWSLETTER_TABLE_TYPE_INDEX = process.env.NEWSLETTER_TABLE_TYPE_INDEX

interface SubscriptionsData {
  subscriptions: string[]
  success: boolean
}

const lambdaHandler = async (): Promise<SubscriptionsData> => {
  logger.debug('Getting all subscriptions')
  try {
    const input: QueryCommandInput = {
      TableName: NEWSLETTER_TABLE,
      IndexName: NEWSLETTER_TABLE_TYPE_INDEX,
      KeyConditionExpression: '#type = :type',
      FilterExpression: '#enabled = :enabled',
      ExpressionAttributeNames: {
        '#type': 'type',
        '#enabled': 'enabled'
      },
      ExpressionAttributeValues: {
        ':type': { S: 'subscription' },
        ':enabled': { BOOL: true }
      }
    }
    const command = new QueryCommand(input)
    const response = await dynamodb.send(command)
    if (response.Items === undefined) {
      throw new Error('No subscriptions found')
    }
    logger.debug('Subscriptions Found: ' + response.Items.length)
    const subscriptions: string[] = []
    for (const item of response.Items) {
      if (item.subscriptionId?.S !== undefined) {
        metrics.addMetric('SubscriptionsToPoll', MetricUnits.Count, 1)
        subscriptions.push(item.subscriptionId.S)
      }
    }
    console.debug('Subscriptions: ' + subscriptions.length)
    return {
      subscriptions,
      success: true
    }
  } catch (error) {
    logger.error('Error getting subscriptions: ', { error })
    return {
      subscriptions: [],
      success: false
    }
  }
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
