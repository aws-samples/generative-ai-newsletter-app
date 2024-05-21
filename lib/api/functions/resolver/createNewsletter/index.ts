/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import {
  type Context,
  util,
  type LambdaRequest,
  type AppSyncIdentityLambda
} from '@aws-appsync/utils'

export function request (ctx: Context): LambdaRequest {
  ctx.stash.root = 'Newsletter'
  const { args } = ctx
  const identity = ctx.identity as AppSyncIdentityLambda
  const input = args.input
  return {
    operation: 'Invoke',
    payload: {
      input,
      createdBy: {
        accountId: identity.resolverContext.accountId,
        userId: identity.resolverContext.userId
      }
    }
  }
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return ctx.result
}
