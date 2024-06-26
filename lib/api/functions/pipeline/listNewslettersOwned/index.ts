import {
  type Context,
  util,
  runtime,
  type DynamoDBQueryRequest,
  type AppSyncIdentityLambda
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import {
  addAccountToItems,
  convertFieldIdsToObjectIds,
  filterForDuplicatesById
} from '../../resolver-helper'

export function request (ctx: Context): DynamoDBQueryRequest {
  const identity = ctx.identity as AppSyncIdentityLambda
  const tableSKIndex = 'newsletter-item-type-index' // CDK doesn't have env variables yet
  const { nextToken, limit = 1000 } = ctx.args
  const input = ctx.args.input
  const includeOwned =
    input?.includeOwned !== undefined
      ? input.includeOwned
      : ctx.stash.lookupDefinition.includeOwned ?? (false as boolean)
  if (includeOwned === true) {
    return ddb.query({
      query: {
        sk: { eq: 'newsletter' },
        accountId: { eq: identity.resolverContext.accountId }
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
  let result = ctx.result
  result = addAccountToItems(result)
  result = convertFieldIdsToObjectIds(result, 'newsletterId')
  if (ctx.prev?.result?.items !== undefined && result.items !== undefined) {
    result.items.push(...ctx.prev.result.items)
  } else if (ctx.prev?.result?.items !== undefined) {
    result.items = [...ctx.prev.result.items]
  }
  if (result.items !== undefined) {
    result = filterForDuplicatesById(result)
  }
  return {
    items: result.items
  }
}
