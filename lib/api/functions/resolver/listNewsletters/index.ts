import { type Context, util, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import { type ListNewslettersInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  console.log('[listNewslettersResolverRequest]', { ctx })
  const identity = ctx.identity as AppSyncIdentityCognito
  const input = ctx.args.input as ListNewslettersInput
  if (identity?.sub === undefined) {
    util.unauthorized()
  }
  if (input === undefined || (input.includeDiscoverable === undefined && input.includeOwned === undefined && input.includeShared === undefined)) {
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

  return {}
}

export function response (ctx: Context): any {
  console.log('[listNewslettersResolverResponse]', { ctx })
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    nextToken: ctx.result.nextToken,
    newsletters: ctx.result.items
  }
}
