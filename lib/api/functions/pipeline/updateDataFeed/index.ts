import {
  type Context,
  util,
  type DynamoDBUpdateItemRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBUpdateItemRequest {
  const values: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(
    ctx.args.input as Record<string, unknown>
  )) {
    if (key !== 'id' && value !== undefined && value !== null) {
      values[key] = value
    }
  }
  return ddb.update({
    key: {
      dataFeedId: ctx.args.input.id,
      sk: 'dataFeed'
    },
    update: { ...values }
  })
}

export function response (ctx: Context): any {
  const { error } = ctx
  if (error !== undefined && error !== null) {
    util.error(error.message, error.type)
  } else {
    return true
  }
}
