import * as ddb from '@aws-appsync/utils/dynamodb'
import { util } from '@aws-appsync/utils'

export function request (ctx) {
  const { newsletterId } = ctx.args.input
  return ddb.query({
    query: {
      newsletterId: { eq: newsletterId },
      compoundSortKey: { beginsWith: 'subscriber#'}
    },
    consistentRead: false
  })
}

export const response = (ctx) => {
  if(ctx.error){
    util.error(ctx.error.message, ctx.error.type)
  }
  if(ctx.result === undefined || ctx.result.items === undefined || ctx.result.items.length < 1){
    return {
      subscriberCount: 0
    }
  }else{
    return {
      subscriberCount: ctx.result.items.length
    }
  }
}