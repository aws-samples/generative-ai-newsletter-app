import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import { v4 as uuidv4 } from 'uuid'
import { DynamoDBClient, PutItemCommand, type PutItemCommandInput } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { PinpointClient, UpdateEndpointCommand, type UpdateEndpointCommandInput } from '@aws-sdk/client-pinpoint'
import { AdminGetUserCommand, CognitoIdentityProviderClient, type AdminGetUserCommandInput } from '@aws-sdk/client-cognito-identity-provider'
import { SubscriberType } from '../types/newsletter-generator'

const SERVICE_NAME = 'user-subscriber'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())
const pinpoint = tracer.captureAWSv3Client(new PinpointClient())
const cognitoIdp = tracer.captureAWSv3Client(new CognitoIdentityProviderClient())

interface UserSubscriberInput {
  newsletterId: string
}

interface CognitoUserSubscriberInput extends UserSubscriberInput {
  cognitoUserId: string
  externalUserId: never
  userEmail: never
}

interface ExternalUserSubscriberInput extends UserSubscriberInput {
  cognitoUserId: never
  userEmail: string
  externalUserId?: string
}

// TODO: Try/Catch with Rollback if failed to prevent bad data

const lambdaHandler = async (event: CognitoUserSubscriberInput | ExternalUserSubscriberInput): Promise<boolean> => {
  logger.debug('Starting User Subscriber', { event })
  if (event.cognitoUserId !== undefined) {
    const userEmail = await getCognitoUserEmail(event.cognitoUserId)
    const subscriberType = SubscriberType.COGNITO_SUBSCRIBER
    await subscribeCognitoUser(event.newsletterId, event.cognitoUserId)
    await addPinpointEndpoint(event.cognitoUserId, userEmail, subscriberType)
  } else if (event.userEmail !== undefined) {
    const subscriberType = SubscriberType.EXTERNAL_SUBSCRIBER
    const externalUserId = await subscribeExternalUser(event.newsletterId, event.userEmail, event.externalUserId)
    await addPinpointEndpoint(externalUserId, event.userEmail, subscriberType)
  }
  return true
}

const subscribeCognitoUser = async (newsletterId: string, cognitoUserId: string): Promise<void> => {
  logger.debug('Subscribing Cognito User', { newsletterId, cognitoUserId })
  try {
    const input: PutItemCommandInput = {
      TableName: NEWSLETTER_TABLE,
      Item: marshall({
        newsletterId,
        compoundSortKey: 'subscriber#' + cognitoUserId
      })
    }
    const command = new PutItemCommand(input)
    await dynamodb.send(command)
    metrics.addMetric('UserSubscribed', MetricUnits.Count, 1)
    metrics.addMetric('CognitoUserSubscribed', MetricUnits.Count, 1)
  } catch (error) {
    logger.error('Error subscribing Cognito User', { error })
    tracer.addErrorAsMetadata(error as Error)
    throw new Error('Error subscribing Cognito User')
  }
}

const subscribeExternalUser = async (newsletterId: string, userEmail: string, externalUserId: string | undefined): Promise<string> => {
  logger.debug('Subscribing external user to newsletter', { newsletterId, externalUserId })
  if (externalUserId === undefined) {
    externalUserId = uuidv4()
    logger.debug('Generated external user id', { externalUserId })
  }
  try {
    const input: PutItemCommandInput = {
      TableName: NEWSLETTER_TABLE,
      Item: marshall({
        newsletterId,
        compoundSortKey: 'subscriber-external#' + externalUserId,
        userEmail
      })
    }
    const command = new PutItemCommand(input)
    await dynamodb.send(command)
    metrics.addMetric('UserSubscribed', MetricUnits.Count, 1)
    metrics.addMetric('ExternalUserSubscribed', MetricUnits.Count, 1)
  } catch (error) {
    logger.error('Error subscribing external user to newsletter', { error })
    tracer.addErrorAsMetadata(error as Error)
    throw new Error('Error subscribing external user to newsletter')
  }
  return externalUserId
}

const getCognitoUserEmail = async (cognitoUserId: string): Promise<string> => {
  logger.debug('Getting Cognito User Email', { cognitoUserId })
  const input: AdminGetUserCommandInput = {
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: cognitoUserId
  }
  const command = new AdminGetUserCommand(input)
  const response = await cognitoIdp.send(command)
  if (response.UserAttributes !== undefined) {
    const userEmail = response.UserAttributes.find(attribute => attribute.Name === 'email')
    if (userEmail?.Value !== undefined) {
      return userEmail.Value
    }
  }
  logger.error('Error getting Cognito User Email', { response })
  tracer.addErrorAsMetadata(new Error('Error getting Cognito User Email'))
  throw new Error('Error getting Cognito User Email')
}

const addPinpointEndpoint = async (userId: string, userEmail: string, subscriberType: SubscriberType): Promise<void> => {
  console.debug('Adding Pinpoint Endpoint', { userId, userEmail })
  const input: UpdateEndpointCommandInput = {
    ApplicationId: PINPOINT_APP_ID,
    EndpointId: userId,
    EndpointRequest: {
      Address: userEmail,
      ChannelType: 'EMAIL',
      Attributes: {
        SubscriberType: [subscriberType]
      }
    }
  }
  const command = new UpdateEndpointCommand(input)
  await pinpoint.send(command)
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
