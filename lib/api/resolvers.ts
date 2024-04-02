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
    const { api, dataFeedTable, newsletterTable, accountTable, unauthenticatedUserRole } = props

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
            `mv -f ${pathToFunction}/index.js /asset-output/`
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
                `mv -f ${pathToFunction}/index.js ${outputDir}`,
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

    const accountTableSourceRole = new Role(this, 'AccountTableSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        AccountTableSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'dynamodb:Query'
              ],
              resources: [
                accountTable.tableArn,
                `${accountTable.tableArn}/index/${props.accountTableUserIndex}`
              ]
            })
          ]
        })
      }
    })

    const accountTableSource = new DynamoDbDataSource(this, 'AccountTableSource', {
      api,
      table: accountTable,
      serviceRole: accountTableSourceRole.withoutPolicyUpdates(),
      name: 'AccountTableSource',
      description: 'DynamoDB data source for account table'
    })

    const isAuthorizedReadDataSourceRole = new Role(this, 'IsAuthorizedReadDataSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        IsAuthorizedReadDataSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.readActionAuthCheckFunction.functionArn
              ]
            })
          ]
        })
      }
    }
    )

    const isAuthorizedToReadLambdaDataSource = new LambdaDataSource(this, 'isAuthorizedReadDataSource', {
      api,
      lambdaFunction: props.functions.readActionAuthCheckFunction,
      name: 'isAuthorizedReadDataSource',
      description: 'Lambda data source for isAuthorizedRead function',
      serviceRole: isAuthorizedReadDataSourceRole.withoutPolicyUpdates()
    })

    const isAuthorizedCreateDataSourceRole = new Role(this, 'IsAuthorizedCreateDataSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        IsAuthorizedCreateDataSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.createActionAuthCheckFunction.functionArn
              ]
            })
          ]
        })
      }
    }
    )

    const isAuthorizedToCreateLambdaDataSource = new LambdaDataSource(this, 'isAuthorizedCreateDataSource', {
      api,
      lambdaFunction: props.functions.createActionAuthCheckFunction,
      name: 'isAuthorizedCreateDataSource',
      description: 'Lambda data source for isAuthorizedCreate function',
      serviceRole: isAuthorizedCreateDataSourceRole.withoutPolicyUpdates()
    })

    const listAuthFilterLambdaDataSourceRole = new Role(this, 'ListAuthFilterLambdaDataSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        ListAuthFilterLambdaDataSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.listAuthFilterFunction.functionArn
              ]
            })
          ]
        })
      }
    })

    const listAuthFilterLambdaDataSource = new LambdaDataSource(this, 'listAuthFilterDataSource', {
      api,
      lambdaFunction: props.functions.listAuthFilterFunction,
      name: 'listAuthFilterDataSource',
      description: 'Lambda data source for listAuthFilter function',
      serviceRole: listAuthFilterLambdaDataSourceRole.withoutPolicyUpdates()
    })

    const isAuthorizedToUpdateLambdaDataSourceRole = new Role(this, 'IsAuthorizedToUpdateLambdaDataSourceRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        IsAuthorizedToUpdateLambdaDataSourceRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: [
                'lambda:InvokeFunction'
              ],
              resources: [
                props.functions.updateActionAuthCheckFunction.functionArn
              ]
            })
          ]
        })
      }
    })

    const isAuthorizedToUpdateLambdaDataSource = new LambdaDataSource(this, 'isAuthorizedUpdateDataSource', {
      api,
      lambdaFunction: props.functions.updateActionAuthCheckFunction,
      name: 'isAuthorizedUpdateDataSource',
      description: 'Lambda data source for isAuthorizedUpdate function',
      serviceRole: isAuthorizedToUpdateLambdaDataSourceRole.withoutPolicyUpdates()
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

    /** AppSync Resolver Pipeline Functions */

    const isAuthorizedToReadFunction = new AppsyncFunction(this,
      'IsAuthorizedFunction',
      {
        name: 'isAuthorizedToRead',
        api,
        dataSource: isAuthorizedToReadLambdaDataSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('isAuthorizedToRead', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      })

    const isAuthorizedToCreateFunction = new AppsyncFunction(this,
      'IsAuthorizedToCreate', {
        name: 'isAuthorizedToCreate',
        api,
        dataSource: isAuthorizedToCreateLambdaDataSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('isAuthorizedToCreate', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      })

    const filterListByAuthorization = new AppsyncFunction(this,
      'FilterListByAuthorization', {
        name: 'filterListByAuthorization',
        api,
        dataSource: listAuthFilterLambdaDataSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('filterListByAuthorization', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      })

    const isAuthorizedToUpdateFunction = new AppsyncFunction(this,
      'IsAuthorizedToUpdate', {
        name: 'isAuthorizedToUpdate',
        api,
        dataSource: isAuthorizedToUpdateLambdaDataSource,
        runtime: FunctionRuntime.JS_1_0_0,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('isAuthorizedToUpdate', 'pipeline')
        })
      })

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

    const listNewslettersById = new AppsyncFunction(
      this,
      'ListNewslettersById',
      {
        name: 'listNewslettersById',
        api,
        dataSource: newsletterTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('listNewslettersById', 'pipeline')
        }),
        runtime: FunctionRuntime.JS_1_0_0
      }
    )

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

    const getUserSubscriptionStatusFunction = new AppsyncFunction(
      this,
      'GetUserSubscriptionStatusFunction',
      {
        name: 'getUserSubscriptionStatus',
        api,
        dataSource: newsletterTableSource,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions(
            'getUserSubscriptionStatus', 'pipeline'
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

    const getAccountIdForUser = new AppsyncFunction(
      this,
      'GetAccountIdforUserFunction',
      {
        name: 'getAccountIdforUser',
        api,
        dataSource: accountTableSource,
        runtime: FunctionRuntime.JS_1_0_0,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('getAccountIdForUser', 'pipeline')
        })
      }
    )

    /** AppSync GraphQL API Resolvers */

    new Resolver(this, 'GetNewsletterResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getNewsletterFunction, isAuthorizedToReadFunction]
    })

    new Resolver(this, 'ListNewslettersResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listNewsletters',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listNewsletters', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, listNewslettersOwned, listNewslettersDiscoverable, listNewslettersShared, filterListByAuthorization]
    })

    new Resolver(this, 'ListPublicationsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listPublications',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listPublications', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getNewsletterFunction, isAuthorizedToReadFunction, listPublicationsFunction]
    })

    new Resolver(this, 'getPublicationResolverFunction', {
      api,
      typeName: 'Query',
      fieldName: 'getPublication',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getPublication', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getPublication, isAuthorizedToReadFunction]
    })

    new Resolver(this, 'UpdateNewsletterResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('updateNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getNewsletterFunction, isAuthorizedToUpdateFunction, updateNewsletterResolverFunction]
    })

    new Resolver(this, 'ListDataFeedsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listDataFeeds',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listDataFeeds', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, listDataFeedsOwnedFunction, listDataFeedsSharedFunction, listDataFeedsDiscoverable, filterListByAuthorization]
    })

    new Resolver(this, 'GetDataFeedResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getDataFeed',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getDataFeed', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getDataFeedFunction, isAuthorizedToReadFunction]
    })

    // TODO - Review authorizations around this.
    new Resolver(this, 'UpdateDataFeedResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateDataFeed',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('updateDataFeed', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getDataFeedFunction, isAuthorizedToReadFunction, updateDataFeedFunction]
    })

    new Resolver(this, 'ListArticlesResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listArticles',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listArticles', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getDataFeedFunction, isAuthorizedToReadFunction, listArticlesFunction]
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
      pipelineConfig: [getAccountIdForUser, isAuthorizedToCreateFunction, createDataFeedFunction],
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
      pipelineConfig: [getAccountIdForUser, getNewsletterFunction, isAuthorizedToUpdateFunction, subscribeToNewsletterFunction],
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
      pipelineConfig: [getAccountIdForUser, getNewsletterFunction, isAuthorizedToReadFunction, unsubscribeFromNewsletter]
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

    new Resolver(this, 'GetSubscriptionStatusResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getUserSubscriptionStatus',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getUserSubscriptionStatus', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getNewsletterFunction, isAuthorizedToReadFunction, getUserSubscriptionStatusFunction]
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
        getAccountIdForUser,
        listUserSubscriptionsFunction,
        listNewslettersById,
        filterListByAuthorization
      ]
    })

    new Resolver(this, 'getNewsletterSubscriberStatsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getNewsletterSubscriberStats',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getNewsletterSubscriberStats', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getNewsletterFunction, isAuthorizedToReadFunction, getNewsletterSubscriberStatsFunction]
    })

    new Resolver(this, 'canManageNewsletterResolver', {
      api,
      typeName: 'Query',
      fieldName: 'canManageNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('canManageNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getNewsletterFunction, isAuthorizedToUpdateFunction]
    })

    new Resolver(this, 'canManageDataFeedResolver', {
      api,
      typeName: 'Query',
      fieldName: 'canManageDataFeed',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('canManageDataFeed', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdForUser, getDataFeedFunction, isAuthorizedToUpdateFunction]
    })
  }
}
