import { type Context, util, type AppSyncIdentityCognito, type LambdaRequest } from '@aws-appsync/utils'
import { type CreateNewsletterInput } from 'lib/shared/api'

export function request (ctx: Context): LambdaRequest {
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityCognito
  const input = args.input as CreateNewsletterInput
  const accountId = identity.claims['custom:Account'] ?? null
  if (input.isPrivate === undefined || input.isPrivate === null) {
    input.isPrivate = true
  }
  return {
    operation: 'Invoke',
    payload: {
      createdBy: {
        accountId,
        userId: identity.sub
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
