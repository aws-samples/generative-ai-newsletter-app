import { type Context, util, type LambdaRequest, type AppSyncIdentityLambda } from '@aws-appsync/utils'
import { type CreateDataFeedInput } from '../../../../shared/api'

export function request (ctx: Context): LambdaRequest {
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityLambda
  const input = args.input as CreateDataFeedInput
  if (input.isPrivate === undefined || input.isPrivate === null) {
    input.isPrivate = true
  }
  console.log('payload', {
    accountId: identity.resolverContext.accountId,
    input
  })
  return {
    operation: 'Invoke',
    payload: {
      accountId: identity.resolverContext.accountId,
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
