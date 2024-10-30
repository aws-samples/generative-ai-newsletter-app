import {
  type Context,
  type DynamoDBQueryRequest,
  util,
} from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request (ctx: Context): DynamoDBQueryRequest {
  const { nextToken, limit = 500 } = ctx.args;
  const { id } = ctx.args.input;
  return ddb.query({
    query: {
      dataFeedId: { eq: id },
      sk: { beginsWith: 'article' },
    },
    limit,
    nextToken,
  });
}

export function response (ctx: Context): any {
  const skPrefix = 'article';
  if (ctx.error !== undefined && ctx.error !== null) {
    util.error(ctx.error.message, ctx.error.type);
  }
  const articles = {
    items: ctx.result.items.map((item: any) => {
      item.id = item.articleId.substring(skPrefix.length);
      item.account = {
        id: item.accountId,
      };
      return item;
    }),
    nextToken: ctx.result.nextToken as string,
  };
  if (ctx.info.fieldName === 'getDataFeed') {
    const result = ctx.prev.result;
    result.items = articles;
    return result;
  }
  return articles;
}
