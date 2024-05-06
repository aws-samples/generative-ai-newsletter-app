/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import { v4 as uuidv4 } from 'uuid'
import {
  DynamoDBClient,
  PutItemCommand,
  type PutItemCommandInput
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import {
  PinpointClient,
  UpdateEndpointCommand,
  type UpdateEndpointCommandInput
} from '@aws-sdk/client-pinpoint'
import {
  CognitoIdentityProviderClient,
  type ListUsersCommandInput,
  ListUsersCommand
} from '@aws-sdk/client-cognito-identity-provider'
import { SubscriberType } from '../shared/common'

const SERVICE_NAME = 'user-subscriber'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())
const pinpoint = tracer.captureAWSv3Client(new PinpointClient())
const cognitoIdp = tracer.captureAWSv3Client(
  new CognitoIdentityProviderClient()
)

interface UserSubscriberInput {
  newsletterId: string
}

interface CognitoUserSubscriberInput extends UserSubscriberInput {
  cognitoUserId: string
  accountId: string
  externalUserId: never
  userEmail: never
}

interface ExternalUserSubscriberInput extends UserSubscriberInput {
  cognitoUserId: never
  accountId: never
  userEmail: string
  externalUserId?: string
}

// TODO: Try/Catch with Rollback if failed to prevent bad data

const lambdaHandler = async (
  event: CognitoUserSubscriberInput | ExternalUserSubscriberInput
): Promise<boolean> => {
  logger.debug('Starting User Subscriber', { event })
  if (event.cognitoUserId !== undefined) {
    const userEmail = await getCognitoUserEmail(event.cognitoUserId)
    const subscriberType = SubscriberType.COGNITO_SUBSCRIBER
    await subscribeCognitoUser(event.newsletterId, event.cognitoUserId, event.accountId)
    await addPinpointEndpoint(event.cognitoUserId, userEmail, subscriberType)
  } else if (event.userEmail !== undefined) {
    const subscriberType = SubscriberType.EXTERNAL_SUBSCRIBER
    const externalUserId = await subscribeExternalUser(
      event.newsletterId,
      event.userEmail,
      event.externalUserId
    )
    await addPinpointEndpoint(externalUserId, event.userEmail, subscriberType)
  }
  return true
}

const subscribeCognitoUser = async (
  newsletterId: string,
  cognitoUserId: string,
  accountId: string
): Promise<void> => {
  logger.debug('Subscribing Cognito User', { newsletterId, accountId, cognitoUserId })
  try {
    const input: PutItemCommandInput = {
      TableName: NEWSLETTER_TABLE,
      Item: marshall({
        newsletterId,
        sk: 'subscriber#' + cognitoUserId,
        accountId
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

const subscribeExternalUser = async (
  newsletterId: string,
  userEmail: string,
  externalUserId: string | undefined
): Promise<string> => {
  logger.debug('Subscribing external user to newsletter', {
    newsletterId,
    externalUserId
  })
  if (externalUserId === undefined) {
    externalUserId = uuidv4()
    logger.debug('Generated external user id', { externalUserId })
  }
  try {
    const input: PutItemCommandInput = {
      TableName: NEWSLETTER_TABLE,
      Item: marshall({
        newsletterId,
        sk: 'subscriber-external#' + externalUserId,
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
  const input: ListUsersCommandInput = {
    UserPoolId: COGNITO_USER_POOL_ID,
    Limit: 1,
    Filter: `"sub" = "${cognitoUserId}"`
  }
  const command = new ListUsersCommand(input)
  const response = await cognitoIdp.send(command)
  if (response.Users === undefined) {
    logger.error('Error getting Cognito User Email', { response })
    tracer.addErrorAsMetadata(new Error('Error getting Cognito User Email'))
    throw new Error('Error getting Cognito User Email')
  }
  if (
    response.Users.length === 1 &&
    response.Users[0].Attributes !== undefined
  ) {
    for (const attribute of response.Users[0].Attributes) {
      if (attribute.Name === 'email' && attribute.Value !== undefined) {
        return attribute.Value
      }
    }
  }
  logger.error('Error getting Cognito User Email', { response })
  tracer.addErrorAsMetadata(new Error('Error getting Cognito User Email'))
  throw new Error('Error getting Cognito User Email')
}

const addPinpointEndpoint = async (
  userId: string,
  userEmail: string,
  subscriberType: SubscriberType
): Promise<void> => {
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
