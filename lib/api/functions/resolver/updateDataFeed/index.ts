import { type Context, util } from '@aws-appsync/utils'
import { type UpdateDataFeedInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  ctx.stash.root = 'DataFeed'
  const { args } = ctx
  const input = args.input as UpdateDataFeedInput
  if (input.id === undefined || input.id === null) {
    util.error('DataFeedID is required', 'ValidationException')
  }
  return {}
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return true
}
