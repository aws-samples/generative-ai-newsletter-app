import { type Context, util, type AppSyncIdentityCognito } from '@aws-appsync/utils'

export function request (ctx: Context): any {
  const identity: AppSyncIdentityCognito = ctx.identity as AppSyncIdentityCognito
  if (identity?.sub === undefined) {
    util.unauthorized()
  }

  return {}
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return ctx.result
}