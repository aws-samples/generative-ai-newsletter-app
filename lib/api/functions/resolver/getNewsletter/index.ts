/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { type Context, util } from '@aws-appsync/utils';

export function request (ctx: Context): any {
  ctx.stash.root = 'Newsletter';
  return {};
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.prev.result;
}
