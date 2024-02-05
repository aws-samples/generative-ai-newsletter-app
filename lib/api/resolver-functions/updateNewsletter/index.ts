import { type Context, util, type DynamoDBUpdateItemRequest } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBUpdateItemRequest {
  const { newsletterId } = ctx.args
  const { ...rest } = ctx.args.input
  const values = Object.entries(rest as Record<string, unknown>).reduce((obj: any, [key, value]): any => {
    if (value !== undefined && value !== null && value !== '') {
      obj[key] = value
      return obj
    }
    return null
  }, {})

  return ddb.update({
    key: {
      newsletterId,
      compoundSortKey: 'newsletter'
    },
    update: { ...values }
  })
}

export function response (ctx: Context): any {
  const { error, result } = ctx
  if (error !== undefined && error !== null) {
    util.appendError(error.message, error.type)
    return result
  } else {
    return true
  }
}
