import * as fs from 'fs'
import { type DeployConfig } from '@shared/common/deploy-config'
import { bigHeader } from './consts'
const configFile = './bin/config.json'

console.log('Checking for existing configuration....')
if (fs.existsSync(configFile)) {
  const config: DeployConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'))
  console.log('Deployment Configuration Located!')
  console.log(bigHeader('GenAI Newsletter Deployment Configuration'))
  console.log(JSON.stringify(config, null, '\t'))
} else {
  console.log('No config file found in ./bin/config.json!')
  console.log('#######################')
  console.log(
    'Please run "npm run config" to setup your deployment configurations.'
  )
}
