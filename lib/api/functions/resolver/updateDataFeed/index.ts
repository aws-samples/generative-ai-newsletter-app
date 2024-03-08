import { type Context, util, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import { type UpdateDataFeedInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityCognito
  const input = args.input as UpdateDataFeedInput
  if (identity?.sub === undefined) {
    util.unauthorized()
  }
  if (input.dataFeedId === undefined || input.dataFeedId === null) {
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
