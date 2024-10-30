/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { type IIdentityPool } from '@aws-cdk/aws-cognito-identitypool-alpha';
import { Stack } from 'aws-cdk-lib';
import { type IUserPool, type IUserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Bucket, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { type Construct } from 'constructs';
import { API } from './api';
import { Authentication } from './authentication';
import { Authorization } from './authorization';
import getConfig from './config';
import { NewsSubscriptionIngestion } from './data-feed-ingestion';
import { NewsletterGenerator } from './newsletter-generator';
import { UserInterface } from './user-interface';


export class GenAINewsletter extends Stack {
  public readonly userPool: IUserPool;
  public readonly userPoolClient: IUserPoolClient;
  public readonly identityPool: IIdentityPool;
  public readonly apiUrl: string;
  constructor (scope: Construct, id: string) {
    super(scope, id);

    const config = getConfig();
    const { auth } = config;
    if (auth !== undefined) {
      this.node.setContext('auth', auth);
    }

    this.node.setContext('pinpointEmail', config.pinpointEmail);
    this.node.setContext('selfSignUpEnabled', config.selfSignUpEnabled);
    this.node.setContext('authConfig', config.auth);
    this.node.setContext('ui', config.ui);

    const loggingBucket = new Bucket(this, 'GenAINewsletter-LoggingBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
    });

    const authentication = new Authentication(this, 'AuthenticationStack');

    const authorization = new Authorization(this, 'AuthorizationConstruct', {
      userPoolId: authentication.userPoolId,
      userPoolArn: authentication.userPoolArn,
      userPoolClientId: authentication.userPoolClientId,
    });

    const dataFeedIngestion = new NewsSubscriptionIngestion(
      this,
      'NewsletterIngestionStack',
      {
        loggingBucket,
      },
    );

    const newsletterGenerator = new NewsletterGenerator(
      this,
      'NewsletterGenerator',
      {
        dataFeedTable: dataFeedIngestion.dataFeedTable,
        dataFeedTableLSI: dataFeedIngestion.dataFeedTableLSI,
        accountTable: authentication.accountTable,
        accountTableUserIndex: authentication.accountTableUserIndex,
        userPool: authentication.userPool,
        loggingBucket,
      },
    );

    const api = new API(this, 'API', {
      userPoolId: authentication.userPoolId,
      unauthenticatedUserRole: authentication.unauthenticatedUserRole,
      dataFeedTable: dataFeedIngestion.dataFeedTable,
      dataFeedTableLSI: dataFeedIngestion.dataFeedTableLSI,
      dataFeedTableTypeIndex: dataFeedIngestion.dataFeedTableTypeIndex,
      accountTable: authentication.accountTable,
      accountTableUserIndex: authentication.accountTableUserIndex,
      newsletterTable: newsletterGenerator.newsletterTable,
      newsletterTableItemTypeGSI:
        newsletterGenerator.newsletterTableItemTypeGSI,
      avpPolicyStore: authorization.policyStore,
      loggingBucket,
      avpAuthorizerValidationRegex: authorization.avpAuthorizerValidationRegex,
      functions: {
        graphqlActionAuthorizerFunction:
          authorization.graphqlActionAuthorizerFunction,
        graphqlReadAuthorizerFunction:
          authorization.graphqlReadAuthorizerFunction,
        graphqlFilterReadAuthorizerFunction:
          authorization.graphqlFilterReadAuthorizerFunction,
        createNewsletterFunction: newsletterGenerator.createNewsletterFunction,
        userSubscriberFunction: newsletterGenerator.userSubscriberFunction,
        userUnsubscriberFunction: newsletterGenerator.userUnsubscriberFunction,
        feedSubscriberFunction: dataFeedIngestion.feedSubscriberFunction,
        getNewsletterFunction: newsletterGenerator.getNewsletterFunction,
      },
    });

    new UserInterface(this, 'UI', {
      emailBucket: newsletterGenerator.emailBucket,
      userPoolId: authentication.userPoolId,
      userPoolClientId: authentication.userPoolClientId,
      graphqlApiUrl: api.graphqlApiUrl,
      identityPoolId: authentication.identityPoolId,
      loggingBucket,
    });

    this.identityPool = authentication?.identityPool;
    this.userPool = authentication.userPool;
    this.userPoolClient = authentication.userPoolClient;
    this.apiUrl = api.graphqlApiUrl;
  }

}
