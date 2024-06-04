/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import {
  type LambdaRequest,
  util,
  type Context,
  type AppSyncIdentityLambda
} from '@aws-appsync/utils'
import { convertAvpObjectsToGraphql } from '../../resolver-helper'

export function request (ctx: Context): LambdaRequest {
  console.log(
    `[Filter List by Authorization Request] request ctx ${JSON.stringify(ctx)}`
  )
  const { source, args } = ctx
  const identity = ctx.identity as AppSyncIdentityLambda
  return {
    operation: 'Invoke',
    payload: {
      userId: identity.resolverContext.userId,
      accountId: identity.resolverContext.accountId,
      requestContext: JSON.parse(
        identity.resolverContext.requestContext as string
      ),
      result: ctx.prev.result,
      arguments: args,
      source
    }
  }
}

export function response (ctx: Context): any {
  console.log('[IsAuthorized] response ctx $', { ctx: JSON.stringify(ctx) })
  const { error, result } = ctx
  if (error !== undefined && error !== null) {
    util.appendError(error.message, error.type, result)
  }
  if (result.isAuthorized !== true) {
    util.unauthorized()
  }
  console.log('[IsAuthorized] response result $', {
    result: JSON.stringify(result)
  })
  return {
    isAuthorized: true,
    items: convertAvpObjectsToGraphql(result)
  }
}
