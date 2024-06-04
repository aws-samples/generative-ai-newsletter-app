import {
  type Context,
  util,
  type DynamoDBQueryRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { addAccountToItem, filterForDuplicatesById } from '../../resolver-helper'

export function request (ctx: Context): DynamoDBQueryRequest {
  const { nextToken, limit = 250 } = ctx.args
  const { id } = ctx.args.input
  return ddb.query({
    query: {
      newsletterId: { eq: id },
      sk: { beginsWith: 'publication' }
    },
    limit,
    nextToken,
    consistentRead: false
  })
}

export const response = (ctx: Context): any => {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  const items: any[] = []
  if (ctx.result.items !== undefined) {
    for (const item of ctx.result.items) {
      const { emailKey, createdAt, newsletterId, sk, accountId } = item
      const publicationId = sk.split('#')[1]
      let filePath = ''
      if (emailKey === undefined) {
        const epochCreatedAt = util.time.parseISO8601ToEpochMilliSeconds(
          createdAt as string
        )
        const year = util.time.epochMilliSecondsToFormatted(
          epochCreatedAt,
          'YYYY'
        )
        const month = util.time.epochMilliSecondsToFormatted(
          epochCreatedAt,
          'MM'
        )
        const day = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'DD')
        const publicationId = sk.split('#')[1]
        filePath = `/newsletter-content/${year}/${month}/${day}/${publicationId}`
      } else {
        filePath = emailKey
        if (filePath.indexOf('/') !== 0) {
          filePath = '/' + filePath
        }
      }
      let itemToPush = {
        newsletterId,
        accountId,
        id: publicationId,
        createdAt,
        filePath
      }
      itemToPush = addAccountToItem(itemToPush)
      items.push(itemToPush)
    }
  }
  let result = {
    items
  }
  if (result.items !== undefined) {
    result = filterForDuplicatesById(result)
  }
  return {
    items: result.items,
    nextToken: ctx.result.nextToken
  }
}
