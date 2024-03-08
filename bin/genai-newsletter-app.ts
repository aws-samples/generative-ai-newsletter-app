#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { GenAINewsletter } from '../lib'
import getConfig from '../lib/config'
import path from 'path'

const app = new App()

const config = getConfig(path.join(__dirname, 'config.json'))
const baseName = config.stackName ?? 'GenAINewsletter'

new GenAINewsletter(app, baseName)
