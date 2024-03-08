import { type Context, util, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { type FlagArticleInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityCognito
  const input = args.input as FlagArticleInput
  const accountId = identity.claims['custom:Account'] ?? ctx.stash.accountId
  if (identity?.sub === undefined || accountId === undefined) {
    util.unauthorized()
  }
  if (input.dataFeedId === undefined || input.dataFeedId === null) {
    util.error('DataFeedID is required', 'ValidationException')
  }
  if (input.articleId === undefined || input.articleId === null) {
    util.error('ArticleID is required', 'ValidationException')
  }
  const flaggedUpdate = ddb.operations.replace({
    flaggedContent: true
  })
  return ddb.update({
    key: {
      dataFeedId: { eq: input.dataFeedId },
      sk: { eq: 'article#' + input.articleId }
    },
    update: flaggedUpdate
  })
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return true
}
