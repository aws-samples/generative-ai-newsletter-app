import * as ddb from '@aws-appsync/utils/dynamodb'
import {
  type Context,
  type DynamoDBQueryRequest,
  util
} from '@aws-appsync/utils'

export function request (ctx: Context): DynamoDBQueryRequest {
  const { newsletterId } = ctx.args.input
  return ddb.query({
    query: {
      newsletterId: { eq: newsletterId },
      compoundSortKey: { beginsWith: 'subscriber#' }
    },
    consistentRead: false
  })
}

export function response (ctx: Context): any {
  if (ctx?.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  if (
    ctx.result === undefined ||
    ctx.result.items === undefined ||
    ctx.result.items.length < 1
  ) {
    return {
      subscriberCount: 0
    }
  } else {
    return {
      subscriberCount: ctx.result.items.length
    }
  }
}
