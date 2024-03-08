import {
  type Context,
  util,
  type DynamoDBUpdateItemRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBUpdateItemRequest {
  const { dataFeedId } = ctx.args.input
  const values: Record<string, unknown> = {}
  Object.keys(ctx.args.input as Record<string, unknown>).forEach((key: string) => {
    if (ctx.args?.input[key] !== undefined && ctx.args?.input[key] !== null && key !== 'dataFeedId') {
      console.log(`UpdateDataFeed. Loop values: ${key} ---- ${ctx.args.input[key]}`)
      values[key] = ctx.args.input[key]
    }
  })

  return ddb.update({
    key: {
      dataFeedId,
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
