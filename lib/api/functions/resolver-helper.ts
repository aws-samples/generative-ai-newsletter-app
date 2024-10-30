import { type Context, runtime } from '@aws-appsync/utils';
/**
 * Adds account to item and removes accountId
 * @returns
 */

export const addAccountToItem = (obj: any): any => {
  if (obj === undefined) {
    return obj;
  }
  obj.account = { id: obj.accountId, __typename: 'Account' };
  delete obj.accountId;
  return obj;
};

/**
 * Converts the object created for AVP to the GraphQL expected shape
 * @param obj
 * @returns
 */
export const convertAvpObjectToGraphql = (obj: any): any => {
  if (obj === undefined) {
    return obj;
  }
  if (obj.Account !== undefined) {
    obj.account = obj.Account;
    delete obj.Account;
  }
  return obj;
};

/**
 * Converts the objects created for AVP to the GraphQL expected shape
 * @param obj
 * @returns
 */
export const convertAvpObjectsToGraphql = (obj: any): any => {
  if (obj === undefined || obj.items === undefined) {
    return obj;
  }
  return obj.items.map((item: any) => {
    return convertAvpObjectToGraphql(item);
  });
};

/**
 * Converts field id to object's "id" field and removes the provided id field
 * @param item
 * @param idFieldName
 * @returns item
 */
export const convertFieldIdToObjectId = (
  obj: any,
  idFieldName: string,
): any => {
  if (obj === undefined) {
    return obj;
  }
  obj.id = obj[idFieldName];

  delete obj[idFieldName];
  return obj;
};

/**
 * Converts field id to object
 * @param fieldIdName
 * @param objectName
 * @returns
 */
export const convertFieldIdToObject = (
  obj: any,
  fieldIdName: string,
  objectName: string,
): any => {
  if (obj === undefined) {
    return obj;
  }
  obj[objectName] = {
    __typename: objectName,
    id: obj[fieldIdName],
  };

  delete obj[fieldIdName];
  return obj;
};

/**
 * Filters items for duplicates by id
 * @param items
 * @returns filtered items
 */
export const filterForDuplicatesById = (obj: any): any => {
  if (obj === undefined || obj.items === undefined) {
    return obj;
  }
  return {
    items: obj.items.filter(
      (item: { id: any }, index: any, itemArray: any[]) => {
        return (
          itemArray.findIndex((i: { id: any }) => i.id === item.id) === index
        );
      },
    ),
  };
};

/**
 * Converts field id to object's "id" field and removes the provided id field
 * @param idFieldName
 * @returns
 */
export const convertFieldIdsToObjectIds = (
  obj: any,
  idFieldName: string,
): any => {
  if (obj === undefined || obj.items === undefined) {
    return obj;
  }
  return {
    items: obj.items.map((item: any) => {
      return convertFieldIdToObjectId(item, idFieldName);
    }),
  };
};

/**
 * converts the items in obj from string field to object with id
 * @param obj
 * @param idFieldName
 * @param objectName
 * @returns
 */
export const convertFieldIdsToObjects = (
  obj: any,
  idFieldName: string,
  objectName: string,
): any => {
  if (obj === undefined || obj.items === undefined) {
    return obj;
  }
  return {
    items: obj.items.map((item: any) => {
      return convertFieldIdToObject(item, idFieldName, objectName);
    }),
  };
};

/**
 * Add account to items
 * @returns
 */
export const addAccountToItems = (obj: any): any => {
  if (obj === undefined || obj.items === undefined) {
    return obj;
  }
  return {
    items: obj.items.map((item: any) => {
      return addAccountToItem(item);
    }),
  };
};

export const dryRunCheck = (ctx: Context): void => {
  if (ctx.arguments.actionAuthOnly === true) {
    runtime.earlyReturn({
      actionAuth: true,
    });
  }
};
