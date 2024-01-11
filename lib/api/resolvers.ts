import { type GraphqlApi, Code, AppsyncFunction, FunctionRuntime, Resolver, LambdaDataSource } from 'aws-cdk-lib/aws-appsync'
import { Construct } from 'constructs'
import path = require('path')
import { type ApiProps } from '.'

interface ApiResolversProps extends ApiProps {
  api: GraphqlApi
}

export class ApiResolvers extends Construct {
  constructor (scope: Construct, id: string, props: ApiResolversProps) {
    super(scope, id)
    const { api, newsSubscriptionTable, newsletterTable } = props

    const newsletterTableSource = api.addDynamoDbDataSource('NewsletterTableSource', newsletterTable)
    const newsSubscriptionTableSource = api.addDynamoDbDataSource('NewsSubscriptionTableSource', newsSubscriptionTable)

    const getNewslettersResolverFunction = new AppsyncFunction(this, 'GetNewslettersResolverFunction', {
      name: 'getNewsletters',
      api,
      dataSource: newsletterTableSource,
      code: Code.fromAsset(path.join(__dirname, 'resolverFunctions/getNewsletters.js')),
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
      code: Code.fromAsset(path.join(__dirname, 'resolverFunctions/updateNewsletter.js')),
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
      code: Code.fromAsset(path.join(__dirname, 'resolverFunctions/getDataFeedSubscriptions.js')),
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
      code: Code.fromAsset(path.join(__dirname, 'resolverFunctions/getDataFeedSubscription.js')),
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
      code: Code.fromAsset(path.join(__dirname, 'resolverFunctions/updateDataFeed.js')),
      runtime: FunctionRuntime.JS_1_0_0
    })

    new Resolver(this, 'UpdatDataFeedResolver', {
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
      code: Code.fromAsset(path.join(__dirname, 'resolverFunctions/getDataFeedArticles.js')),
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
        const { url, discoverable } = ctx.args.input
        return {
          operation: 'Invoke',
          payload: {
            url: url,
            discoverable: discoverable
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
        return {
          operation: 'Invoke',
          payload: {
            title:title, 
            numberOfDaysToInclude:numberOfDaysToInclude, 
            discoverable:discoverable, 
            subscriptionIds:subscriptionIds, 
            shared:shared
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

    // TODO: Newsletter Subscriber Lookup Functionality
  }
}
