import { type ReadAuthCheckInput } from '../../../../shared/common'
import { type Context, util, type AppSyncIdentityCognito, type LambdaRequest } from '@aws-appsync/utils'

export function request (ctx: Context): LambdaRequest {
  console.log(`[IsAuthorizedToUpdate] request ctx: ${JSON.stringify(ctx)}`)
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
    } satisfies ReadAuthCheckInput
  }
}

export function response (ctx: Context): unknown {
  console.log(`[IsAuthorizedToUpdate] response ctx ${JSON.stringify(ctx)}`)
  const { error, result } = ctx
  if (error != null) {
    util.appendError(error.message, error.type, result)
  }
  if (result.isAuthorized !== true) {
    util.unauthorized()
  }
  return ctx.prev.result
}
