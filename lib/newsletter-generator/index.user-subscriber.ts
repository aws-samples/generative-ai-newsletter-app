import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import { type EndpointResponse, PinpointClient, GetUserEndpointsCommand, type GetUserEndpointsCommandInput, NotFoundException, type UpdateEndpointCommandInput, UpdateEndpointCommand } from '@aws-sdk/client-pinpoint'
import { AdminGetUserCommand, CognitoIdentityProviderClient, type AdminGetUserCommandInput } from '@aws-sdk/client-cognito-identity-provider'
import { v4 as uuidv4 } from 'uuid'

const SERVICE_NAME = 'user-subscriber'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const pinpoint = tracer.captureAWSv3Client(new PinpointClient())
const cognitoIdp = tracer.captureAWSv3Client(new CognitoIdentityProviderClient())

const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID

interface UserSubscriberInput {
  newsletterId: string
}

interface CognitoUserSubscriberInput extends UserSubscriberInput {
  cognitoUserId: string
  externalUserId: never
  userEmail: string
}

interface ExternalUserSubscriberInput extends UserSubscriberInput {
  cognitoUserId: never
  externalUserId: string
  userEmail: string
}

/**
 * TODO
 * Cognito User:
 *  1Check for Endpoint, if exists skip 2
 *  2Get Email Address from Cognito User
 *  3Update Endpoint in Pinpoint with new newsletterId in newsletter attribute. Need to include existing.
 */

const lambdaHandler = async (event: CognitoUserSubscriberInput | ExternalUserSubscriberInput): Promise<void> => {
  logger.debug('Starting User Subscriber', { event })
  const { newsletterId, cognitoUserId, externalUserId } = event
  let userEmail = event.userEmail
  const pinpointEndpoint = await getPinpointEndpoint(cognitoUserId ?? externalUserId)
  if (pinpointEndpoint === null) {
    const emailResponse = await getCognitoUserEmail(cognitoUserId)
    if (emailResponse !== null) {
      userEmail = emailResponse
    } else {
      throw new Error('No email address found for user')
    }
  }
  const existingNewsletterIds = pinpointEndpoint?.User?.UserAttributes?.newsletters ?? []
  const pinpointEndpointId = pinpointEndpoint?.Id ?? uuidv4()
  await updateEndpointNewsletters(pinpointEndpointId, newsletterId, existingNewsletterIds, userEmail)
}

const getPinpointEndpoint = async (userId: string): Promise<EndpointResponse | null> => {
  logger.debug('Getting Pinpoint Endpoint', { userId, pinpointAppId: PINPOINT_APP_ID })
  try {
    const input: GetUserEndpointsCommandInput = {
      ApplicationId: PINPOINT_APP_ID,
      UserId: userId
    }
    const command = new GetUserEndpointsCommand(input)
    const response = await pinpoint.send(command)
    if (response.EndpointsResponse?.Item !== undefined && response.EndpointsResponse.Item.length > 0) {
      for (const endpoint of response.EndpointsResponse.Item) {
        logger.debug('Pinpoint Endpoint found', { userId, pinpointAppId: PINPOINT_APP_ID, endpoint })
        if (endpoint.ChannelType === 'EMAIL') {
          return endpoint
        }
      }
      logger.debug('Pinpoint endpoints exist, but no EMAIL endpoint found')
      return null
    } else {
      logger.debug('No Pinpoint Endpoint found', { userId, pinpointAppId: PINPOINT_APP_ID })
      return null
    }
  } catch (error) {
    if (error instanceof NotFoundException) {
      logger.debug('No Pinpoint Endpoint found', { userId, pinpointAppId: PINPOINT_APP_ID })
      return null
    } else {
      throw error
    }
  }
}

const getCognitoUserEmail = async (cognitoUserId: string): Promise<string | null> => {
  logger.debug('Getting Cognito User Email', { cognitoUserId })
  const input: AdminGetUserCommandInput = {
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: cognitoUserId
  }
  const command = new AdminGetUserCommand(input)
  const response = await cognitoIdp.send(command)
  if (response.UserAttributes !== undefined) {
    for (const attribute of response.UserAttributes) {
      if (attribute.Name === 'email' && attribute.Value !== undefined) {
        return attribute.Value
      }
    }
  } else {
    throw new Error('No user attributes found')
  }
  return null
}

const updateEndpointNewsletters = async (endpointId: string, newsletterId: string, existingNewsletterIds: string[], userEmail: string): Promise<void> => {
  logger.debug('Subscribing User to Newsletter!', { endpointId, newsletterId })
  metrics.addMetric('NewsletterSubscriptions', MetricUnits.Count, 1)
  const subscribedNewsletters: string[] = []
  if (existingNewsletterIds.includes(newsletterId)) {
    subscribedNewsletters.push(...existingNewsletterIds)
  } else {
    subscribedNewsletters.push(...existingNewsletterIds, newsletterId)
  }
  const input: UpdateEndpointCommandInput = {
    ApplicationId: PINPOINT_APP_ID,
    EndpointId: endpointId,
    EndpointRequest: {
      ChannelType: 'EMAIL',
      Address: userEmail,
      User: {
        UserAttributes: {
          newsletters: subscribedNewsletters
        }
      }
    }
  }
  const command = new UpdateEndpointCommand(input)
  const response = await pinpoint.send(command)
  logger.debug('Endpoint updated', { endpointId, pinpointAppId: PINPOINT_APP_ID, response })
  if (response.$metadata.httpStatusCode === undefined || ![200, 202].includes(response.$metadata.httpStatusCode)) {
    metrics.addMetric('NewsletterSubscriptionsFailed', MetricUnits.Count, 1)
    throw new Error('Error subscribing user to newsletter')
  }
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
