#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { GenAINewsletter } from '../lib'
import getConfig from './config'

const app = new App()

const config = getConfig()
const { stackName, env } = config

new GenAINewsletter(app, 'GenAINewsletter', {
  stackName,
  config,
  env
})
