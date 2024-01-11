import {util} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
const newsletterTableItemTypeGSI = 'newsletter-item-type-index'

export function request (ctx) {
  const { nextToken } = ctx.args
  const limit = 50
  return ddb.query({
    index: newsletterTableItemTypeGSI,
    query: {
      compoundSortKey: { eq: 'newsletter' } 
    },
    limit,
    nextToken,
    consistentRead: false
  })
}

export const response = (ctx) => {
  return {
    newsletters: ctx.result.items,
    nextToken: ctx.result.nextToken,
  }
}
