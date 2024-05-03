import { type Context, util, type LambdaRequest, type AppSyncIdentityLambda } from '@aws-appsync/utils'
import { type CreateNewsletterInput } from '../../../../shared/api'

export function request (ctx: Context): LambdaRequest {
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityLambda
  const input = args.input as CreateNewsletterInput
  if (input.isPrivate === undefined || input.isPrivate === null) {
    input.isPrivate = true
  }
  return {
    operation: 'Invoke',
    payload: {
      createdBy: {
        accountId: identity.resolverContext.accountId,
        userId: identity.resolverContext.userId
      },
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
