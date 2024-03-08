import {
  type Context,
  util,
  runtime,
  type DynamoDBQueryRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { type ListNewslettersInput } from 'lib/shared/api'

export function request (ctx: Context): DynamoDBQueryRequest {
  // const { tableSKIndex } = ctx.env
  const tableSKIndex = 'newsletter-item-type-index' // CDK doesn't have env variables yet
  const { nextToken, limit = 500 } = ctx.args
  const input = ctx.args.input as ListNewslettersInput
  const includeShared = input?.includeShared !== undefined ? input.includeShared : ctx.stash.lookupDefinition.includeShared ?? false
  if (includeShared === true) {
    return ddb.query({
      query: {
        sk: { eq: 'newsletter' }
      },
      filter: {
        sharedWith: { contains: ctx.stash.accountId }
      },

      index: tableSKIndex,
      limit,
      nextToken,
      select: 'ALL_ATTRIBUTES'
    })
  } else {
    runtime.earlyReturn(ctx.prev.result)
  }
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
