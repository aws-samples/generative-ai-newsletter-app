/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import * as path from 'path';
import { Duration, Stack } from 'aws-cdk-lib';
import {
  AuthorizationType,
  Definition,
  FieldLogLevel,
  GraphqlApi,
} from 'aws-cdk-lib/aws-appsync';
import { type ITable, type Table } from 'aws-cdk-lib/aws-dynamodb';
import { type IRole } from 'aws-cdk-lib/aws-iam';
import { type NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { type Bucket } from 'aws-cdk-lib/aws-s3';
import { type CfnPolicyStore } from 'aws-cdk-lib/aws-verifiedpermissions';
import { Construct } from 'constructs';
import { ApiResolvers } from './resolvers';


export interface ApiProps {
  userPoolId: string;
  unauthenticatedUserRole?: IRole;
  dataFeedTable: Table;
  dataFeedTableTypeIndex: string;
  dataFeedTableLSI: string;
  newsletterTable: Table;
  newsletterTableItemTypeGSI: string;
  accountTable: ITable;
  accountTableUserIndex: string;
  avpPolicyStore: CfnPolicyStore;
  loggingBucket: Bucket;
  avpAuthorizerValidationRegex: string;
  functions: {
    graphqlActionAuthorizerFunction: NodejsFunction;
    graphqlReadAuthorizerFunction: NodejsFunction;
    graphqlFilterReadAuthorizerFunction: NodejsFunction;
    createNewsletterFunction: NodejsFunction;
    userSubscriberFunction: NodejsFunction;
    userUnsubscriberFunction: NodejsFunction;
    feedSubscriberFunction: NodejsFunction;
    getNewsletterFunction: NodejsFunction;
  };
}

export class API extends Construct {
  public readonly graphqlApiUrl: string;
  constructor (scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    const graphqlApi = new GraphqlApi(this, 'API', {
      name: Stack.of(this).stackName + 'GraphQLAPI',
      definition: Definition.fromFile(
        path.join(__dirname, '..', 'shared', 'api', 'schema.graphql'),
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.LAMBDA,
          lambdaAuthorizerConfig: {
            handler: props.functions.graphqlActionAuthorizerFunction,
            resultsCacheTtl: Duration.seconds(0),
            validationRegex: props.avpAuthorizerValidationRegex,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.IAM,
          },
        ],
      },
      environmentVariables: {
        DATA_FEED_TABLE: props.dataFeedTable.tableName,
        NEWSLETTER_TABLE: props.newsletterTable.tableName,
        NEWSLETTER_TABLE_ITEM_TYPE_GSI: props.newsletterTableItemTypeGSI,
        ACCOUNT_TABLE: props.accountTable.tableName,
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
        retention: RetentionDays.INFINITE,
      },
      xrayEnabled: true,
    });

    new ApiResolvers(this, 'ApiResolvers', {
      api: graphqlApi,
      ...props,
    });
    this.graphqlApiUrl = graphqlApi.graphqlUrl;
  }
}
