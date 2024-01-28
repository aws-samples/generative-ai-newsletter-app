import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
const newsletterTableItemTypeGSI = 'newsletter-item-type-index'

export function request(ctx) {
  const { nextToken, limit = 1000 } = ctx.args
  const { getCurrentUser = false, getDiscoverable = true } = ctx.args.input
  const { sub } = ctx.identity
  let filter = {}
  if (getCurrentUser && !getDiscoverable) {
    filter = {
      expression: ':owner = #owner or :discoverable = false',
      expressionNames: {
        ':owner': 'owner',
        ':discoverable': 'discoverable'
      },
      expressionValues: {
        '#owner': { S: sub },
      }
    }
  } else if (getCurrentUser && getDiscoverable) {
    filter = {
      expression: ':owner = #owner or :discoverable = true',
      expressionNames: {
        ':owner': 'owner',
        ':discoverable': 'discoverable'
      },
      expressionValues: {
        '#owner': { S: sub },
      }
    }
  } else {
    filter = {
      expression: ':discoverable = true',
      expressionNames: {
        ':discoverable': 'discoverable'
      }
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
