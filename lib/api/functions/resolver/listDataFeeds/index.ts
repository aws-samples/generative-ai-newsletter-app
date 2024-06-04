import { type Context, util } from '@aws-appsync/utils'

export function request (ctx: Context): any {
  const input = ctx.args.input
  ctx.stash.root = 'DataFeeds'
  if (
    input === undefined ||
    (input.includeOwned === undefined &&
      input.includeShared === undefined &&
      input.includeDiscoverable === undefined)
  ) {
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
    items: ctx.result?.items ?? []
  }
}
