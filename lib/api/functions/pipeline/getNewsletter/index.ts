import {
  type Context,
  util,
  type DynamoDBGetItemRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (
  ctx: Context
): DynamoDBGetItemRequest {
  console.log('getNewsletter request', { ctx })
  const { newsletterId } = ctx.args.input
  return ddb.get({
    key: {
      newsletterId,
      sk: 'newsletter'
    }
  })
}

export const response = (ctx: Context): any => {
  if (ctx.error != null) {
    util.appendError(ctx.error.message, ctx.error.type)
    return ctx.error.message
  }
  return ctx.result
}
