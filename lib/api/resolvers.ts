/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  type GraphqlApi,
  Code,
  AppsyncFunction,
  FunctionRuntime,
  Resolver,
  LambdaDataSource,
  DynamoDbDataSource
} from 'aws-cdk-lib/aws-appsync'
import { Construct } from 'constructs'
import * as path from 'path'
import { type ApiProps } from '.'
import { type BundlingOptions, DockerImage, BundlingOutput } from 'aws-cdk-lib'
import { type ExecSyncOptionsWithBufferEncoding, execSync } from 'child_process'
import { Effect, Policy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'

interface ApiResolversProps extends ApiProps {
  api: GraphqlApi
}

export class ApiResolvers extends Construct {
  constructor (scope: Construct, id: string, props: ApiResolversProps) {
    super(scope, id)
    const { api, dataFeedTable, newsletterTable, unauthenticatedUserRole } = props

    const functionsPath = path.join(__dirname, 'functions')
    const getFunctionBundlingOptions = (
      functionName: string,
      functionType: 'resolver' | 'pipeline'
    ): BundlingOptions => {
      const pathToFunction = path.join(functionsPath, functionType, functionName)
      return {
        outputType: BundlingOutput.SINGLE_FILE,
        command: [
          'sh',
          '-c',
          [
            `npm --silent --prefix "${functionsPath}" install`,
            `npm --silent --prefix "${functionsPath}" run build -- -outdir=${pathToFunction} ${pathToFunction}/index.ts`,
            'ls -la',
            `cp ${pathToFunction}/index.js /asset-output/`
          ].join(' && ')
        ],
        image: DockerImage.fromRegistry(
          'public.ecr.aws/sam/build-nodejs20.x:latest'
        ),
        local: {
          tryBundle (outputDir: string) {
            try {
              const options: ExecSyncOptionsWithBufferEncoding = {
                stdio: 'inherit',
                env: {
                  ...process.env
                }
              }
              execSync(
                `npm --silent --prefix "${functionsPath}" install`,
                options
              )
              execSync(
                `npm --silent --prefix "${functionsPath}" run build -- --outdir=${pathToFunction} ${pathToFunction}/index.ts`,
                options
              )
              execSync(
                `cp ${pathToFunction}/index.js ${outputDir}`,
                options
              )
            } catch (e) {
              console.error(e)
              return false
            }
            return true
          }
        }
      }
    }

    /** ****** DATA SOURCES FOR AppSync ******* **/

    const newsletterTableSourceRole = new Role(this, 'NewsletterTableSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        NewsletterTableSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:BatchGetItem'
              ],
              resources: [
                newsletterTable.tableArn,
                `${newsletterTable.tableArn}/index/${props.newsletterTableItemTypeGSI}`
              ]
            })
          ]
        })
      }
    })

    const newsletterTableSource = new DynamoDbDataSource(this, 'NewsletterTableSource', {
      api,
      table: newsletterTable,
      serviceRole: newsletterTableSourceRole.withoutPolicyUpdates(),
      name: 'NewsletterTableSource',
      description: 'DynamoDB data source for newsletter table'
    })

    const dataFeedTableSourceRole = new Role(this, 'DataFeedTableSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        DataFeedTableSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:BatchGetItem'
              ],
              resources: [
                dataFeedTable.tableArn,
                `${dataFeedTable.tableArn}/index/${props.dataFeedTableTypeIndex}`
              ]
            })
          ]
        })
      }
    }
    )

    const dataFeedTableSource = new DynamoDbDataSource(this, 'DataFeedTableSource', {
      api,
      table: dataFeedTable,
      description: 'DynamoDB data source for Data Feed table',
      serviceRole: dataFeedTableSourceRole.withoutPolicyUpdates(),
      name: 'DataFeedTableSource'
    })

    const dataFeedSubscriberLambdaSourceRole = new Role(this, 'DataFeedSubscriberLambdaSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        DataFeedSubscriberLambdaSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.feedSubscriberFunction.functionArn
              ]
            })
          ]
        })
      }
    }
    )

    const dataFeedSubscriberLambdaSource = new LambdaDataSource(this, 'DataFeedSubscriberLambdaSource', {
      api,
      lambdaFunction: props.functions.feedSubscriberFunction,
      name: 'DataFeedSubscriberLambdaSource',
      description: 'Lambda data source for feedSubscriber function',
      serviceRole: dataFeedSubscriberLambdaSourceRole.withoutPolicyUpdates()
    })

    const newsletterCreatorLambdaSourceRole = new Role(this, 'NewsletterCreatorLambdaSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        NewsletterCreatorLambdaSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.createNewsletterFunction.functionArn
              ]
            })
          ]
        })
      }
    })

    const newsletterCreatorLambdaSource = new LambdaDataSource(this, 'NewsletterCreatorLambdaSource', {
      api,
      lambdaFunction: props.functions.createNewsletterFunction,
      name: 'NewsletterCreatorLambdaSource',
      description: 'Lambda data source for createNewsletter function',
      serviceRole: newsletterCreatorLambdaSourceRole.withoutPolicyUpdates()
    })

    const userSubscriberLambdaSourceRole = new Role(this, 'UserSubscriberLambdaSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        UserSubscriberLambdaSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.userSubscriberFunction.functionArn
              ]
            })
          ]
        })
      }
    }
    )

    const userSubscriberLambdaSource = new LambdaDataSource(this, 'UserSubscriberLambdaSource', {
      api,
      lambdaFunction: props.functions.userSubscriberFunction,
      name: 'UserSubscriberLambdaSource',
      description: 'Lambda data source for userSubscriber function',
      serviceRole: userSubscriberLambdaSourceRole.withoutPolicyUpdates()
    })

    const userUnsubscriberLambdaSourceRole = new Role(this, 'UserUnsubscriberLambdaSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        UserUnsubscriberLambdaSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.userUnsubscriberFunction.functionArn
              ]
            })
          ]
        })
      }
    })

    const userUnsubscriberLambdaSource = new LambdaDataSource(this, 'UserUnsubscriberLambdaSource', {
      api,
      lambdaFunction: props.functions.userUnsubscriberFunction,
      name: 'UserUnsubscriberLambdaSource',
      description: 'Lambda data source for userUnsubscriber function',
      serviceRole: userUnsubscriberLambdaSourceRole.withoutPolicyUpdates()
    })

    const isAuthorizedFunctionSourceRole = new Role(this, 'IsAuthorizedFunctionSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        IsAuthInvokePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.graphqlReadAuthorizerFunction.functionArn
              ]
            })
          ]
        })
      }
    })

    const isAuthorizedFunctionSource = new LambdaDataSource(this, 'IsAuthorizedFunctionSource', {
      api,
      lambdaFunction: props.functions.graphqlReadAuthorizerFunction,
      name: 'isAuthorizedFunctionSource',
      description: 'Lambda data source for isAuthorized function',
      serviceRole: isAuthorizedFunctionSourceRole.withoutPolicyUpdates()
    })

    const filterListByAuthorizationFunctionSourceRole = new Role(this, 'FilterListByAuthFunctionSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        FilterIsAuthInvokePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.graphqlFilterReadAuthorizerFunction.functionArn
              ]
            })
          ]
        })
      }
    })

    const filterListByAuthorizationSource = new LambdaDataSource(this, 'FilterIsAuthorizedFunctionSource', {
      api,
      lambdaFunction: props.functions.graphqlFilterReadAuthorizerFunction,
      name: 'filterIsAuthorizedFunctionSource',
      description: 'Lambda data source for isAuthorized function',
      serviceRole: filterListByAuthorizationFunctionSourceRole.withoutPolicyUpdates()
    })

    /** AppSync Resolver Pipeline Functions */

    const getNewsletterFunction = new AppsyncFunction(
      this,
      'GetNewsletterResolverFunction',
      {
        api,
        dataSource: newsletterTableSource,
        name: 'getNewsletter',
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('getNewsletter', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const listNewslettersOwned = new AppsyncFunction(
      this,
      'ListNewslettersOwnedResolverFunction',
      {
        name: 'listNewslettersOwned',
        api,
        dataSource: newsletterTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listNewslettersOwned', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const listNewslettersDiscoverable = new AppsyncFunction(
      this,
      'ListNewslettersDiscoverableResolverFunction',
      {
        name: 'listNewslettersDiscoverable',
        api,
        dataSource: newsletterTableSource,
        runtime: FunctionRuntime.JS_1_0_0,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listNewslettersDiscoverable', 'pipeline')
        })
      }
    )

    const listNewslettersShared = new AppsyncFunction(
      this,
      'ListNewslettersSharedResolverFunction',
      {
        name: 'listNewslettersShared',
        api,
        dataSource: newsletterTableSource,
        runtime: FunctionRuntime.JS_1_0_0,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listNewslettersShared', 'pipeline')
        })
      }
    )

    // const listNewslettersById = new AppsyncFunction(
    //   this,
    //   'ListNewslettersById',
    //   {
    //     name: 'listNewslettersById',
    //     api,
    //     dataSource: newsletterTableSource,
    //     code: Code.fromAsset(functionsPath, {
    //       bundling: getFunctionBundlingOptions('listNewslettersById', 'pipeline')
    //     }),
    //     runtime: FunctionRuntime.JS_1_0_0
    //   }
    // )

    const listPublicationsFunction = new AppsyncFunction(
      this,
      'ListPublicationsFunction',
      {
        name: 'listPublications',
        api,
        dataSource: newsletterTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listPublications', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )
    const getPublication = new AppsyncFunction(
      this,
      'GetPublicationResolverFunction',
      {
        name: 'getPublication',
        api,
        dataSource: newsletterTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('getPublication', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const updateNewsletterResolverFunction = new AppsyncFunction(
      this,
      'UpdateNewsletterResolverFunction',
      {
        name: 'updateNewsletter',
        api,
        dataSource: newsletterTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('updateNewsletter', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )
    const subscribeToNewsletterFunction = new AppsyncFunction(
      this,
      'SubscribeToNewsletterResolverFunction',
      {
        name: 'subscribeToNewsletter',
        api,
        dataSource: userSubscriberLambdaSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('subscribeToNewsletter', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const unsubscribeFromNewsletter = new AppsyncFunction(
      this,
      'UnsubscribeFromNewsletterResolverFunction',
      {
        name: 'unsubscribeFromNewsletter',
        api,
        dataSource: userUnsubscriberLambdaSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('unsubscribeFromNewsletter', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const listDataFeedsOwnedFunction = new AppsyncFunction(
      this,
      'ListDataFeedsOwnedFunction',
      {
        name: 'listDataFeedsOwned',
        api,
        dataSource: dataFeedTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listDataFeedsOwned', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const listDataFeedsSharedFunction = new AppsyncFunction(
      this,
      'ListDataFeedsSharedFunction',
      {
        name: 'listDataFeedsShared',
        api,
        dataSource: dataFeedTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listDataFeedsShared', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const listDataFeedsDiscoverable = new AppsyncFunction(
      this,
      'ListDataFeedsDiscoverableFunction',
      {
        name: 'listDataFeedsDiscoverable',
        api,
        dataSource: dataFeedTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listDataFeedsDiscoverable', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const createDataFeedFunction = new AppsyncFunction(
      this,
      'CreateDataFeedFunction',
      {
        name: 'createDataFeed',
        api,
        dataSource: dataFeedSubscriberLambdaSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('createDataFeed', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )
    const getDataFeedFunction = new AppsyncFunction(
      this,
      'GetDataFeedResolverFunction',
      {
        name: 'getDataFeed',
        api,
        dataSource: dataFeedTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('getDataFeed', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const updateDataFeedFunction = new AppsyncFunction(
      this,
      'UpdateDataFeedResolverFunction',
      {
        name: 'updateDataFeed',
        api,
        dataSource: dataFeedTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('updateDataFeed', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const listArticlesFunction = new AppsyncFunction(
      this,
      'ListArticlesResolverFunction',
      {
        name: 'listArticles',
        api,
        dataSource: dataFeedTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listArticles', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const checkSubscriptionToNewsletterFunction = new AppsyncFunction(
      this,
      'checkSubscriptionToNewsletterFunction',
      {
        name: 'checkSubscriptionToNewsletter',
        api,
        dataSource: newsletterTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions(
            'checkSubscriptionToNewsletter', 'pipeline'
          )
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const getNewsletterSubscriberStatsFunction = new AppsyncFunction(
      this,
      'getNewsletterSubscriberStatsFunction',
      {
        name: 'getNewsletterSubscriberStats',
        api,
        dataSource: newsletterTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('getNewsletterSubscriberStats', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const flagArticleFunction = new AppsyncFunction(
      this,
      'FlagArticleFunction',
      {
        name: 'flagArticle',
        api,
        dataSource: dataFeedTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('flagArticle', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const listUserSubscriptionsFunction = new AppsyncFunction(
      this,
      'ListUserSubscriptionsFunction',
      {
        name: 'listUserSubscriptions',
        api,
        dataSource: newsletterTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listUserSubscriptions', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

    const isAuthorized = new AppsyncFunction(this, 'isAuthorized', {
      name: 'isAuthorized',
      api,
      dataSource: isAuthorizedFunctionSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('isAuthorized', 'pipeline')
      })
    })

    const filterListByAuthorization = new AppsyncFunction(this, 'filterListByAuthorization', {
      name: 'filterListByAuthorization',
      api,
      dataSource: filterListByAuthorizationSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('filterListByAuthorization', 'pipeline')
      })
    })

    /** AppSync GraphQL API Resolvers */

    new Resolver(this, 'GetNewsletterResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewsletterFunction, isAuthorized]
    })

    new Resolver(this, 'ListNewslettersResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listNewsletters',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listNewsletters', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [listNewslettersOwned, listNewslettersDiscoverable, listNewslettersShared, filterListByAuthorization]
    })

    new Resolver(this, 'ListPublicationsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listPublications',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listPublications', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewsletterFunction, listPublicationsFunction, filterListByAuthorization]
    })

    new Resolver(this, 'getPublicationResolverFunction', {
      api,
      typeName: 'Query',
      fieldName: 'getPublication',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getPublication', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getPublication]
    })

    new Resolver(this, 'UpdateNewsletterResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('updateNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewsletterFunction, isAuthorized, updateNewsletterResolverFunction]
    })

    new Resolver(this, 'ListDataFeedsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listDataFeeds',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listDataFeeds', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [listDataFeedsOwnedFunction, listDataFeedsSharedFunction, listDataFeedsDiscoverable, filterListByAuthorization]
    })

    new Resolver(this, 'GetDataFeedResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getDataFeed',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getDataFeed', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getDataFeedFunction, isAuthorized]
    })

    new Resolver(this, 'UpdateDataFeedResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateDataFeed',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('updateDataFeed', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getDataFeedFunction, isAuthorized, updateDataFeedFunction]
    })

    new Resolver(this, 'ListArticlesResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listArticles',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listArticles', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getDataFeedFunction, isAuthorized, listArticlesFunction]
    })

    new Resolver(this, 'FlagArticleResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'flagArticle',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('flagArticle', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [flagArticleFunction]
    })

    props.functions.feedSubscriberFunction.grantInvoke(
      dataFeedSubscriberLambdaSource
    )

    new Resolver(this, 'DataFeedSubscriberResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'createDataFeed',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('createDataFeed', 'resolver')
      }),
      pipelineConfig: [createDataFeedFunction],
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'CreateNewsletterResolver', {
      api,
      dataSource: newsletterCreatorLambdaSource,
      typeName: 'Mutation',
      fieldName: 'createNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('createNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'UserSubscriberResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'subscribeToNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('subscribeToNewsletter', 'resolver')
      }),
      pipelineConfig: [getNewsletterFunction, isAuthorized, subscribeToNewsletterFunction],
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'UserUnsubscriberResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'unsubscribeFromNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('unsubscribeFromNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [unsubscribeFromNewsletter]
    })

    const externalUnsubscribeResolver = new Resolver(this, 'ExternalUnsubscriberResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'externalUnsubscribeFromNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('externalUnsubscribeFromNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [unsubscribeFromNewsletter]
    })
    unauthenticatedUserRole.attachInlinePolicy(new Policy(this, 'UnauthRoleUnsubscribe', {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['appsync:GraphQL'],
          resources: [externalUnsubscribeResolver.arn]
        })
      ]
    }))

    new Resolver(this, 'CheckSubscriptionToNewsletterResolver', {
      api,
      typeName: 'Query',
      fieldName: 'checkSubscriptionToNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('checkSubscriptionToNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewsletterFunction, isAuthorized, checkSubscriptionToNewsletterFunction]
    })

    new Resolver(this, 'ListUserSubscriptionsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listUserSubscriptions',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listUserSubscriptions', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [
        listUserSubscriptionsFunction,
        filterListByAuthorization
      ]
    })

    new Resolver(this, 'CanUpdateNewsletterResolver', {
      api,
      typeName: 'Query',
      fieldName: 'canUpdateNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('canUpdateNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewsletterFunction, isAuthorized]
    })

    new Resolver(this, 'CanUpdateDataFeedResolver', {
      api,
      typeName: 'Query',
      fieldName: 'canUpdateDataFeed',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('canUpdateDataFeed', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getDataFeedFunction, isAuthorized]
    })

    new Resolver(this, 'getNewsletterSubscriberStatsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getNewsletterSubscriberStats',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getNewsletterSubscriberStats', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewsletterFunction, isAuthorized, getNewsletterSubscriberStatsFunction]
    })
  }
}
