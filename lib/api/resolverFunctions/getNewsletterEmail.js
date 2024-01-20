import {util}  from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request (ctx) {
  const { newsletterId, emailId } = ctx.args.input
  return ddb.get({
    key: {
        newsletterId:  newsletterId,
        compoundSortKey:'email#' + emailId
    },
  })
}

export const response = (ctx) => {
  if(ctx.error){
    util.error(ctx.error.message, ctx.error.type)
  }
    const newsletterEmail = ctx.result
    const epochCreatedAt = util.time.parseISO8601ToEpochMilliSeconds(newsletterEmail.createdAt)
    const year = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'YYYY')
    const month = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'MM')
    const day = util.time.epochMilliSecondsToFormatted(epochCreatedAt, 'DD')
    const emailId = newsletterEmail.compoundSortKey.split('#')[1]
    const path = `/newsletter-content/${year}/${month}/${day}/${emailId}`
    let htmlPath = path + '.html'
    let textPath = path + '.txt'
    return {
        newsletterId: newsletterEmail.newsletterId,
        emailId: emailId,
        createdAt: newsletterEmail .createdAt,
        htmlPath: htmlPath,
        textPath: textPath,
    }
}
