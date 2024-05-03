import {
  type Context,
  util,
  type DynamoDBGetItemRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { addAccountToItem, convertFieldIdToObjectId } from '../../resolver-helper'

export function request (
  ctx: Context
): DynamoDBGetItemRequest {
  console.log('getNewsletter request', { ctx })
  const { id } = ctx.args.input
  return ddb.get({
    key: {
      newsletterId: id,
      sk: 'newsletter'
    }
  })
}

export const response = (ctx: Context): any => {
  console.log('getNewsletter response', { ctx })
  if (ctx.error != null) {
    util.appendError(ctx.error.message, ctx.error.type)
    return ctx.error.message
  }
  let result = ctx.result
  result = addAccountToItem(result)
  result = convertFieldIdToObjectId(result, 'newsletterId')
  return result
}
