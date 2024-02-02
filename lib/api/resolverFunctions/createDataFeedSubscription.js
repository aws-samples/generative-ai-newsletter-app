import { util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request (ctx) {
    const item = { ...ctx.arguments.input }
    item.createdAt = util.time.nowISO8601()
    item.enabled = ctx.arguments.input.enabled ?? true
    item.owner = ctx.identity.sub
    const id = util.autoId()
    const key = {
        subscriptionId: id,
        compoundSortKey: 'subscription'
    }
    return ddb.put({key, item})
}

export const response = (ctx) => ctx.result
