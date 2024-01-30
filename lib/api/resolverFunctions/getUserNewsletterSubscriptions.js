import * as ddb from '@aws-appsync/utils/dynamodb'
const newsletterTableItemTypeGSI = 'newsletter-item-type-index'


export function request (ctx) {
    const { nextToken, limit = 1000 } = ctx.args
    const { sub } = ctx.identity
  return ddb.query({
    index: newsletterTableItemTypeGSI,
    query: {
      compoundSortKey: { eq: 'subscriber#' + sub }
    },
    limit,
    nextToken,
    consistentRead: false
  })
}

export const response = (ctx) => {
    return {
      newsletters: ctx.result.items.map(newsletter => newsletter.newsletterId),
      nextToken: ctx.result.nextToken,
    }
  }
  