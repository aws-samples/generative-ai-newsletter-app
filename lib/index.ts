import { Stack } from 'aws-cdk-lib'
import { NewsSubscriptionIngestion, newsSubscriptionTableLSI } from './subscription-ingestion'
import { NewsletterGenerator } from './newsletter-generator'
import { Authentication } from './authentication'
import { API } from './api'
import { UserInterface } from './user-interface'
import { type Construct } from 'constructs'

export class GenAINewsletter extends Stack {
  constructor (scope: Construct, id: string) {
    super(scope, id)
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
      functions: {
        createNewsletterFunction: newsletterGenerator.createNewsletterFunction,
        userSubscriberFunction: newsletterGenerator.userSubscriberFunction,
        feedSubscriberFunction: newsSubscriptionIngestion.feedSubscriberFunction,
        getNewsletterFunction: newsletterGenerator.getNewsletterFunction
      }
    })

    new UserInterface(this, 'UserInterface', {
      userPoolId: authentication.userPoolId,
      userPoolClientId: authentication.userPoolClientId,
      identityPoolId: authentication.identityPoolId,
      // graphqlApi: apiStack.graphqlApi,
      graphqlApiUrl: api.graphqlApiUrl,
      graphqlApiKey: api.graphqlApiKey
    })
  }
}
