import { type Context, util, type LambdaRequest } from '@aws-appsync/utils';

export function request (ctx: Context): LambdaRequest {
  const { newsletterId, userId } = ctx.args.input;
  if (newsletterId === null || userId === null) {
    util.error(
      'Newsletter ID & User ID are both required',
      'ValidationException',
    );
  }
  return {
    operation: 'Invoke',
    payload: {
      cognitoUserId: userId,
      newsletterId,
    },
  };
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return true;
}
