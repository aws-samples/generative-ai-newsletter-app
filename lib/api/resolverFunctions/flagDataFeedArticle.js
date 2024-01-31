import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
    const { subscriptionId, articleId, flaggedContent } = ctx.args.input
    return ddb.update({
        key: {
            subscriptionId,
            compoundSortKey: 'article#' + articleId
        },
        update: {
            flaggedContent
        }
    })

}

export const response = (ctx) => {
    if (ctx.error) {
        util.error(ctx.error.message, ctx.error.type)
        return false
    }
    return true
}
