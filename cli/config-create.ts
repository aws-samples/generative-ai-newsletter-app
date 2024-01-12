import * as fs from 'fs'
import { type CDKConfig } from './types'
import { bigHeader, formatText } from './consts'
import prompt from 'prompt-sync'
const cdkContext = './cdk.context.json'

const prompter = prompt({ sigint: true })

console.log(bigHeader('CDK Deployment Configuration Creator for the GenAI Newsletter App.'))
let configStyle: 'EXISTING' | 'UPDATE' | 'NEW' = 'NEW'
let config: CDKConfig | null = null
if (fs.existsSync(cdkContext)) {
  const configFromFile: CDKConfig = JSON.parse(fs.readFileSync(cdkContext, 'utf8'))
  console.log(formatText('A configuration already exists.', { bold: true }))
  console.log(JSON.stringify(configFromFile, null, '\t'))
  let existingConfigChoice: string | null = null
  let readyToProceed = false
  while (!readyToProceed) {
    console.log(formatText('\nDo you want to \n', { bold: true }))
    console.log('   ▶️ (' + formatText('e', { textColor: 'GREEN' }) + ') Use ' + formatText('EXISTING', { textColor: 'GREEN' }) + ' configuration? \n' +
                '   ▶️ (' + formatText('u', { textColor: 'YELLOW' }) + ') ' + formatText('UPDATE', { textColor: 'YELLOW' }) + ' existing configuration? \n' +
                '   ▶️ (' + formatText('n', { textColor: 'RED' }) + ') Create a ' + formatText('NEW', { textColor: 'RED' }) + ' configuration that will replace the existing configuration?')
    existingConfigChoice = prompter(formatText('(E/u/n):', { bold: true }), 'e')
    if (existingConfigChoice.length > 0) {
      existingConfigChoice = existingConfigChoice.toLowerCase()
    }

    switch (existingConfigChoice) {
      case 'u':
        console.log(formatText('Update existing configuration\n', { bold: true }))
        configStyle = 'UPDATE'
        config = configFromFile
        readyToProceed = true
        break
      case 'n':
        console.log(formatText('Create a new configuration', { bold: true }))
        configStyle = 'NEW'
        readyToProceed = true
        break
      case 'e':
        console.log(formatText('Use existing configuration', { bold: true }))
        configStyle = 'EXISTING'
        config = configFromFile
        readyToProceed = true
        break
      default:
        console.log(formatText('Invalid Input!', { bold: true, backgroundColor: 'RED', textColor: 'WHITE' }))
        break
    }
  }
}
console.log(formatText('Requirements Check', { bigHeader: true, textColor: 'BLUE', bold: true }))
console.log('This app relies on certain resources to exist in your AWS environment prior to deployment.')
console.log('Please ensure that the following resources exist in your AWS environment before proceeding:\n')
console.log('   ▶️ SES/Pinpoint Verified Identity ARN for outbound email sending')
const requirementsMet = prompter(formatText('Are you ready to proceed? (Y/n):', { bold: true }), 'Y')
if (requirementsMet.toLowerCase() !== 'y') {
  console.log(formatText('Exiting...', { bold: true, backgroundColor: 'RED', textColor: 'WHITE' }))
  process.exit(0)
}
if (['UPDATE', 'NEW'].includes(configStyle)) {
  if (configStyle === 'NEW') {
    config = {
      pinpointIdentity: ''
    }
  }
  if (config !== null) {
    console.log(formatText('Updating existing configuration....', { bold: true }))
    console.log(formatText('If a property already exists, it will be shown in parenthesis (). Leave the response blank to keep the existing configuration value\n', { bold: true }))
    let pinpointIdentityApproved = false
    while (!pinpointIdentityApproved) {
      console.log(formatText('SES/Pinpoint Verified Identity ARN:', { textColor: 'BLUE' }))
      const pinpointIdentity = prompter(`(${config?.pinpointIdentity}):`, config?.pinpointIdentity ?? '')
      if (pinpointIdentity.length > 0) {
        config.pinpointIdentity = pinpointIdentity
        pinpointIdentityApproved = true
      } else if (config.pinpointIdentity.length < 1 && pinpointIdentity.length < 1) {
        console.log(formatText('Invalid Input!', { backgroundColor: 'WHITE', textColor: 'RED', bold: true }))
      } else if (config.pinpointIdentity.length > 0) {
        pinpointIdentityApproved = true
      }
    }
  }
  fs.writeFileSync(cdkContext, JSON.stringify(config, null, '\t'))
}
if (config !== null) {
  console.log(formatText('Configuration Complete! 💫', { backgroundColor: 'GREEN', textColor: 'WHITE', bold: true }))
  console.log(formatText('You GenAI Newsletter App Stack is ready for deployment. 🥳', {
    bold: true
  }))
}
