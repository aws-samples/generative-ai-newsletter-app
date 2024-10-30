import {
  type DynamoDBQueryRequest,
  type Context,
  type AppSyncIdentityLambda,
} from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import {
  addAccountToItems,
  convertFieldIdsToObjectIds,
  filterForDuplicatesById,
} from '../../resolver-helper';

export function request (ctx: Context): DynamoDBQueryRequest {
  const identity = ctx.identity as AppSyncIdentityLambda;
  const { NEWSLETTER_TABLE_ITEM_TYPE_GSI } = ctx.env;
  return ddb.query({
    index: NEWSLETTER_TABLE_ITEM_TYPE_GSI,
    query: {
      sk: { eq: 'subscriber#' + identity.resolverContext.userId },
    },
    consistentRead: false,
  });
}

export const response = (ctx: Context): any => {
  let { result } = ctx;
  if (result.items === undefined || result.items === null) {
    runtime.earlyReturn([]);
  }
  result = addAccountToItems(result);
  result = convertFieldIdsToObjectIds(result, 'newsletterId');
  if (ctx.prev?.result?.items !== undefined && result.items !== undefined) {
    result.items.push(...ctx.prev.result.items);
  } else if (ctx.prev?.result?.items !== undefined) {
    result.items = [...ctx.prev.result.items];
  }
  if (result.items !== undefined) {
    result = filterForDuplicatesById(result);
  }
  return {
    items: result.items ?? [],
  };
};
