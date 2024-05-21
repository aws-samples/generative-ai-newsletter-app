import {
  type Context,
  util,
  type DynamoDBBatchGetItemRequest
} from '@aws-appsync/utils'
import { addAccountToItems, convertFieldIdsToObjectIds, filterForDuplicatesById } from '../../resolver-helper'

export function request (ctx: Context): DynamoDBBatchGetItemRequest {
  const { NEWSLETTER_TABLE } = ctx.env
  const newsletterIds = ctx.args.newsletterIds ?? ctx.prev.result.newsletterIds ?? undefined
  if (newsletterIds === undefined) { util.error('No newsletter Ids defined', 'ValidationException') }
  if (newsletterIds.length === 0) { runtime.earlyReturn([]) }
  return {
    operation: 'BatchGetItem',
    tables: {
      [NEWSLETTER_TABLE]: {
        keys: newsletterIds.map((newsletterId: string) => util.dynamodb.toMapValues({ newsletterId, sk: 'newsletter' }))
      }
    }
  }
}

export function response (ctx: Context): any {
  const { NEWSLETTER_TABLE } = ctx.env
  let result = {
    items: ctx.result?.data[NEWSLETTER_TABLE] ?? []
  }
  result = addAccountToItems(result)
  result = convertFieldIdsToObjectIds(result, 'newsletterId')
  if (result.items !== undefined) {
    result = filterForDuplicatesById(result)
  }
  return result
}
