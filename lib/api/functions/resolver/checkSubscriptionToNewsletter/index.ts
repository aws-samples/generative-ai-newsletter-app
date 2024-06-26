import { type Context, util } from '@aws-appsync/utils'

export function request (ctx: Context): void {
  const { args } = ctx
  ctx.stash.root = 'Newsletter'
  const input = args.input
  if (input.id === undefined || input.id === null) {
    util.error('Newsletter ID is required', 'ValidationException')
  }
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }

  return ctx.result
}
