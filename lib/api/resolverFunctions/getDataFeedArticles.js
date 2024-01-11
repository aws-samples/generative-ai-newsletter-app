import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx) {
  const { nextToken,limit = 50 } = ctx.args
  const { subscriptionId } = ctx.args.input
  return ddb.query({
    query: {
      subscriptionId: { eq: subscriptionId },
      compoundSortKey: {beginsWith: 'article'}
    },
    limit,
    nextToken
  })
}

export function response(ctx) {
  if(ctx.error){
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    dataFeedArticles: ctx.result.items,
    nextToken: ctx.result.nextToken,
  }
}
