import * as fs from 'fs'
import { type CDKConfig } from './types'
import { bigHeader } from './consts'
const cdkContext = './cdk.context.json'

console.log('Checking for existing configuration....')
if (fs.existsSync(cdkContext)) {
  const config: CDKConfig = JSON.parse(
    fs.readFileSync(cdkContext, 'utf8')
  )
  console.log('CDK Deployment Configuration Located!')
  console.log(bigHeader('GenAI Newsletter Deployment Configuration'))
  console.log(JSON.stringify(config, null, '\t'))
} else {
  console.log('No cdk.context.json file found in the root of your project!')
  console.log('#######################')
  console.log('Please run "npm run config" to setup your deployment configurations.')
}
