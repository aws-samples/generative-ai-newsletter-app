import {
  type Context,
  type DynamoDBQueryRequest,
  util
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { type Article, type Articles } from 'lib/shared/api'

export function request (ctx: Context): DynamoDBQueryRequest {
  const { nextToken, limit = 500 } = ctx.args
  const { dataFeedId } = ctx.args.input
  return ddb.query({
    query: {
      dataFeedId: { eq: dataFeedId },
      sk: { beginsWith: 'article' }
    },
    limit,
    nextToken
  })
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    __typename: 'Articles',
    articles: ctx.result.items as Article[],
    nextToken: ctx.result.nextToken as string
  } satisfies Articles
}
