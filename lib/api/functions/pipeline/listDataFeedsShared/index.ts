import {
  type Context,
  util,
  runtime,
  type DynamoDBQueryRequest,
} from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';
import {
  addAccountToItems,
  convertFieldIdsToObjectIds,
  filterForDuplicatesById,
} from '../../resolver-helper';

export function request (ctx: Context): DynamoDBQueryRequest {
  const dataFeedTypeIndex = 'type-index'; // TODO - Make ENV variable
  const input = ctx.args.input;
  const includeShared =
    input?.includeShared !== undefined
      ? input.includeShared
      : ctx.stash.lookupDefinition.includeShared ?? false;
  if (includeShared === false) {
    runtime.earlyReturn(ctx.prev.result);
  }
  const { nextToken, limit = 1000 } = ctx.args;
  return ddb.query({
    query: { sk: { eq: 'dataFeed' } },
    index: dataFeedTypeIndex,
    limit,
    nextToken,
    select: 'ALL_ATTRIBUTES',
  });
}

export function response (ctx: Context): any {
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type);
  }
  let result = ctx.result;
  result = addAccountToItems(result);
  result = convertFieldIdsToObjectIds(result, 'dataFeedId');
  if (ctx.prev?.result?.items !== undefined && result.items !== undefined) {
    result.items.push(...ctx.prev.result.items);
  } else if (ctx.prev?.result?.items !== undefined) {
    result.items = [...ctx.prev.result.items];
  }
  if (result.items !== undefined) {
    result = filterForDuplicatesById(result);
  }
  return result;
}
