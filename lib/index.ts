import { Stack } from 'aws-cdk-lib'
import { NewsSubscriptionIngestionStack } from './subscription-ingestion'
import { NewsletterGeneratorStack } from './newsletter-generator'
import { type Construct } from 'constructs'
import { AuthenticationStack } from './authentication'

export class GenAINewsletter extends Stack {
  constructor (scope: Construct, id: string) {
    super(scope, id)
    new AuthenticationStack(this, 'AuthenticationStack', { description: 'User Authentication for GenAI Newsletter App' })
    const newsSubscriptionIngestionStack = new NewsSubscriptionIngestionStack(this, 'NewsletterIngestionStack', {
      description: 'Ingestion of News Subscriptions for GenAI Newsletter App'
    })
    new NewsletterGeneratorStack(this, 'NewsletterGeneratorStack', {
      newsSubscriptionTable: newsSubscriptionIngestionStack.newsSubscriptionTable,
      newsSubscriptionTableLSI: newsSubscriptionIngestionStack.newsSubscriptionTableLSI,
      description: 'Newsletter Generation for GenAI Newsletter App'
    })
  }
}
