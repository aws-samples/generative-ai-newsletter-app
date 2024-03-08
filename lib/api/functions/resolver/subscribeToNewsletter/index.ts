import { type Context, util, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import { type SubscribeToNewsletterInput } from 'lib/shared/api'

export function request (ctx: Context): void {
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityCognito
  const input = args.input as SubscribeToNewsletterInput
  if (identity?.sub === undefined) {
    util.unauthorized()
  }
  if (input.newsletterId === undefined || input.newsletterId === null) {
    util.error('Newsletter ID is required', 'ValidationException')
  }
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }

  return ctx.result
}
