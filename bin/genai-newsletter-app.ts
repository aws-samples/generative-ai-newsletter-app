#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { NewsSubscriptionIngestionStack } from '../lib/subscription-ingestion'
import { NewsletterGeneratorStack } from '../lib/newsletter-generator'

const app = new cdk.App()
const newsSubscriptionIngestionStack = new NewsSubscriptionIngestionStack(app, 'NewsletterIngestionStack')
new NewsletterGeneratorStack(app, 'NewsletterGeneratorStack', {
  newsSubscriptionTable: newsSubscriptionIngestionStack.newsSubscriptionTable,
  newsSubscriptionTableLSI: newsSubscriptionIngestionStack.newsSubscriptionTableLSI
})
