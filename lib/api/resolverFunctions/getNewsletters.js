import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
const newsletterTableItemTypeGSI = 'newsletter-item-type-index'

export function request(ctx) {
  const { nextToken, limit = 1000 } = ctx.args
  const { getCurrentUserOwned = false, getDiscoverable = true, newsletterIds = [] } = ctx.args.input
  const { sub } = ctx.identity
  let filter = {}
  if (newsletterIds.length > 0) {
    return {
      operation: 'BatchGetItem',
      tables: {
        'newsletter-table': {
            keys: util.dynamodb.toList(newsletterIds),
        }
      },
      consistentRead: true,
    }
  }
  if (getCurrentUserOwned && !getDiscoverable) {
    filter = {
      owner: { eq: sub }
    }
  } else if (getCurrentUserOwned && getDiscoverable) {
    filter = {
      owner: { eq: sub },
      discoverable: { eq: true }
    }
  } else {
    filter = {
      discoverable: { eq: true }
    }
  }
  return ddb.query({
    index: newsletterTableItemTypeGSI,
    query: {
      compoundSortKey: { eq: 'newsletter' }
    },
    filter,
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
