import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const { nextToken, limit = 250 } = ctx.args
  const { newsletterId } = ctx.args.input
  return ddb.query({
    query: {
      newsletterId: { eq: newsletterId },
      compoundSortKey: { beginsWith: 'email' }
    },
    limit,
    nextToken,
    consistentRead: false,
  })
}

export const response = (ctx) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  const items = []
  if (ctx.result.items !== undefined) {
    for (const item of ctx.result.items) {
      const { emailKey, createdAt, newsletterId, compoundSortKey } = item
      const emailId = compoundSortKey.split('#')[1]
      let path = ''
      if (emailKey === undefined) {
        const epochCreatedAt = util.time.parseISO8601ToEpochMilliSeconds(createdAt)
        const year = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'YYYY')
        const month = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'MM')
        const day = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'DD')
        const emailId = compoundSortKey.split('#')[1]
        path = `/newsletter-content/${year}/${month}/${day}/${emailId}`
      } else {
        path = emailKey
        if (path.indexOf('/') !== 0) {
          path = '/' + path
        }
      }
      let htmlPath = path + '.html'
      let textPath = path + '.txt'
      items.push({
        newsletterId,
        emailId,
        createdAt,
        htmlPath,
        textPath,
      })
    }
  }
  return {
    newsletterEmails: items,
    nextToken: ctx.result.nextToken,
  }
}
