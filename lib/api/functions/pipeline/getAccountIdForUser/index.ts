import { type Context, util, type AppSyncIdentityCognito, runtime } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): any {
  const identity = ctx.identity as AppSyncIdentityCognito
  const index = 'userId-index'
  if (identity?.sub === undefined) {
    util.unauthorized()
  }
  if (identity.claims.account !== undefined) {
    ctx.stash.accountId = identity.claims.account
    runtime.earlyReturn({ accountId: identity.claims.account })
  }
  return ddb.query({
    query: {
      userId: { eq: identity.sub }
    },
    index,
    consistentRead: false
  })
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  if (ctx.result.items[0].accountId !== undefined) {
    ctx.stash.accountId = ctx.result.items[0].accountId
  }
}
