import {
  type Context,
  util,
  type DynamoDBBatchGetItemRequest
} from '@aws-appsync/utils'

export function request (ctx: Context): DynamoDBBatchGetItemRequest {
  const { NEWSLETTER_TABLE } = ctx.env
  return {
    operation: 'BatchGetItem',
    tables: {
      [NEWSLETTER_TABLE]: ctx.args.dataFeedIds.map((dataFeedId: string) => util.dynamodb.toMapValues({ dataFeedId }))
    }
  }
}

export function response (ctx: Context): any {
  ctx.prev.result.dataFeeds = ctx.result?.items
  return ctx.prev.result
}
