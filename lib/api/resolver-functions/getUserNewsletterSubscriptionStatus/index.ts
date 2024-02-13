import {
  type Context,
  util,
  type DynamoDBGetItemRequest,
  type AppSyncIdentityCognito
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBGetItemRequest {
  const { newsletterId } = ctx.args.input
  if (
    ctx.identity === undefined ||
    ctx.identity === null ||
    Object.keys(ctx.identity).includes('sub')
  ) {
    util.error('No authorized identity found!')
  }
  const sub = (ctx.identity as AppSyncIdentityCognito).sub
  return ddb.get({
    key: {
      newsletterId,
      compoundSortKey: 'subscriber#' + sub
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
