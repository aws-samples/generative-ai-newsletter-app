/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { VerifiedPermissionsClient, Decision, GetSchemaCommand, type EntityItem, type EntitiesDefinition, type BatchIsAuthorizedInput, BatchIsAuthorizedCommand, type BatchIsAuthorizedOutput } from '@aws-sdk/client-verifiedpermissions'
import { type Context } from 'aws-lambda'
import middy from '@middy/core'
import { ResolverPermissions } from '../shared/api/schema-to-avp/resolver-authorizations'
import { type ReadActionStatement, UpdateActionStatement } from 'lib/shared/api/schema-to-avp'
import { type ListFilterAuthInput } from '../shared/common/types'

const SERVICE_NAME = 'list-auth-filter'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const verifiedpermissions = tracer.captureAWSv3Client(new VerifiedPermissionsClient())

const POLICY_STORE_ID = process.env.POLICY_STORE_ID
const USER_POOL_ID = process.env.USER_POOL_ID
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID

if (USER_POOL_ID === undefined || USER_POOL_ID == null) {
  throw Error('USER_POOL_ID is not set!')
}
if (POLICY_STORE_ID === undefined || POLICY_STORE_ID == null) {
  throw Error('POLICY_STORE_ID is not set!')
}
if (USER_POOL_CLIENT_ID === undefined || USER_POOL_CLIENT_ID == null) {
  throw Error('USER_POOL_CLIENT_ID is not set!')
}

let schema: Record<string, unknown>

const listFilterAuthorization = async (input: ListFilterAuthInput, context: Context): Promise<any> => {
  logger.debug('listFilterAuthorization called', { input, context })
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
  const { user, resolverName } = input
  const { data } = input

  const resolverPermissions = new ResolverPermissions()
  const resolverStatement = resolverPermissions.getResolverPermission(resolverName)
  if (resolverStatement === undefined) {
    logger.error('Unable to locate resolver statement for resolver', { resolverName })
    throw Error('Unable to locate resolver statement for resolver')
  }
  logger.debug('ResolverActionStatement', { resolverStatement })
  let action: ReadActionStatement
  if (resolverStatement instanceof UpdateActionStatement) {
    action = resolverStatement.readActionStatement
  } else {
    action = resolverStatement
  }

  if (data.items === undefined || data.items === null) {
    return
  }
  const dataArray = data.items as Array<Record<string, any>>
  logger.debug('Resource Data Array', { dataArray })

  metrics.addMetric('AuthCheckRequested', MetricUnits.Count, 1)
  const requests = []
  const entities: EntitiesDefinition = {
    entityList: [
      {
        identifier: {
          entityType: 'GenAINewsletter::user',
          entityId: user.userId
        },
        attributes: {
          account: {
            entityIdentifier: {
              entityId: user.accountId,
              entityType: 'GenAINewsletter::account'
            }
          }
        }
      }
    ]
  }
  const chunkArray = (array: any[], chunkSize: number): Array<Array<Record<string, any>>> => {
    return Array.from(
      { length: Math.ceil(array.length / chunkSize) },
      (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize)
    )
  }
  // Filter out duplicate records before
  const uniqueDataArray = dataArray.filter((item, index, self) => {
    return index === self.findIndex((t) => t[action.resourceId] === item[action.resourceId])
  })

  const approvedData = []
  // Breaking up batch request into max of 30 per request
  const chunks = chunkArray(uniqueDataArray, 30)
  for (const chunk of chunks) {
    for (const item of chunk) {
      logger.debug('Adding Resource for check', { item, action, user })
      requests.push({
        principal: {
          entityId: user.userId,
          entityType: 'GenAINewsletter::user'
        },
        action: {
          actionId: action.actionId,
          actionType: 'GenAINewsletter::Action'
        },
        resource: {
          entityType: `GenAINewsletter::${action.resourceType}`,
          entityId: item[action.resourceId]
        }
      })
      logger.debug('Adding entity for resource', { item, resourceId: action.resourceId })
      if (item !== undefined) {
        const entityItem = action.getEntityItem(schema, item[action.resourceId] as string, action.resourceType, item) satisfies EntityItem
        if (entityItem.attributes !== undefined) {
          for (const [attributeKey, attributeData] of Object.entries(entityItem.attributes)) {
            if (attributeData.entityIdentifier !== undefined) {
              entities.entityList.push({
                identifier: {
                  entityType: `GenAINewsletter::${attributeKey}`,
                  entityId: attributeData.entityIdentifier.entityId
                }
              })
            }
          }
        }
        entities.entityList.push(entityItem)
      }
    }
    const isAuthInput: BatchIsAuthorizedInput = {
      policyStoreId: POLICY_STORE_ID,
      requests,
      entities
    }
    const command = new BatchIsAuthorizedCommand(isAuthInput)
    logger.debug('Sending BatchIsAuthorizedCommand', { isAuthInput })
    const response: BatchIsAuthorizedOutput = await verifiedpermissions.send(command)
    logger.debug('isAuthorizedCommand response', { response })
    if (response.results === undefined || response.results.length !== requests.length) {
      logger.error('Response results length does not match requests length')
      throw Error('Response results length does not match requests length')
    }

    for (const result of response.results) {
      if (result.decision === Decision.ALLOW) {
        approvedData.push(dataArray.find((item) => {
          return item[action.resourceId] === result.request?.resource?.entityId
        }))
      }
    }
  }
  const returnData = {
    items: approvedData,
    nextToken: data.nextToken
  }
  logger.debug('Approved Data to be Returned', { returnData })
  return returnData
}

export const handler = middy()
  .handler(listFilterAuthorization)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
