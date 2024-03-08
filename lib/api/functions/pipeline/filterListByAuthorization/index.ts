import { type AppSyncIdentityCognito, type Context, type LambdaRequest } from '@aws-appsync/utils'

export function request (ctx: Context): LambdaRequest {
  console.log('[FilterListByAuthorization] request', { ctx })
  const { info } = ctx
  const identity = ctx.identity as AppSyncIdentityCognito
  const accountId = identity.claims.accountId ?? ctx.stash.accountId
  return {
    operation: 'Invoke',
    payload: {
      user: {
        userId: identity.sub,
        accountId
      },
      data: ctx.prev.result,
      resolverName: info.fieldName
    }
  }
}

export function response (ctx: Context): unknown {
  console.log('[FilterListByAuthorization] response', { ctx })
  const { error, result } = ctx
  if (error != null) {
    util.appendError(error.message, error.type, result)
  }
  delete ctx.prev.result
  return ctx.result ?? []
}
