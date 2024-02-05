import { type Context, util, type DynamoDBUpdateItemRequest } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBUpdateItemRequest {
  const { subscriptionId, articleId, flaggedContent } = ctx.args.input
  return ddb.update({
    key: {
      subscriptionId,
      compoundSortKey: 'article#' + articleId
    },
    update: {
      flaggedContent
    }
  })
}

export const response = (ctx: Context): any => {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return true
}
