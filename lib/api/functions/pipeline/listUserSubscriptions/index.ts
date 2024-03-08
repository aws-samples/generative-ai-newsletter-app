import {
  type DynamoDBQueryRequest,
  type Context,
  type AppSyncIdentityCognito
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx: Context): DynamoDBQueryRequest {
  const identity = ctx.identity as AppSyncIdentityCognito
  const { NEWSLETTER_TABLE_ITEM_TYPE_GSI } = ctx.env
  return ddb.query({
    index: NEWSLETTER_TABLE_ITEM_TYPE_GSI,
    query: {
      sk: { eq: 'subscriber#' + identity.sub }
    },
    consistentRead: false
  })
}

export const response = (ctx: Context): any => {
  if (ctx.result.items === undefined || ctx.result.items === null) {
    runtime.earlyReturn([])
  }
  ctx.stash.subscribedCount = ctx.result.items.length
  ctx.result.newsletterIds = ctx.result.items.map(
    (newsletter: { newsletterId: string }) => newsletter.newsletterId
  )
  console.log(ctx.result)

  return {
    subscribedCount: ctx.result.items.length,
    newsletterIds: ctx.result.items.map((item: { newsletterId: string }) => item.newsletterId)
  }
}
