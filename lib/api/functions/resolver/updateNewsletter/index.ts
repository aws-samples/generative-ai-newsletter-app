import { type Context, util } from '@aws-appsync/utils'
import { type UpdateNewsletterInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  ctx.stash.root = 'Newsletter'
  const { args } = ctx
  const input = args.input as UpdateNewsletterInput
  if (input.id === undefined || input.id === null) {
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
