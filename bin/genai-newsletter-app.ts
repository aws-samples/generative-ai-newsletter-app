#!/usr/bin/env node
import 'source-map-support/register'
import { App, Aspects } from 'aws-cdk-lib'
import { GenAINewsletter } from '../lib'
import getConfig from '../lib/config'
import path from 'path'
import { AwsSolutionsChecks } from 'cdk-nag'
import { addNagSuppressions } from '../lib/cdk-nag-supressions'

const app = new App()

const config = getConfig(path.join(__dirname, 'config.json'))
const baseName = config.stackName ?? 'GenAINewsletter'

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))

const genAiNewsletterApp = new GenAINewsletter(app, baseName)

addNagSuppressions(genAiNewsletterApp)
