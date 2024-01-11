import {util}  from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb';
const newsSubscriptionTableTypeIndex = 'type-index'

export function request (ctx) {
  const { nextToken, limit = 50 } = ctx.args
  return ddb.query({
    query: {compoundSortKey:{eq:'subscription'}},
    index: newsSubscriptionTableTypeIndex,
    limit,
    nextToken,
    select: 'ALL_ATTRIBUTES'
  })
}

export function response (ctx) {
  if(ctx.error){
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    subscriptions: ctx.result.items,
    nextToken: ctx.result.nextToken,
  }
}
