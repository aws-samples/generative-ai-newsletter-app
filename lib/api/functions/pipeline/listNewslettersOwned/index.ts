import {
  type Context,
  util,
  runtime,
  type DynamoDBQueryRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { type ListNewslettersInput } from 'lib/shared/api'

export function request (ctx: Context): DynamoDBQueryRequest {
  console.log('STASH======' + ctx.stash.accountId)
  // const { tableSKIndex } = ctx.env
  const tableSKIndex = 'newsletter-item-type-index' // CDK doesn't have env variables yet
  const { nextToken, limit = 1000 } = ctx.args
  const input = ctx.args.input as ListNewslettersInput
  const includeOwned = input?.includeOwned !== undefined ? input.includeOwned : ctx.stash.lookupDefinition.includeOwned ?? false as boolean
  if (includeOwned === true) {
    console.log('[listNewslettersOwned] includedOwned === true')
    return ddb.query({
      query: {
        sk: { eq: 'newsletter' },
        accountId: { eq: ctx.stash.accountId }
      },
      index: tableSKIndex,
      limit,
      nextToken,
      select: 'ALL_ATTRIBUTES'
    })
  } else {
    console.log('[listNewsletters] includedOwned === false')
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
