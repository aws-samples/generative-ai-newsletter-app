#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { NewsletterIngestionStack } from '../lib/newsletter-ingestion'

const app = new cdk.App()
new NewsletterIngestionStack(app, 'NewsletterIngestionStack')
