import { type Context, util } from '@aws-appsync/utils'

export function request (ctx: Context): any {
  ctx.stash.root = 'Publications'
  const input = ctx.args.input
  if (input.id === undefined || input.id === null) {
    util.error('NewsletterId is required', 'ValidationException')
  }
  return {}
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    items: ctx.result?.items ?? []
  }
}
