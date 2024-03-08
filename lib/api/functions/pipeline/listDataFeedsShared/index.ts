import {
  type Context,
  util,
  runtime,
  type DynamoDBQueryRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { type ListDataFeedsInput } from 'lib/shared/api'

export function request (ctx: Context): DynamoDBQueryRequest {
  const dataFeedTypeIndex = 'type-index' // TODO - Make ENV variable
  const input = ctx.args.input as ListDataFeedsInput
  const includeShared = input?.includeShared !== undefined ? input.includeShared : ctx.stash.lookupDefinition.includeShared ?? false
  if (includeShared === false) {
    runtime.earlyReturn(ctx.prev.result)
  }
  const { nextToken, limit = 1000 } = ctx.args
  return ddb.query({
    query: { sk: { eq: 'dataFeed' } },
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
