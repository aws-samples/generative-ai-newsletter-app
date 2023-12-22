import { type App } from 'aws-cdk-lib'
import { NewsSubscriptionIngestionStack } from './subscription-ingestion'
import { NewsletterGeneratorStack } from './newsletter-generator'
import { Construct } from 'constructs'
import { AuthenticationStack } from './authentication'

export class GenAINewsletter extends Construct {
  constructor (app: App, id: string) {
    super(app, id)
    new AuthenticationStack(app, 'AuthenticationStack', { description: 'User Authentication for GenAI Newsletter App' })

    const newsSubscriptionIngestionStack = new NewsSubscriptionIngestionStack(app, 'NewsletterIngestionStack', {
      description: 'Ingestion of News Subscriptions for GenAI Newsletter App'
    })

    new NewsletterGeneratorStack(app, 'NewsletterGeneratorStack', {
      newsSubscriptionTable: newsSubscriptionIngestionStack.newsSubscriptionTable,
      newsSubscriptionTableLSI: newsSubscriptionIngestionStack.newsSubscriptionTableLSI,
      description: 'Newsletter Generation for GenAI Newsletter App'
    })
  }
}
