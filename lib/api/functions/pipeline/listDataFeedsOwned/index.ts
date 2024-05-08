/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import {
  type Context,
  util,
  type DynamoDBQueryRequest,
  type AppSyncIdentityLambda
} from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'
import { addAccountToItems, convertFieldIdsToObjectIds, filterForDuplicatesById } from '../../resolver-helper'
const dataFeedTypeIndex = 'type-index' // TODO - Make ENV variable

export function request (ctx: Context): DynamoDBQueryRequest {
  const identity = ctx.identity as AppSyncIdentityLambda
  const input = ctx.args.input
  const includeOwned = input?.includeOwned !== undefined ? input.includeOwned : ctx.stash.lookupDefinition.includeOwned ?? true
  if (includeOwned === false) {
    runtime.earlyReturn(ctx.prev.result)
  }
  const { nextToken, limit = 1000 } = ctx.args
  return ddb.query({
    query: {
      sk: { eq: 'dataFeed' },
      accountId: { eq: identity.resolverContext.accountId }
    },
    index: dataFeedTypeIndex,
    limit,
    nextToken,
    select: 'ALL_ATTRIBUTES'
  })
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type)
  }
  let result = ctx.result
  result = addAccountToItems(result)
  result = convertFieldIdsToObjectIds(result, 'dataFeedId')
  if (ctx.prev?.result?.items !== undefined && result.items !== undefined) {
    result.items.push(...ctx.prev.result.items)
  } else if (ctx.prev?.result?.items !== undefined) {
    result.items = [...ctx.prev.result.items]
  }
  if (result.items !== undefined) {
    result = filterForDuplicatesById(result)
  }

  return result
}
