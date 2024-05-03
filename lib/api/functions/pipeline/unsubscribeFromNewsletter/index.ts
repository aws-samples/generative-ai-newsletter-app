import { type Context, util, type LambdaRequest, type AppSyncIdentityLambda } from '@aws-appsync/utils'
import { type UnsubscribeFromNewsletterInput } from 'lib/shared/api'

export function request (ctx: Context): LambdaRequest {
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityLambda
  const input = args.input as UnsubscribeFromNewsletterInput
  if (input.id === undefined || input.id === null) {
    util.error('Newsletter ID is required', 'ValidationException')
  }
  return {
    operation: 'Invoke',
    payload: {
      cognitoUserId: identity.resolverContext.userId,
      newsletterId: input.id,
      accountId: identity.resolverContext.accountId
    }
  }
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }

  return ctx.result
}
