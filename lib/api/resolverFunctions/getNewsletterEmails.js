import {util}  from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request (ctx) {
  const { nextToken, limit = 250 } = ctx.args
  const { newsletterId } = ctx.args.input
  return ddb.query({
    query: {
        newsletterId: {eq: newsletterId},
        compoundSortKey:{ beginsWith: 'email'}
    },
    limit,
    nextToken,
    consistentRead: false,
  })
}

export const response = (ctx) => {
  if(ctx.error){
    util.error(ctx.error.message, ctx.error.type)
  }
  const items = []
  if(ctx.result.items !== undefined){
    for(const item of ctx.result.items){
        const epochCreatedAt = util.time.parseISO8601ToEpochMilliSeconds(item.createdAt)
        const year = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'YYYY')
        const month = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'MM')
        const day = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'DD')
        const emailId = item.compoundSortKey.split('#')[1]
        const path = `/newsletter-content/${year}/${month}/${day}/${emailId}`
        let htmlPath = path + '.html'
        let textPath = path + '.txt'
        items.push({
            newsletterId: item.newsletterId,
            emailId: emailId,
            createdAt: item.createdAt,
            htmlPath: htmlPath,
            textPath: textPath,
        })
      }  
  }
  return {
    newsletterEmails: items,
    nextToken: ctx.result.nextToken,
  }
}
