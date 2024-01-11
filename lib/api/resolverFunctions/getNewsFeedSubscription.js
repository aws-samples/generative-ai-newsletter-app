import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx) {
  const { subscriptionId } = ctx.args.input
  return ddb.get({
    key: {
      subscriptionId,
      compoundSortKey: 'subscription'
    }
  })
}

export const response = (ctx) => {
  return ctx.result
}
