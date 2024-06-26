import { type Context, util } from '@aws-appsync/utils'

export function request (ctx: Context): any {
  ctx.stash.root = 'DataFeed'
  return {}
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return ctx.result
}
