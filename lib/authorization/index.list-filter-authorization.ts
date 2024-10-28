/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Logger } from '@aws-lambda-powertools/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';

import {
  GetSchemaCommand,
  VerifiedPermissionsClient,
  type IsAuthorizedCommandInput,
  IsAuthorizedCommand,
  Decision,
} from '@aws-sdk/client-verifiedpermissions';
import middy from '@middy/core';
import {
  getEntityItem,
  lowercaseFirstLetter,
  queryToActionAuth,
  queryToResourcesEntity,
} from './authorization-helper';

const SERVICE_NAME = 'list-filter-authorization';

const tracer = new Tracer({ serviceName: SERVICE_NAME });
const logger = new Logger({ serviceName: SERVICE_NAME });
const metrics = new Metrics({ serviceName: SERVICE_NAME });

const { POLICY_STORE_ID } = process.env;
if (POLICY_STORE_ID === undefined || POLICY_STORE_ID === null) {
  logger.error('POLICY_STORE_ID is not set');
  throw new Error('POLICY_STORE_ID is not set');
}

const verifiedpermissions = tracer.captureAWSv3Client(
  new VerifiedPermissionsClient(),
);

let schema: Record<string, unknown>;

const lambdaHandler = async (event: any): Promise<any> => {
  logger.debug('FilterAuthorizationCheckEventTriggered', { event });
  const { userId, accountId } = event;
  if (
    schema === undefined ||
    schema === null ||
    Object.keys(schema).length === 0
  ) {
    logger.debug('AVP Schema not yet cached. Retrieving AVP Schema');
    const schemaResponse = await verifiedpermissions.send(
      new GetSchemaCommand({ policyStoreId: POLICY_STORE_ID }),
    );
    if (
      schemaResponse.schema !== undefined &&
      schemaResponse.schema.length > 0
    ) {
      logger.debug('AVP Schema', { schema: schemaResponse.schema });
      schema = JSON.parse(schemaResponse.schema);
    } else {
      metrics.addMetric('AuthCheckFailed', MetricUnit.Count, 1);
      logger.error('Unable to locate AVP Schema. Unable to check auth');
      throw Error('Unable to locate AVP Schema. Unable to check auth');
    }
  }
  if (event.result.items !== undefined && event.result.items.length > 0) {
    logger.debug('Checking Item Authorization for Filtering', {
      itemCount: event.result.items.length,
    });
    const unfilteredItemPromises: Array<Promise<any>> = [];
    event.result.items.forEach(async (item: any) => {
      unfilteredItemPromises.push(
        checkItemAuthorization(
          item,
          schema,
          userId as string,
          accountId as string,
          event.requestContext,
        ),
      );
    });
    const resolvedAuthItems = await Promise.all(unfilteredItemPromises);
    const items = resolvedAuthItems
      .filter((item) => item.authorization)
      .map((item) => item.item);
    logger.debug('Filtered Items', { itemCount: items.length });
    if (items.length > 0) {
      return {
        isAuthorized: true,
        items,
      };
    } else {
      return {
        isAuthorized: false,
        items: [],
      };
    }
  } else {
    return {
      isAuthorized: true,
      items: [],
    };
  }
};

const checkItemAuthorization = async (
  item: any,
  schemaObj: Record<string, any>,
  userId: string,
  accountId: string,
  requestContext: any,
): Promise<{ item: any; authorization: boolean }> => {
  const queryString = requestContext.queryString as string;
  const isAuthInput: IsAuthorizedCommandInput = {
    policyStoreId: POLICY_STORE_ID,
    principal: {
      entityId: userId,
      entityType: 'GenAINewsletter::User',
    },
    action: {
      actionId: lowercaseFirstLetter(queryToActionAuth(queryString)),
      actionType: 'GenAINewsletter::Action',
    },
    resource: {
      entityType: `GenAINewsletter::${queryToResourcesEntity(queryString)}`,
      entityId: item.id,
    },
    entities: {
      entityList: [
        {
          identifier: {
            entityType: 'GenAINewsletter::User',
            entityId: userId,
          },
          attributes: {
            Account: {
              entityIdentifier: {
                entityType: 'GenAINewsletter::Account',
                entityId: accountId,
              },
            },
          },
        },
        getEntityItem(
          schemaObj,
          item.id as string,
          queryToResourcesEntity(queryString),
          item as Record<string, any>,
          { logger },
        ),
      ],
    },
  };
  logger.debug('AVP REQUEST', {
    isAuthInput,
  });
  try {
    const command = new IsAuthorizedCommand(isAuthInput);
    const response = await verifiedpermissions.send(command);
    logger.debug('AVP RESPONSE', {
      response,
    });

    if (response.decision === Decision.ALLOW.toString()) {
      metrics.addMetric('AuthCheckPassed', MetricUnit.Count, 1);
      logger.debug('Authorized');
      return {
        item,
        authorization: true,
      };
    } else {
      metrics.addMetric('AuthCheckFailed', MetricUnit.Count, 1);
      logger.debug('Not Authorized');
      return {
        item,
        authorization: false,
      };
    }
  } catch (error) {
    metrics.addMetric('AuthCheckFailed', MetricUnit.Count, 1);
    logger.error('Error checking authorization', { error });
  }
  return {
    item,
    authorization: false,
  };
};

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger));
