import { type DynamoDBGetItemRequest, type Context } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBGetItemRequest {
  const { subscriptionId } = ctx.args.input
  return ddb.get({
    key: {
      subscriptionId,
      compoundSortKey: 'subscription'
    }
  })
}

export const response = (ctx: Context): any => {
  return ctx.result
}
