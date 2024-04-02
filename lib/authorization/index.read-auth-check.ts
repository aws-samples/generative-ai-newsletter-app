import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { VerifiedPermissionsClient, Decision, IsAuthorizedCommand, GetSchemaCommand, type IsAuthorizedCommandInput } from '@aws-sdk/client-verifiedpermissions'
import { type Context } from 'aws-lambda'
import middy from '@middy/core'
import { ResolverPermissions } from '../shared/api/schema-to-avp/resolver-authorizations'
import { type ReadActionStatement, UpdateActionStatement } from 'lib/shared/api/schema-to-avp'
import { type ReadAuthCheckInput } from '../shared/common/types'

const SERVICE_NAME = 'read-auth-check'

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

const checkReadAuthorization = async (input: ReadAuthCheckInput, context: Context): Promise<{ isAuthorized: boolean }> => {
  logger.debug('checkReadAuthorization called', { input, context })
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
  const { user, resolverName, data } = input

  metrics.addMetric('AuthCheckRequested', MetricUnits.Count, 1)
  const resolverPermissions = new ResolverPermissions()
  const resolverStatement = resolverPermissions.getResolverPermission(resolverName)
  if (resolverStatement === undefined) {
    logger.error('Unable to locate resolver statement for resolver', { resolverName })
    throw Error('Unable to locate resolver statement for resolver')
  }
  let action: ReadActionStatement
  if (resolverStatement instanceof UpdateActionStatement) {
    action = resolverStatement.readActionStatement
  } else {
    action = resolverStatement
  }
  const isAuthInput: IsAuthorizedCommandInput = {
    policyStoreId: POLICY_STORE_ID,
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
      entityId: data[action.resourceId]
    },
    entities: {
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
        },
        action.getEntityItem(schema, data[action.resourceId] as string, action.resourceType, data)
      ]
    }

  }
  const command = new IsAuthorizedCommand(isAuthInput)
  logger.debug('Sending isAuthorizedCommand', { isAuthInput })
  const response = await verifiedpermissions.send(command)
  logger.debug('isAuthorizedCommand response', { response })
  if (response.decision === Decision.ALLOW.toString()) {
    logger.debug('AuthCheck succeeded', { response })
    metrics.addMetric('AuthCheckSucceeded', MetricUnits.Count, 1)
    return {
      isAuthorized: true
    }
  } else {
    logger.debug('AuthCheck failed', { response })
    metrics.addMetric('AuthCheckFailed', MetricUnits.Count, 1)
    return {
      isAuthorized: false
    }
  }
}

export const handler = middy()
  .handler(checkReadAuthorization)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
