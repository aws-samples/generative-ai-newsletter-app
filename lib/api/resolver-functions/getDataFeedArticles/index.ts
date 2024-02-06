import { type Context, type DynamoDBQueryRequest, util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBQueryRequest {
  const { nextToken, limit = 500 } = ctx.args
  const { subscriptionId } = ctx.args.input
  return ddb.query({
    query: {
      subscriptionId: { eq: subscriptionId },
      compoundSortKey: { beginsWith: 'article' }
    },
    limit,
    nextToken
  })
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    dataFeedArticles: ctx.result.items,
    nextToken: ctx.result.nextToken
  }
}
