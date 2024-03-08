import {
  type Context,
  util,
  type DynamoDBQueryRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { type ListDataFeedsInput } from 'lib/shared/api'
const dataFeedTypeIndex = 'type-index' // TODO - Make ENV variable

export function request (ctx: Context): DynamoDBQueryRequest {
  const input = ctx.args.input as ListDataFeedsInput
  const includeOwned = input?.includeOwned !== undefined ? input.includeOwned : ctx.stash.lookupDefinition.includeOwned ?? true
  if (includeOwned === false) {
    runtime.earlyReturn(ctx.prev.result)
  }
  const { nextToken, limit = 1000 } = ctx.args
  return ddb.query({
    query: {
      sk: { eq: 'dataFeed' },
      accountId: { eq: ctx.stash.accountId }
    },
    index: dataFeedTypeIndex,
    limit,
    nextToken,
    select: 'ALL_ATTRIBUTES'
  })
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  if (ctx.prev?.result?.items !== undefined) {
    ctx.result.items.push(...ctx.prev.result.items)
  }

  return ctx.result
}
