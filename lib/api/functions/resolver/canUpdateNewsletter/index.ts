import { type Context, util } from '@aws-appsync/utils';

export function request (ctx: Context): any {
  ctx.stash.root = 'Newsletter';
  ctx.stash.contingentAction = 'updateNewsletter';
  return {};
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return true;
}
