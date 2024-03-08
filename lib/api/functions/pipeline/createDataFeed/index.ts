import { type Context, util, type LambdaRequest, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import { type CreateDataFeedInput } from 'lib/shared/api'

export function request (ctx: Context): LambdaRequest {
  const { args } = ctx
  const identity: AppSyncIdentityCognito = ctx.identity as AppSyncIdentityCognito
  const input = args.input as CreateDataFeedInput
  const accountId = identity.claims['custom:Account'] ?? ctx.stash.accountId
  if (identity?.sub === undefined || accountId === undefined) {
    util.unauthorized()
  }
  if (input.isPrivate === undefined || input.isPrivate === null) {
    input.isPrivate = true
  }
  return {
    operation: 'Invoke',
    payload: {
      accountId,
      input
    }
  }
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return ctx.result
}
