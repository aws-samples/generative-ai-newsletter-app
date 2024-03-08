import { type Context, util, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import { type CanManageNewsletterInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  const identity = ctx.identity as AppSyncIdentityCognito
  const input = ctx.args.input as CanManageNewsletterInput
  if (identity?.sub === undefined) {
    util.unauthorized()
  }
  if (input.newsletterId === undefined) {
    util.appendError('Unable to locate newsletterId')
  }
  return {}
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  // Returning true because will throw unauthorized in pipeline if not approved
  return true
}
