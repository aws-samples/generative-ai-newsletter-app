import {
  type Context,
  util,
  type DynamoDBGetItemRequest,
  type AppSyncIdentityLambda
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBGetItemRequest {
  const identity = ctx.identity as AppSyncIdentityLambda
  const { id } = ctx.args.input
  return ddb.get({
    key: {
      newsletterId: id,
      sk: 'subscriber#' + identity.resolverContext.userId
    }
  })
}

export const response = (ctx: Context): any => {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  if (ctx.result !== undefined) {
    return true
  } else {
    return false
  }
}
