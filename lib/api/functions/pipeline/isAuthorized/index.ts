/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import {
  type LambdaRequest,
  util,
  type Context,
  type AppSyncIdentityLambda,
} from '@aws-appsync/utils';
import { convertAvpObjectToGraphql } from '../../resolver-helper';

export function request (ctx: Context): LambdaRequest {
  const { source, args } = ctx;
  const identity = ctx.identity as AppSyncIdentityLambda;
  return {
    operation: 'Invoke',
    payload: {
      userId: identity.resolverContext.userId,
      accountId: identity.resolverContext.accountId,
      requestContext: JSON.parse(
        identity.resolverContext.requestContext as string,
      ),
      result: ctx.prev.result,
      arguments: args,
      source,
      root: ctx.stash.root,
      contingentAction: ctx.stash.contingentAction,
    },
  };
}

export function response (ctx: Context): any {
  const { error, result } = ctx;
  if (error !== undefined && error !== null) {
    util.error(error.message, error.type, result);
  }
  if (result.isAuthorized !== true) {
    util.unauthorized();
  }
  return convertAvpObjectToGraphql(result.returnResult);
}
