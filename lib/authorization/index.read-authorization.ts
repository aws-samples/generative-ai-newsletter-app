/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'

// import { getEntityItem } from '../shared/api/schema-to-avp/permission-map'
import middy from '@middy/core'
import {
  GetSchemaCommand,
  VerifiedPermissionsClient,
  type IsAuthorizedCommandInput,
  IsAuthorizedCommand,
  Decision
} from '@aws-sdk/client-verifiedpermissions'
import {
  getEntityItem,
  lowercaseFirstLetter,
  queryToActionAuth,
  queryToResourceEntity
} from './authorization-helper'

const SERVICE_NAME = 'read-authorization'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const { POLICY_STORE_ID } = process.env
if (POLICY_STORE_ID === undefined || POLICY_STORE_ID === null) {
  logger.error('POLICY_STORE_ID is not set')
  throw new Error('POLICY_STORE_ID is not set')
}

const verifiedpermissions = tracer.captureAWSv3Client(
  new VerifiedPermissionsClient()
)

let schema: Record<string, unknown>

const lambdaHandler = async (event: any): Promise<any> => {
  logger.debug('AuthorizationCheckEventTriggered', { event })
  const root = event.root as string | undefined
  const contingentAction = event.contingentAction as string | undefined
  if (
    schema === undefined ||
    schema === null ||
    Object.keys(schema).length === 0
  ) {
    logger.debug('AVP Schema not yet cached. Retrieving AVP Schema')
    const schemaResponse = await verifiedpermissions.send(
      new GetSchemaCommand({ policyStoreId: POLICY_STORE_ID })
    )
    if (
      schemaResponse.schema !== undefined &&
      schemaResponse.schema.length > 0
    ) {
      logger.debug('AVP Schema', { schema: schemaResponse.schema })
      schema = JSON.parse(schemaResponse.schema)
    } else {
      metrics.addMetric('AuthCheckFailed', MetricUnits.Count, 1)
      logger.error('Unable to locate AVP Schema. Unable to check auth')
      throw Error('Unable to locate AVP Schema. Unable to check auth')
    }
  }

  const queryString = event.requestContext.queryString as string
  const isAuthInput: IsAuthorizedCommandInput = {
    policyStoreId: POLICY_STORE_ID,
    principal: {
      entityId: event.userId,
      entityType: 'GenAINewsletter::User'
    },
    action: {
      actionId: lowercaseFirstLetter(
        contingentAction ?? queryToActionAuth(queryString)
      ),
      actionType: 'GenAINewsletter::Action'
    },
    resource: {
      entityType: `GenAINewsletter::${root ?? queryToResourceEntity(queryString)}`,
      entityId: event.result.id
    },
    entities: {
      entityList: [
        {
          identifier: {
            entityType: 'GenAINewsletter::User',
            entityId: event.userId
          },
          attributes: {
            Account: {
              entityIdentifier: {
                entityType: 'GenAINewsletter::Account',
                entityId: event.accountId
              }
            }
          }
        },
        getEntityItem(
          schema,
          event.result.id as string,
          root ?? queryToResourceEntity(queryString),
          event.result as Record<string, any>,
          { logger }
        )
      ]
    }
  }
  logger.debug('AVP REQUEST', {
    isAuthInput
  })
  const command = new IsAuthorizedCommand(isAuthInput)
  const response = await verifiedpermissions.send(command)
  logger.debug('AVP RESPONSE', {
    response
  })

  if (response.decision === Decision.ALLOW.toString()) {
    metrics.addMetric('AuthCheckPassed', MetricUnits.Count, 1)
    logger.debug('Authorized')
    return {
      isAuthorized: true,
      returnResult: event.result
    }
  } else {
    metrics.addMetric('AuthCheckFailed', MetricUnits.Count, 1)
    logger.debug('Not Authorized')
    return {
      isAuthorized: false
    }
  }
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
