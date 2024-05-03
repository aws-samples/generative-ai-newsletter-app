import { type Context, util } from '@aws-appsync/utils'
import { type GetPublicationInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  const { args } = ctx
  ctx.stash.root = 'Publication'
  const input = args.input as GetPublicationInput
  if (input.newsletterId === undefined || input.newsletterId === null) {
    util.error('NewsletterId is required', 'ValidationException')
  }
  if (input.id === undefined || input.id === null) {
    util.error('PublicationId is required', 'ValidationException')
  }
  return {}
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return ctx.result
}
