import { type Context, util, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import { type UpdateNewsletterInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityCognito
  const input = args.input as UpdateNewsletterInput
  if (identity?.sub === undefined) {
    util.unauthorized()
  }
  if (input.newsletterId === undefined || input.newsletterId === null) {
    util.error('NewsletterId is required', 'ValidationException')
  }
  return {}
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return true
}