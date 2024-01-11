import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
  const { subscriptionId } = ctx.args
  const { ...rest } = ctx.args.input;
  const values = Object.entries(rest).reduce((obj, [key, value]) => {
    if(value !== undefined && value !== null && value !== ''){
        obj[key] = value
        return obj
    }
  },{});

  return ddb.update({
    key: { subscriptionId,
        compoundSortKey: 'subscription'
    },
    update: { ...values },
  });
}

export function response(ctx) {
  const { error, result } = ctx;
  if (error) {
    util.appendError(error.message, error.type);
    return result
  } else {
    return true
  }
  
}