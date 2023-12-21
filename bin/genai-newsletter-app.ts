#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { GenAINewsletter } from '../lib'

const app = new cdk.App()
new GenAINewsletter(app, 'GenAINewsletter')
