/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { Stack } from 'aws-cdk-lib'
import {
  NewsSubscriptionIngestion
} from './data-feed-ingestion'
import { NewsletterGenerator } from './newsletter-generator'
import { Authentication } from './authentication'
import { API } from './api'
import { UserInterface } from './user-interface'
import { type Construct } from 'constructs'

import { Authorization } from './authorization'
import getConfig from './config'
import { type IUserPool, type IUserPoolClient } from 'aws-cdk-lib/aws-cognito'
import { type IIdentityPool } from '@aws-cdk/aws-cognito-identitypool-alpha'
import { type IGraphqlApi } from 'aws-cdk-lib/aws-appsync'
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'

export class GenAINewsletter extends Stack {
  public readonly userPool: IUserPool
  public readonly userPoolClient: IUserPoolClient
  public readonly identityPool: IIdentityPool
  public readonly apiUrl: string
  public readonly graphqlApi: IGraphqlApi
  constructor (scope: Construct, id: string) {
    super(scope, id)

    const config = getConfig()
    const { auth } = config
    if (auth !== undefined) {
      this.node.setContext('auth', auth)
    }

    this.node.setContext('pinpointEmail', config.pinpointEmail)
    this.node.setContext('selfSignUpEnabled', config.selfSignUpEnabled)
    this.node.setContext('authConfig', config.auth)
    this.node.setContext('ui', config.ui)

    const loggingBucket = new Bucket(this, 'GenAINewsletter-LoggingBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true
    })

    const authentication = new Authentication(this, 'AuthenticationStack')

    const authorization = new Authorization(this, 'AuthorizationConstruct', {
      userPoolId: authentication.userPoolId,
      userPoolArn: authentication.userPoolArn,
      userPoolClientId: authentication.userPoolClientId
    })

    const dataFeedIngestion = new NewsSubscriptionIngestion(
      this,
      'NewsletterIngestionStack',
      {
        loggingBucket
      }
    )

    const newsletterGenerator = new NewsletterGenerator(
      this,
      'NewsletterGenerator',
      {
        dataFeedTable: dataFeedIngestion.dataFeedTable,
        dataFeedTableLSI: dataFeedIngestion.dataFeedTableLSI,
        accountTable: authentication.accountTable,
        accountTableUserIndex: authentication.accountTableUserIndex,
        userPool: authentication.userPool,
        loggingBucket
      }
    )

    const api = new API(this, 'API', {
      userPoolId: authentication.userPoolId,
      unauthenticatedUserRole: authentication.unauthenticatedUserRole,
      dataFeedTable: dataFeedIngestion.dataFeedTable,
      dataFeedTableLSI: dataFeedIngestion.dataFeedTableLSI,
      dataFeedTableTypeIndex: dataFeedIngestion.dataFeedTableTypeIndex,
      accountTable: authentication.accountTable,
      accountTableUserIndex: authentication.accountTableUserIndex,
      newsletterTable: newsletterGenerator.newsletterTable,
      newsletterTableItemTypeGSI: newsletterGenerator.newsletterTableItemTypeGSI,
      avpPolicyStore: authorization.policyStore,
      loggingBucket,
      functions: {
        readActionAuthCheckFunction: authorization.readActionAuthCheckFunction,
        createActionAuthCheckFunction: authorization.createActionAuthCheckFunction,
        listAuthFilterFunction: authorization.listAuthFilterFunction,
        updateActionAuthCheckFunction: authorization.updateActionAuthCheckFunction,
        createNewsletterFunction: newsletterGenerator.createNewsletterFunction,
        userSubscriberFunction: newsletterGenerator.userSubscriberFunction,
        userUnsubscriberFunction: newsletterGenerator.userUnsubscriberFunction,
        feedSubscriberFunction:
          dataFeedIngestion.feedSubscriberFunction,
        getNewsletterFunction: newsletterGenerator.getNewsletterFunction
      }
    })

    new UserInterface(this, 'UI', {
      emailBucket: newsletterGenerator.emailBucket,
      userPoolId: authentication.userPoolId,
      userPoolClientId: authentication.userPoolClientId,
      graphqlApiUrl: api.graphqlApiUrl,
      identityPoolId: authentication.identityPoolId,
      loggingBucket
    })
    // userInterfaceStack.addDependency(api., 'UI Requires Endpoints Defined in API')
  }
}
