/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { CognitoJwtVerifier } from 'aws-jwt-verify'
import { CognitoIdentityProviderClient, GetUserCommand, type GetUserCommandInput } from '@aws-sdk/client-cognito-identity-provider' // ES Modules import
import middy from '@middy/core'
import { type Context } from 'aws-lambda'
import { GetSchemaCommand, VerifiedPermissionsClient, type IsAuthorizedCommandInput, IsAuthorizedCommand, Decision } from '@aws-sdk/client-verifiedpermissions'
import { queryToActionAuth } from './authorization-helper'

const SERVICE_NAME = 'authorization-check'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const { USER_POOL_ID, USER_POOL_CLIENT_ID, POLICY_STORE_ID, VALIDATION_REGEX } = process.env
if (VALIDATION_REGEX === undefined || VALIDATION_REGEX === null) {
  logger.error('VALIDATION_REGEX is not set')
  throw new Error('VALIDATION_REGEX is not set')
}
if (USER_POOL_ID === undefined || USER_POOL_ID === null) {
  logger.error('USER_POOL_ID is not set')
  throw new Error('USER_POOL_ID is not set')
}
if (USER_POOL_CLIENT_ID === undefined || USER_POOL_CLIENT_ID === null) {
  logger.error('USER_POOL_CLIENT_ID is not set')
  throw new Error('USER_POOL_CLIENT_ID is not set')
}
const regex = new RegExp(VALIDATION_REGEX)

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'access'
})

const verifiedpermissions = tracer.captureAWSv3Client(new VerifiedPermissionsClient())
const cognitoIdp = tracer.captureAWSv3Client(new CognitoIdentityProviderClient())

let schema: Record<string, unknown>

const lambdaHandler = async (event: any, context: Context): Promise<any> => {
  logger.debug('AuthorizationCheckEventTriggered', { event })
  if (schema === undefined || schema === null || Object.keys(schema).length === 0) {
    logger.debug('AVP Schema not yet cached. Retrieving AVP Schema')
    const schemaResponse = await verifiedpermissions.send(new GetSchemaCommand({ policyStoreId: POLICY_STORE_ID }))
    if (schemaResponse.schema !== undefined && schemaResponse.schema.length > 0) {
      schema = JSON.parse(schemaResponse.schema)
    } else {
      metrics.addMetric('AuthCheckFailed', MetricUnits.Count, 1)
      logger.error('Unable to locate AVP Schema. Unable to check auth')
      throw Error('Unable to locate AVP Schema. Unable to check auth')
    }
  }
  const tokenMatch = event.authorizationToken.match(regex)
  if (tokenMatch === undefined || tokenMatch === null) {
    return {
      isAuthorized: false
    }
  }
  // token is prefixed with AUTH see https://docs.aws.amazon.com/appsync/latest/devguide/security-authz.html#aws-lambda-authorization-create-new-auth-token
  const authorizationToken = tokenMatch[1] as string
  logger.info(`authorizationToken: ${authorizationToken}`)
  const jwtPayload = await jwtVerifier.verify(authorizationToken, {
    clientId: USER_POOL_CLIENT_ID,
    tokenUse: 'access'
  })
  logger.info(`jwtPayload: ${JSON.stringify(jwtPayload)}`)
  const accountId = await getUserAccountId(authorizationToken)
  const isAuthInput: IsAuthorizedCommandInput = {
    policyStoreId: POLICY_STORE_ID,
    principal: {
      entityId: jwtPayload.sub,
      entityType: 'GenAINewsletter::User'
    },
    action: {
      actionId: 'graphqlOperation',
      actionType: 'GenAINewsletter::Action'
    },
    resource: {
      entityType: 'GenAINewsletter::Operation',
      entityId: lowercaseFirstLetter(queryToActionAuth(event.requestContext.queryString as string))
    },
    entities: {
      entityList: [
        {
          identifier: {
            entityType: 'GenAINewsletter::User',
            entityId: jwtPayload.sub
          },
          attributes: {
            Account: {
              entityIdentifier: {
                entityType: 'GenAINewsletter::Account',
                entityId: accountId
              }
            }
          }
        },
        {
          identifier: {
            entityType: 'GenAINewsletter::Operation',
            entityId: lowercaseFirstLetter(queryToActionAuth(event.requestContext.queryString as string))
          }
        }
      ]
    }

  }
  const command = new IsAuthorizedCommand(isAuthInput)
  const response = await verifiedpermissions.send(command)
  logger.debug('AVP REQUEST/RESPONSE', {
    request: isAuthInput,
    response
  })

  if (response.decision === Decision.ALLOW.toString()) {
    metrics.addMetric('AuthCheckPassed', MetricUnits.Count, 1)
    logger.debug('Authorized')
    return {
      isAuthorized: true,
      resolverContext: {
        accountId,
        userId: jwtPayload.sub,
        requestContext: JSON.stringify(event.requestContext)
      }
    }
  } else {
    metrics.addMetric('AuthCheckFailed', MetricUnits.Count, 1)
    logger.debug('Not Authorized')
    return {
      isAuthorized: false,
      resolverContext: {
        accountId,
        userId: jwtPayload.sub,
        requestContext: JSON.stringify(event.requestContext)
      }
    }
  }
}

const getUserAccountId = async (authorizationToken: string): Promise<string> => {
  logger.debug('getting accountId for authToken', { authorizationToken })
  const input: GetUserCommandInput = {
    AccessToken: authorizationToken
  }
  const command = new GetUserCommand(input)
  const response = await cognitoIdp.send(command)
  if (response.UserAttributes !== undefined && response.UserAttributes.length > 0) {
    for (const attribute of response.UserAttributes) {
      if (attribute.Name === 'custom:Account' && attribute.Value !== undefined) {
        return attribute.Value
      }
    }
  }
  throw new Error('Unable to locate accountId in User Attributes')
}

const lowercaseFirstLetter = (stringVal: string): string => {
  return stringVal.charAt(0).toLowerCase() + stringVal.slice(1)
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
