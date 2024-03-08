import { type Context, util, type AppSyncIdentityCognito, type LambdaRequest } from '@aws-appsync/utils'
import { type UnsubscribeFromNewsletterInput } from 'lib/shared/api'

export function request (ctx: Context): LambdaRequest {
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityCognito
  const input = args.input as UnsubscribeFromNewsletterInput
  if (identity?.sub === undefined) {
    util.unauthorized()
  }
  if (input.newsletterId === undefined || input.newsletterId === null) {
    util.error('Newsletter ID is required', 'ValidationException')
  }
  return {
    operation: 'Invoke',
    payload: {
      cognitoUserId: identity.sub,
      newsletterId: input.newsletterId
    }
  }
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return ctx.result
}
