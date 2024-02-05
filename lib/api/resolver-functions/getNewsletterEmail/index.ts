import { type Context, util, type DynamoDBGetItemRequest } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBGetItemRequest {
  const { newsletterId, emailId } = ctx.args.input
  return ddb.get({
    key: {
      newsletterId,
      compoundSortKey: 'email#' + emailId
    }
  })
}

export const response = (ctx: Context): any => {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  const { emailKey, createdAt } = ctx.result
  const { newsletterId, emailId } = ctx.args.input
  let path = ''
  if (emailKey !== undefined) {
    path = emailKey
    if (path.indexOf('/') !== 0) {
      path = '/' + path
    }
  } else {
    const epochCreatedAt = util.time.parseISO8601ToEpochMilliSeconds(createdAt as string)
    const year = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'YYYY')
    const month = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'MM')
    const day = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'DD')
    path = `/newsletter-content/${year}/${month}/${day}/${emailId}`
  }
  const htmlPath = path + '.html'
  const textPath = path + '.txt'
  return {
    newsletterId,
    emailId,
    createdAt,
    htmlPath,
    textPath
  }
}
