import { type DynamoDBQueryRequest, type Context, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
const newsletterTableItemTypeGSI = 'newsletter-item-type-index'

export function request (ctx: Context): DynamoDBQueryRequest {
  const { nextToken, limit = 1000 } = ctx.args
  if (ctx.identity === undefined || ctx.identity === null || Object.keys(ctx.identity).includes('sub')) {
    util.error('Error! No authoerized identity found')
  }
  const sub = (ctx.identity as AppSyncIdentityCognito).sub
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

export const response = (ctx: Context): any => {
  return {
    newsletters: ctx.result.items.map((newsletter: { newsletterId: string }) => newsletter.newsletterId),
    nextToken: ctx.result.nextToken
  }
}
