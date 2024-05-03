import {
  type Context,
  util,
  type DynamoDBGetItemRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { addAccountToItem, convertFieldIdToObjectId } from '../../resolver-helper'

export function request (ctx: Context): DynamoDBGetItemRequest {
  const { newsletterId, publicationId } = ctx.args.input
  return ddb.get({
    key: {
      newsletterId,
      sk: 'publication#' + publicationId
    }
  })
}

export const response = (ctx: Context): any => {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  const { emailKey, createdAt, newsletterId, publicationId, accountId } = ctx.result
  let filePath = ''
  if (emailKey !== undefined) {
    filePath = emailKey
    if (filePath.indexOf('/') !== 0) {
      filePath = '/' + filePath
    }
  } else {
    const epochCreatedAt = util.time.parseISO8601ToEpochMilliSeconds(
      createdAt as string
    )
    const year = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'YYYY')
    const month = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'MM')
    const day = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'DD')
    filePath = `/newsletter-content/${year}/${month}/${day}/${publicationId}`
  }
  let result = {
    newsletterId,
    publicationId,
    accountId,
    createdAt,
    filePath
  }
  result = addAccountToItem(result)
  result = convertFieldIdToObjectId(result, 'publicationId')
  return result
}
