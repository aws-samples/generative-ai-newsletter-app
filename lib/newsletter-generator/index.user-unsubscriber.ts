import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import {
  DeleteItemCommand,
  type DeleteItemCommandInput,
  DynamoDBClient,
  type QueryCommandInput,
  QueryCommand
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

const SERVICE_NAME = 'user-unsubscriber'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())

interface UserUnsubscriberInput {
  newsletterId: string
}

interface CognitoUserUnsubscriberInput extends UserUnsubscriberInput {
  cognitoUserId: string
  externalUserId: never
  userEmail: never
}

interface ExternalUserUnsubscriberInput extends UserUnsubscriberInput {
  cognitoUserId: never
  userEmail: string
  externalUserId?: string
}

// TODO: Try/Catch with Rollback if failed to prevent bad data

const lambdaHandler = async (
  event: CognitoUserUnsubscriberInput | ExternalUserUnsubscriberInput
): Promise<boolean> => {
  logger.debug('Starting User Unsubscriber', { event })
  if (event.cognitoUserId !== undefined) {
    await unsubscribeCognitoUser(event.newsletterId, event.cognitoUserId)
  } else if (event.userEmail !== undefined) {
    await unsubscribeExternalUser(event.newsletterId, event.userEmail)
  }
  return true
}

const unsubscribeCognitoUser = async (
  newsletterId: string,
  cognitoUserId: string
): Promise<void> => {
  logger.debug('Unsubscribing Cognito User', { newsletterId, cognitoUserId })
  try {
    const input: DeleteItemCommandInput = {
      TableName: NEWSLETTER_TABLE,
      Key: marshall({
        newsletterId,
        sk: 'subscriber#' + cognitoUserId
      })
    }
    const command = new DeleteItemCommand(input)
    await dynamodb.send(command)
    metrics.addMetric('UserUnsubscribed', MetricUnits.Count, 1)
    metrics.addMetric('CognitoUserUnsubscribed', MetricUnits.Count, 1)
  } catch (error) {
    logger.error('Error unsubscribing Cognito User', { error })
    tracer.addErrorAsMetadata(error as Error)
    throw new Error('Error unsubscribing Cognito User')
  }
}

const unsubscribeExternalUser = async (
  newsletterId: string,
  userEmail: string
): Promise<void> => {
  logger.debug('Unsubscribing external user to newsletter', {
    newsletterId,
    userEmail
  })
  try {
    const externalUserId = await getExternalSubscriberUser(
      newsletterId,
      userEmail
    )
    if (externalUserId === undefined) {
      const input: DeleteItemCommandInput = {
        TableName: NEWSLETTER_TABLE,
        Key: marshall({
          newsletterId,
          compoundSortKey: 'subscriber-external#' + externalUserId
        })
      }
      const command = new DeleteItemCommand(input)
      await dynamodb.send(command)
      metrics.addMetric('UserUnsubscribed', MetricUnits.Count, 1)
      metrics.addMetric('ExternalUserUnsubscribed', MetricUnits.Count, 1)
    }
  } catch (error) {
    logger.error('Error unsubscribing external user from newsletter', {
      error
    })
    tracer.addErrorAsMetadata(error as Error)
    throw new Error('Error unsubscribing external user from newsletter')
  }
}

const getExternalSubscriberUser = async (
  newsletterId: string,
  userEmail: string
): Promise<string | undefined> => {
  logger.debug('Getting external subscriber user', {
    newsletterId,
    userEmail
  })
  try {
    const input: QueryCommandInput = {
      TableName: NEWSLETTER_TABLE,
      KeyConditionExpression:
        '#newsletterId = :newsletterId AND begins_with(#sk, :sk)',
      FilterExpression: '#userEmail = :userEmail',
      ExpressionAttributeNames: {
        '#newsletterId': 'newsletterId',
        '#sk': 'compoundSortKey',
        '#userEmail': 'userEmail'
      },
      ExpressionAttributeValues: {
        ':newsletterId': { S: newsletterId },
        ':sk': { S: 'subscriber-external#' },
        ':userEmail': { S: userEmail }
      }
    }
    const command = new QueryCommand(input)
    const response = await dynamodb.send(command)
    if (
      response.Items?.length === 1 &&
      response.Items[0].compoundSortKey.S !== undefined
    ) {
      return response.Items[0].compoundSortKey.S.split('#')[1]
    }
  } catch (error) {
    logger.error('Error getting external subscriber user', { error })
    tracer.addErrorAsMetadata(error as Error)
    throw new Error('Error getting external subscriber user')
  }
  return undefined
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
