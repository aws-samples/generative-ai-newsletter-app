import { type GraphqlApi, Code, AppsyncFunction, FunctionRuntime, Resolver, LambdaDataSource } from 'aws-cdk-lib/aws-appsync'
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
    const { api, newsSubscriptionTable, newsletterTable } = props

    const newsletterTableSource = api.addDynamoDbDataSource('NewsletterTableSource', newsletterTable)
    newsletterTable.grantReadData(newsletterTableSource)
    const newsSubscriptionTableSource = api.addDynamoDbDataSource('NewsSubscriptionTableSource', newsSubscriptionTable)

    const resolversPath = path.join(__dirname, 'resolver-functions')
    const getResolverBundlingOptions = (resolverName: string): BundlingOptions => {
      return {
        outputType: BundlingOutput.SINGLE_FILE,
        command: [
          'sh',
          '-c',
          [
            `npm --silent --prefix "${resolversPath}" install`,
            `npm --silent --prefix "${resolversPath}" run build -- -outdir=./${resolverName}/ ./${resolverName}/index.ts`,
            'ls -la',
            `mv -f ${resolversPath}/${resolverName}/index.js /asset-output/`
          ].join(' && ')
        ],
        image: DockerImage.fromRegistry('public.ecr.aws/sam/build-nodejs20.x:latest'),
        local: {
          tryBundle (outputDir: string) {
            try {
              const options: ExecSyncOptionsWithBufferEncoding = {
                stdio: 'inherit',
                env: {
                  ...process.env
                }
              }
              execSync(`npm --silent --prefix "${resolversPath}" install`, options)
              execSync(`npm --silent --prefix "${resolversPath}" run build -- --outdir=./${resolverName}/ ./${resolverName}/index.ts`, options)
              execSync(`mv -f ${resolversPath}/${resolverName}/index.js ${outputDir}`, options)
            } catch (e) {
              console.error(e)
              return false
            }
            return true
          }
        }
      }
    }

    const getNewslettersResolverFunction = new AppsyncFunction(this, 'GetNewslettersResolverFunction', {
      name: 'getNewsletters',
      api,
      dataSource: newsletterTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('getNewsletters') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'GetNewslettersResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getNewsletters',
      code: Code.fromInline(`
          export function request(ctx) {
            return {};
            }
    
            export function response(ctx) {
            return ctx.prev.result;
            }
            `),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewslettersResolverFunction]
    })

    const getNewsletterEmailsResolverFunction = new AppsyncFunction(this, 'GetNewsletterEmailsResolverFunction', {
      name: 'getNewsletterEmails',
      api,
      dataSource: newsletterTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('getNewsletterEmails') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'GetNewsletterEmailsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getNewsletterEmails',
      code: Code.fromInline(`
          export function request(ctx) {
            return {};
            }
    
            export function response(ctx) {
            return ctx.prev.result;
            }
            `),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewsletterEmailsResolverFunction]
    })

    const getNewsletterEmailResolverFunction = new AppsyncFunction(this, 'GetNewsletterEmailResolverFunction', {
      name: 'getNewsletterEmail',
      api,
      dataSource: newsletterTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('getNewsletterEmail') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'GetNewsletterEmailResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getNewsletterEmail',
      code: Code.fromInline(`
      export function request(ctx) {
        return {};
      }

      export function response(ctx) {
          return ctx.prev.result;
      }`),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewsletterEmailResolverFunction]
    })

    const getNewsletterLambdaSource = new LambdaDataSource(this, 'GetNewsletterLambdaSource', {
      api,
      lambdaFunction: props.functions.getNewsletterFunction,
      name: 'getNewsletterLambdaSource'
    })

    props.functions.getNewsletterFunction.grantInvoke(getNewsletterLambdaSource.grantPrincipal)

    new Resolver(this, 'GetNewsletterResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getNewsletter',
      dataSource: getNewsletterLambdaSource,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromInline(`
      export function request(ctx) {
        const { newsletterId } = ctx.args.input
        return {
          operation: 'Invoke',
          payload: {
            newsletterId: newsletterId,
          }
        }
      }

      export function response(ctx) {
        return ctx.result;
      }
      `)
    })

    const updateNewsletterResolverFunction = new AppsyncFunction(this, 'UpdateNewsletterResolverFunction', {
      name: 'updateNewsletter',
      api,
      dataSource: newsletterTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('updateNewsletter') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'UpdateNewsletterResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateNewsletter',
      code: Code.fromInline(`
      export function request(ctx) {
        return {
            input: ctx.args.input,
            newsletterId: ctx.args.newsletterId
        }
      }
    
      export function response(ctx) {
        return true;
      }`),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [updateNewsletterResolverFunction]
    })

    const getDataFeedSubscriptionsResolverFunction = new AppsyncFunction(this, 'GetDataFeedSubscriptionsResolverFunction', {
      name: 'getDataFeedSubscriptions',
      api,
      dataSource: newsSubscriptionTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('getDataFeedSubscriptions') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'GetDataFeedSubscriptionsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getDataFeedSubscriptions',
      code: Code.fromInline(`
        export function request(ctx) {
        return {};
        }

        export function response(ctx) {
        return ctx.prev.result;
        }
        `),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getDataFeedSubscriptionsResolverFunction]
    })

    const getDataFeedSubscriptionResolverFunction = new AppsyncFunction(this, 'GetDataFeedSubscriptionResolverFunction', {
      name: 'getDataFeedSubscription',
      api,
      dataSource: newsSubscriptionTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('getDataFeedSubscription') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'GetDataFeedSubscriptionResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getDataFeedSubscription',
      code: Code.fromInline(`
        export function request(ctx) {
        return {};
        }

        export function response(ctx) {
        return ctx.prev.result;
        }
        `),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getDataFeedSubscriptionResolverFunction]
    })

    const updateDataFeedResolverFunction = new AppsyncFunction(this, 'UpdateDataFeedResolverFunction', {
      name: 'updateDataFeed',
      api,
      dataSource: newsSubscriptionTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('updateDataFeed') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    // TODO: Rename this.... spelling....
    new Resolver(this, 'UpdateDataFeedResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'updateDataFeed',
      code: Code.fromInline(`
      export function request(ctx) {
        return {
            input: ctx.args.input,
            subscriptionId: ctx.args.subscriptionId
        }
      }
    
      export function response(ctx) {
        return true;
      }`),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [updateDataFeedResolverFunction]
    })

    const getDataFeedArticlesResolverFunction = new AppsyncFunction(this, 'GetDataFeedArticlesResolverFunction', {
      name: 'getDataFeedArticles',
      api,
      dataSource: newsSubscriptionTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('getDataFeedArticles') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'GetDataFeedArticlesResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getDataFeedArticles',
      code: Code.fromInline(`
        export function request(ctx) {
        return {};
        }

      export function response(ctx) {
      return ctx.prev.result;
      }
      `),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getDataFeedArticlesResolverFunction]
    })

    const flagDataFeedArticleFunction = new AppsyncFunction(this, 'FlagDataFeedArticleFunction', {
      name: 'flagDataFeedArticle',
      api,
      dataSource: newsSubscriptionTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('flagDataFeedArticle') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'FlagDataFeedArticleResolver', {
      api,
      typeName: 'Mutation',
      fieldName: 'flagDataFeedArticle',
      code: Code.fromInline(`
      export function request(ctx) {
        return {}
      }
    
      export function response(ctx) {
        return true;
      }`),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [flagDataFeedArticleFunction]
    })

    const dataFeedSubscriberLambdaSource = new LambdaDataSource(this, 'DataFeedSubscriberLambdaSource', {
      api,
      lambdaFunction: props.functions.feedSubscriberFunction,
      name: 'DataFeedSubscriberLambdaSource'
    })

    props.functions.feedSubscriberFunction.grantInvoke(dataFeedSubscriberLambdaSource)

    new Resolver(this, 'DataFeedSubscriberResolver', {
      api,
      dataSource: dataFeedSubscriberLambdaSource,
      typeName: 'Mutation',
      fieldName: 'createDataFeedSubscription',
      code: Code.fromInline(`
      export function request(ctx) {
        const { sub } = ctx.identity
        return {
          operation: 'Invoke',
          payload: {
            owner: sub,
            input: ctx.args.input
          }
        }
      }

      export function response(ctx) {
        return ctx.result;
      }
      `),
      runtime: FunctionRuntime.JS_1_0_0
    })

    const newsletterCreatorLambdaSource = new LambdaDataSource(this, 'NewsletterCreatorLambdaSource', {
      api,
      lambdaFunction: props.functions.createNewsletterFunction,
      name: 'NewsletterCreatorLambdaSource'
    })
    props.functions.createNewsletterFunction.grantInvoke(newsletterCreatorLambdaSource.grantPrincipal)

    new Resolver(this, 'CreateNewsletterResolver', {
      api,
      dataSource: newsletterCreatorLambdaSource,
      typeName: 'Mutation',
      fieldName: 'createNewsletter',
      code: Code.fromInline(`
      import { util } from '@aws-appsync/utils';
      export function request(ctx) {
        const { title, numberOfDaysToInclude, discoverable, subscriptionIds, shared } = ctx.args.input
        const { sub } = ctx.identity
        return {
          operation: 'Invoke',
          payload: {
            input: {
              title:title, 
              numberOfDaysToInclude:numberOfDaysToInclude, 
              discoverable:discoverable, 
              subscriptionIds:subscriptionIds, 
              shared:shared
            },
            owner: sub            
          }
        }
      }

      export function response(ctx) {
        return ctx.result;
      }
      `),
      runtime: FunctionRuntime.JS_1_0_0
    })

    const userSubscriberLambdaSource = new LambdaDataSource(this, 'UserSubscriberLambdaSource', {
      api,
      lambdaFunction: props.functions.userSubscriberFunction,
      name: 'UserSubscriberLambdaSource'
    })

    props.functions.userSubscriberFunction.grantInvoke(userSubscriberLambdaSource.grantPrincipal)

    new Resolver(this, 'UserSubscriberResolver', {
      api,
      dataSource: userSubscriberLambdaSource,
      typeName: 'Mutation',
      fieldName: 'subscribeToNewsletter',
      code: Code.fromInline(`
      import { util } from '@aws-appsync/utils';
      export function request(ctx) {
        const { sub } = ctx.identity
        const { newsletterId } = ctx.args.input
        return {
          operation: 'Invoke',
          payload: {
            cognitoUserId: sub,
            newsletterId: newsletterId
          }
        }
      }

      export function response(ctx) {
        return ctx.result;
      }
      `),
      runtime: FunctionRuntime.JS_1_0_0
    })

    const userUnsubscriberLambdaSource = new LambdaDataSource(this, 'UserUnsubscriberLambdaSource', {
      api,
      lambdaFunction: props.functions.userUnsubscriberFunction,
      name: 'UserUnsubscriberLambdaSource'
    })

    props.functions.userUnsubscriberFunction.grantInvoke(userUnsubscriberLambdaSource.grantPrincipal)

    new Resolver(this, 'UserUnsubscriberResolver', {
      api,
      dataSource: userUnsubscriberLambdaSource,
      typeName: 'Mutation',
      fieldName: 'unsubscribeFromNewsletter',
      code: Code.fromInline(`
      import { util } from '@aws-appsync/utils';
      export function request(ctx) {
        const { sub } = ctx.identity
        const { newsletterId } = ctx.args.input
        return {
          operation: 'Invoke',
          payload: {
            cognitoUserId: sub,
            newsletterId: newsletterId
          }
        }
      }

      export function response(ctx) {
        return ctx.result;
      }
      `),
      runtime: FunctionRuntime.JS_1_0_0
    })

    const getUserNewsletterSubscriptionStatusFunction = new AppsyncFunction(this, 'GetUserNewsletterSubscriptionStatusFunction', {
      name: 'getUserNewsletterSubscriptionStatus',
      api,
      dataSource: newsletterTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('getUserNewsletterSubscriptionStatus') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'GetUserNewsletterSubscriptionStatusResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getUserNewsletterSubscriptionStatus',
      code: Code.fromInline(`
      export function request(ctx) {
        ctx.args.newsletterTable = '` + newsletterTable.tableName + `'
        return {}
      }

      export function response(ctx) {
          return ctx.prev.result;
      }
      `),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getUserNewsletterSubscriptionStatusFunction]
    })

    const getUserNewsletterSubscriptionsFunction = new AppsyncFunction(this, 'GetUserNewsletterSubscriptionsFunction', {
      name: 'getUserNewsletterSubscriptions',
      api,
      dataSource: newsletterTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('getUserNewsletterSubscriptions') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'GetUserNewsletterSubscriptionsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getUserNewsletterSubscriptions',
      code: Code.fromInline(`
      export function request(ctx) {
        return {};
        }

        export function response(ctx) {
        return ctx.prev.result;
        }
      `),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getUserNewsletterSubscriptionsFunction, getNewslettersResolverFunction]
    })

    const getNewsletterSubscriberStatsFunction = new AppsyncFunction(this, 'getNewsletterSubscriberStatsFunction', {
      name: 'getNewsletterSubscriberStats',
      api,
      dataSource: newsletterTableSource,
      code: Code.fromAsset(resolversPath, { bundling: getResolverBundlingOptions('getNewsletterSubscriberStats') }),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'getNewsletterSubscriberStatsResolver', {
      api,
      typeName: 'Query',
      fieldName: 'getNewsletterSubscriberStats',
      code: Code.fromInline(`
      export function request(ctx) {
        return {};
        }

        export function response(ctx) {
        return ctx.prev.result;
        }
      `),
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getNewsletterSubscriberStatsFunction]
    })
  }
}
