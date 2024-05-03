import { type Context, util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { type FlagArticleInput } from 'lib/shared/api'

export function request (ctx: Context): any {
  ctx.stash.root = 'Article'
  const { args } = ctx
  const input = args.input as FlagArticleInput
  if (input.dataFeedId === undefined || input.dataFeedId === null) {
    util.error('DataFeedID is required', 'ValidationException')
  }
  if (input.id === undefined || input.id === null) {
    util.error('ArticleID is required', 'ValidationException')
  }
  const flaggedUpdate = ddb.operations.replace({
    flaggedContent: true
  })
  return ddb.update({
    key: {
      dataFeedId: { eq: input.id },
      sk: { eq: 'article#' + input.id }
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
