import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const { newsletterId } = ctx.args.input
  const { sub } = ctx.identity
  return ddb.get({
    key: {
      newsletterId,
      compoundSortKey: 'subscriber#' + sub
    },
  })
}

export const response = (ctx) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  if (ctx.result !== undefined) {
    return true
  } else {
    return false
  }

}
