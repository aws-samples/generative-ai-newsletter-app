/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { type Context, util } from '@aws-appsync/utils'

export function request (ctx: Context): any {
  ctx.stash.root = 'Newsletters'
  console.log('[listNewslettersResolverRequest]', { ctx })
  const input = ctx.args.input
  if (
    input === undefined ||
    (input.includeDiscoverable === undefined &&
      input.includeOwned === undefined &&
      input.includeShared === undefined)
  ) {
    ctx.stash.lookupDefinition = {
      includeOwned: true,
      includeShared: false,
      includeDiscoverable: false
    }
  } else {
    ctx.stash.lookupDefinition = {
      includeOwned: input.includeOwned ?? false,
      includeShared: input.includeShared ?? false,
      includeDiscoverable: input.includeDiscoverable ?? false
    }
  }

  return {}
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    nextToken: ctx.result.nextToken,
    items: ctx.result.items ?? []
  }
}
