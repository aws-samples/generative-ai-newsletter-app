import {
  type GraphqlApi,
  Code,
  AppsyncFunction,
  FunctionRuntime,
  Resolver,
  LambdaDataSource
} from 'aws-cdk-lib/aws-appsync'
import { Construct } from 'constructs'
import path = require('path')
import { type ApiProps } from '.'
import { type BundlingOptions, DockerImage, BundlingOutput } from 'aws-cdk-lib'
import { type ExecSyncOptionsWithBufferEncoding, execSync } from 'child_process'

interface ApiResolversProps extends ApiProps {
  api: GraphqlApi
}

export class ApiResolvers extends Construct {
  constructor (scope: Construct, id: string, props: ApiResolversProps) {
    super(scope, id)
    const { api, dataFeedTable, newsletterTable, accountTable } = props

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

    /** DATA SOURCES FOR AppSync */
    const newsletterTableSource = api.addDynamoDbDataSource(
      'NewsletterTableSource',
      newsletterTable
    )
    newsletterTable.grantReadData(newsletterTableSource)
    const dataFeedTableSource = api.addDynamoDbDataSource(
      'DataFeedTableSource',
      dataFeedTable
    )

    const accountTableSource = api.addDynamoDbDataSource(
      'AccountTableSource',
      accountTable
    )
    accountTable.grantReadData(accountTableSource)

    const isAuthorizedToReadLambdaDataSource = new LambdaDataSource(this, 'isAuthorizedReadDataSource', {
      api,
      lambdaFunction: props.functions.readActionAuthCheckFunction
    })
    props.functions.readActionAuthCheckFunction.grantInvoke(isAuthorizedToReadLambdaDataSource)

    const isAuthorizedToCreateLambdaDataSource = new LambdaDataSource(this, 'isAuthorizedCreateDataSource', {
      api,
      lambdaFunction: props.functions.createActionAuthCheckFunction
    })
    props.functions.createActionAuthCheckFunction.grantInvoke(isAuthorizedToCreateLambdaDataSource)

    const listAuthFilterLambdaDataSource = new LambdaDataSource(this, 'listAuthFilterDataSource', {
      api,
      lambdaFunction: props.functions.listAuthFilterFunction
    })
    props.functions.listAuthFilterFunction.grantInvoke(listAuthFilterLambdaDataSource)

    const isAuthorizedToUpdateLambdaDataSource = new LambdaDataSource(this, 'isAuthorizedUpdateDataSource', {
      api,
      lambdaFunction: props.functions.updateActionAuthCheckFunction
    })
    props.functions.updateActionAuthCheckFunction.grantInvoke(isAuthorizedToUpdateLambdaDataSource)

    const dataFeedSubscriberLambdaSource = new LambdaDataSource(
      this,
      'DataFeedSubscriberLambdaSource',
      {
        api,
        lambdaFunction: props.functions.feedSubscriberFunction
      }
    )

    const newsletterCreatorLambdaSource = new LambdaDataSource(
      this,
      'NewsletterCreatorLambdaSource',
      {
        api,
        lambdaFunction: props.functions.createNewsletterFunction
      }
    )
    props.functions.createNewsletterFunction.grantInvoke(
      newsletterCreatorLambdaSource.grantPrincipal
    )

    const userSubscriberLambdaSource = new LambdaDataSource(
      this,
      'UserSubscriberLambdaSource',
      {
        api,
        lambdaFunction: props.functions.userSubscriberFunction,
        name: 'UserSubscriberLambdaSource'
      }
    )

    props.functions.userSubscriberFunction.grantInvoke(
      userSubscriberLambdaSource.grantPrincipal
    )

    const userUnsubscriberLambdaSource = new LambdaDataSource(
      this,
      'UserUnsubscriberLambdaSource',
      {
        api,
        lambdaFunction: props.functions.userUnsubscriberFunction,
        name: 'UserUnsubscriberLambdaSource'
      }
    )

    props.functions.userUnsubscriberFunction.grantInvoke(
      userUnsubscriberLambdaSource.grantPrincipal
    )

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const getAccountIdforUser = new AppsyncFunction(
      this,
      'GetAccountIdforUserFunction',
      {
        name: 'getAccountIdforUser',
        api,
        dataSource: accountTableSource,
        runtime: FunctionRuntime.JS_1_0_0,
        code: Code.fromAsset(functionsPath, {
          bundling: getFunctionBundlingOptions('getAccountIdforUser', 'pipeline')
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
      pipelineConfig: [getAccountIdforUser, getNewsletterFunction, isAuthorizedToReadFunction]
    })

    new Resolver(this, 'ListNewslettersResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listNewsletters',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listNewsletters', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, listNewslettersOwned, listNewslettersDiscoverable, listNewslettersShared, filterListByAuthorization]
    })

    new Resolver(this, 'ListPublicationsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listPublications',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listPublications', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, getNewsletterFunction, isAuthorizedToReadFunction, listPublicationsFunction]
    })

    new Resolver(this, 'getPublicationResolverFunction', {
      api,
      typeName: 'Query',
      fieldName: 'getPublication',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getPublication', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, getPublication, isAuthorizedToReadFunction]
    })

    new Resolver(this, 'UpdateNewsletterResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('updateNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, getNewsletterFunction, isAuthorizedToUpdateFunction, updateNewsletterResolverFunction]
    })

    new Resolver(this, 'ListDataFeedsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listDataFeeds',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listDataFeeds', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, listDataFeedsOwnedFunction, listDataFeedsSharedFunction, listDataFeedsDiscoverable, filterListByAuthorization]
    })

    new Resolver(this, 'GetDataFeedResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getDataFeed',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getDataFeed', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, getDataFeedFunction, isAuthorizedToReadFunction]
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
      pipelineConfig: [getAccountIdforUser, getDataFeedFunction, isAuthorizedToReadFunction, updateDataFeedFunction]
    })

    new Resolver(this, 'ListArticlesResolver', {
      api,
      typeName: 'Query',
      fieldName: 'listArticles',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('listArticles', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, getDataFeedFunction, isAuthorizedToReadFunction, listArticlesFunction]
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
      pipelineConfig: [getAccountIdforUser, isAuthorizedToCreateFunction, createDataFeedFunction],
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
      pipelineConfig: [getAccountIdforUser, getNewsletterFunction, isAuthorizedToUpdateFunction, subscribeToNewsletterFunction],
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
      pipelineConfig: [getAccountIdforUser, getNewsletterFunction, isAuthorizedToReadFunction, unsubscribeFromNewsletter]
    })

    new Resolver(this, 'GetSubscriptionStatusResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getUserSubscriptionStatus',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('getUserSubscriptionStatus', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, getNewsletterFunction, isAuthorizedToReadFunction, getUserSubscriptionStatusFunction]
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
        getAccountIdforUser,
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
      pipelineConfig: [getAccountIdforUser, getNewsletterFunction, isAuthorizedToReadFunction, getNewsletterSubscriberStatsFunction]
    })

    new Resolver(this, 'canManageNewsletterResolver', {
      api,
      typeName: 'Query',
      fieldName: 'canManageNewsletter',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('canManageNewsletter', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, getNewsletterFunction, isAuthorizedToUpdateFunction]
    })

    new Resolver(this, 'canManageDataFeedResolver', {
      api,
      typeName: 'Query',
      fieldName: 'canManageDataFeed',
      code: Code.fromAsset(functionsPath, {
        bundling: getFunctionBundlingOptions('canManageDataFeed', 'resolver')
      }),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAccountIdforUser, getDataFeedFunction, isAuthorizedToUpdateFunction]
    })
  }
}
