import { type DynamoDBGetItemRequest, type Context } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { type DataFeed } from 'lib/shared/api'

export function request (ctx: Context): DynamoDBGetItemRequest {
  const { dataFeedId } = ctx.args.input
  console.log(ctx.identity)
  return ddb.get({
    key: {
      dataFeedId,
      sk: 'dataFeed'
    }
  })
}

export const response = (ctx: Context): any => {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  if (ctx.result === undefined || ctx.result === null) {
    util.error('DataFeed not found', 'DataFeedNotFound')
  }
  if (ctx.result.dataFeedId !== undefined) {
    if (ctx.result.isPrivate === undefined || ctx.result.isPrivate === null) {
      ctx.result.isPrivate = true
    }
  }
  return ctx.result satisfies DataFeed
}
