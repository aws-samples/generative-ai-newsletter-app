import { type Context, util, type DynamoDBQueryRequest, type DynamoDBBatchGetItemRequest, type AppSyncIdentityCognito } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
const newsletterTableItemTypeGSI = 'newsletter-item-type-index'

export function request (ctx: Context): DynamoDBQueryRequest | DynamoDBBatchGetItemRequest {
  const { nextToken, limit = 1000, newsletterTable } = ctx.args
  const { lookupType = 'DEFAULT' } = ctx.args.input
  const { newsletters } = ctx.prev.result
  if (ctx.identity === undefined || ctx.identity === null || Object.keys(ctx.identity).includes('sub')) {
    util.error('Error! No authorized identity found!')
  }
  const sub = (ctx.identity as AppSyncIdentityCognito).sub

  if (newsletters !== undefined && newsletters.length > 0) {
    return {
      operation: 'BatchGetItem',
      tables: {
        [newsletterTable]: {
          keys: newsletters.map((newsletterId: { newsletterId: string, compoundSortKey: string }) => util.dynamodb.toMapValues({ newsletterId, compoundSortKey: 'newsletter' }))
        }
      }
    }
  }
  switch (lookupType) {
    case 'CURRENT_USER_OWNED':
      return ddb.query({
        index: newsletterTableItemTypeGSI,
        query: {
          compoundSortKey: { eq: 'newsletter' }
        },
        filter: {
          owner: { eq: sub }
        },
        limit,
        nextToken,
        consistentRead: false
      })
    case 'CURRENT_USER_SUBSCRIBED':
      return ddb.query({
        index: newsletterTableItemTypeGSI,
        query: {
          compoundSortKey: { eq: 'subscriber#' + sub }
        },
        filter: {
          discoverable: { eq: true }
        },
        limit,
        nextToken,
        consistentRead: false
      })
    case 'DISCOVERABLE':
    default:
      return ddb.query({
        index: newsletterTableItemTypeGSI,
        query: {
          compoundSortKey: { eq: 'newsletter' }
        },
        filter: {
          discoverable: { eq: true }
        },
        limit,
        nextToken,
        consistentRead: false
      })
  }
}

export const response = (ctx: Context): any => {
  const { newsletterTable } = ctx.args
  if (ctx.result.data !== undefined && ctx.result.data[newsletterTable] !== undefined) {
    return {
      newsletters: ctx.result.data[newsletterTable],
      nextToken: ctx.result.nextToken
    }
  }
  return {
    newsletters: ctx.result.items ?? [],
    nextToken: ctx.result.nextToken
  }
}
