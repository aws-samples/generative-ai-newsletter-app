import {
  type Context,
  util,
  type DynamoDBGetItemRequest
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

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
  let path = ''
  if (emailKey !== undefined) {
    path = emailKey
    if (path.indexOf('/') !== 0) {
      path = '/' + path
    }
  } else {
    const epochCreatedAt = util.time.parseISO8601ToEpochMilliSeconds(
      createdAt as string
    )
    const year = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'YYYY')
    const month = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'MM')
    const day = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'DD')
    path = `/newsletter-content/${year}/${month}/${day}/${publicationId}`
  }
  const htmlPath = path + '.html'
  const textPath = path + '.txt'
  return {
    newsletterId,
    publicationId,
    accountId,
    createdAt,
    htmlPath,
    textPath
  }
}
