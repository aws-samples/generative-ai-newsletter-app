import {
  type Context,
  util,
  type DynamoDBGetItemRequest,
  type AppSyncIdentityCognito
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBGetItemRequest {
  const identity = ctx.identity as AppSyncIdentityCognito
  const { newsletterId } = ctx.args.input
  // const accountId = identity.claims['custom:Account'] ?? ctx.stash.accountId
  return ddb.get({
    key: {
      newsletterId,
      sk: 'subscriber#' + identity.sub
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
