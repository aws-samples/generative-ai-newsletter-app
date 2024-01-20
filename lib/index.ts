import { Stack, type StackProps } from 'aws-cdk-lib'
import { NewsSubscriptionIngestion, newsSubscriptionTableLSI } from './subscription-ingestion'
import { NewsletterGenerator } from './newsletter-generator'
import { Authentication } from './authentication'
import { API } from './api'
import { UserInterface } from './user-interface'
import { type Construct } from 'constructs'

export class GenAINewsletter extends Stack {
  constructor (scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    const authentication = new Authentication(this, 'AuthenticationStack')

    const newsSubscriptionIngestion = new NewsSubscriptionIngestion(this, 'NewsletterIngestionStack')

    const newsletterGenerator = new NewsletterGenerator(this, 'NewsletterGenerator', {
      newsSubscriptionTable: newsSubscriptionIngestion.newsSubscriptionTable,
      newsSubscriptionTableLSI,
      userPoolId: authentication.userPoolId
    })

    const api = new API(this, 'API', {
      userPoolId: authentication.userPoolId,
      newsSubscriptionTable: newsSubscriptionIngestion.newsSubscriptionTable,
      newsletterTable: newsletterGenerator.newsletterTable,
      emailBucket: newsletterGenerator.emailBucket,
      functions: {
        createNewsletterFunction: newsletterGenerator.createNewsletterFunction,
        userSubscriberFunction: newsletterGenerator.userSubscriberFunction,
        userUnsubscriberFunction: newsletterGenerator.userUnsubscriberFunction,
        feedSubscriberFunction: newsSubscriptionIngestion.feedSubscriberFunction,
        getNewsletterFunction: newsletterGenerator.getNewsletterFunction
      }
    })

    new UserInterface(this, 'UserInterface', {
      userPool: authentication.userPool,
      userPoolClientId: authentication.userPoolClientId,
      identityPool: authentication.identityPool,
      emailBucket: newsletterGenerator.emailBucket,
      // graphqlApi: apiStack.graphqlApi,
      graphqlApiUrl: api.graphqlApiUrl,
      graphqlApiKey: api.graphqlApiKey
    })
  }
}
