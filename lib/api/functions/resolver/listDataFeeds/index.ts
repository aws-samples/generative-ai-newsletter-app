import { type Context, util, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import { type ListDataFeedsInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  const identity = ctx.identity as AppSyncIdentityCognito
  const input = ctx.args.input as ListDataFeedsInput
  if (identity?.sub === undefined) {
    util.unauthorized()
  }
  if (input === undefined || (input.includeOwned === undefined && input.includeShared === undefined && input.includeDiscoverable === undefined)) {
    ctx.stash.lookupDefinition = {
      includeOwned: true,
      includeShared: false,
      includeDiscoverable: false
    }
  } else {
    ctx.stash.lookupDefinition = {
      includeOwned: input.includeOwned ?? false,
      includeShared: input.includeShared ?? false,
      includeDiscoverable: input.includeDiscoverable ?? false
    }
  }
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    nextToken: ctx.result?.nextToken,
    dataFeeds: ctx.result?.items
  }
}
