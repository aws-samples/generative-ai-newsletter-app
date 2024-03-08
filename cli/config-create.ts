import * as fs from 'fs'
import { type DeployConfig } from '../lib/shared/common/deploy-config'
import { bigHeader, formatText } from './consts'
import prompt from 'prompt-sync'
import { CONFIG_VERSION } from './config-version'
import path from 'path'
const deployConfig = path.join(__dirname, '../bin/config.json')

const prompter = prompt({ sigint: true })

console.log(
  bigHeader(
    'CDK Deployment Configuration Creator for the GenAI Newsletter App.'
  )
)
let configStyle: 'EXISTING' | 'UPDATE' | 'NEW' = 'NEW'
let config: DeployConfig | null = null
if (fs.existsSync(deployConfig)) {
  const configFromFile: DeployConfig = JSON.parse(
    fs.readFileSync(deployConfig, 'utf8')
  )
  console.log(formatText('A configuration already exists.', { bold: true }))
  console.log(JSON.stringify(configFromFile, null, '\t'))
  let existingConfigChoice: string | null = null
  let readyToProceed = false
  while (!readyToProceed) {
    console.log(formatText('\nDo you want to \n', { bold: true }))
    console.log(
      '   ▶️ (' +
        formatText('e', { textColor: 'green' }) +
        ') Use ' +
        formatText('EXISTING', { textColor: 'green' }) +
        ' configuration? \n' +
        '   ▶️ (' +
        formatText('u', { textColor: 'yellow' }) +
        ') ' +
        formatText('UPDATE', { textColor: 'yellow' }) +
        ' existing configuration? \n' +
        '   ▶️ (' +
        formatText('n', { textColor: 'red' }) +
        ') Create a ' +
        formatText('NEW', { textColor: 'red' }) +
        ' configuration that will replace the existing configuration?'
    )
    existingConfigChoice = prompter(formatText('(E/u/n):', { bold: true }), 'e')
    if (existingConfigChoice.length > 0) {
      existingConfigChoice = existingConfigChoice.toLowerCase()
    }

    switch (existingConfigChoice) {
      case 'u':
        console.log(
          formatText('Update existing configuration\n', {
            bold: true
          })
        )
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
        console.log(
          formatText('Invalid Input!', {
            bold: true,
            backgroundColor: 'bg-red',
            textColor: 'white'
          })
        )
        break
    }
  }
}
console.log(
  formatText('Requirements Check', {
    bigHeader: true,
    textColor: 'blue',
    bold: true
  })
)
console.log(
  'This app relies on certain resources to exist in your AWS environment prior to deployment.'
)
console.log(
  'Please ensure that the following resources exist in your AWS environment before proceeding:\n'
)
console.log(
  '   ▶️ SES/Pinpoint Verified Identity ARN for outbound email sending'
)
const requirementsMet = prompter(
  formatText('Are you ready to proceed? (Y/n):', { bold: true }),
  'Y'
)
if (requirementsMet.toLowerCase() !== 'y') {
  console.log(
    formatText('Exiting...', {
      bold: true,
      backgroundColor: 'bg-red',
      textColor: 'white'
    })
  )
  process.exit(0)
}
if (['UPDATE', 'NEW'].includes(configStyle)) {
  if (configStyle === 'NEW') {
    config = {
      stackName: 'GenAINewsletter',
      pinpointEmail: {
        senderAddress: '',
        verifiedIdentity: ''
      },
      configVersion: CONFIG_VERSION,
      selfSignUpEnabled: false
    }
  }
  if (config !== null) {
    console.log(
      formatText('Updating existing configuration....', { bold: true })
    )
    console.log(
      formatText(
        'If a property already exists, it will be shown in parenthesis (). Leave the response blank to keep the existing configuration value\n',
        { bold: true }
      )
    )
    let stackNameApproved = false
    while (!stackNameApproved) {
      console.log(formatText('Stack Name:', { textColor: 'blue' }))
      const stackName = prompter(
        `(${config?.stackName}):`,
        config?.stackName ?? ''
      )
      if (stackName.length > 0) {
        config.stackName = stackName
        stackNameApproved = true
      } else if (
        config.stackName === undefined ||
        (config.stackName.length < 1 && stackName.length < 1)
      ) {
        console.log(
          formatText('Invalid Input!', {
            backgroundColor: 'bg-white',
            textColor: 'red',
            bold: true
          })
        )
      } else if (config.stackName.length > 0) {
        stackNameApproved = true
      }
    }
    let pinpointIdentityApproved = false
    while (!pinpointIdentityApproved) {
      console.log(
        formatText('SES/Pinpoint Verified Identity ARN:', {
          textColor: 'blue'
        })
      )
      const pinpointIdentity = prompter(
        `(${config?.pinpointEmail.verifiedIdentity}):`,
        config?.pinpointEmail.verifiedIdentity ?? ''
      )
      if (pinpointIdentity.length > 0) {
        config.pinpointEmail.verifiedIdentity = pinpointIdentity
        pinpointIdentityApproved = true
      } else if (
        config.pinpointEmail.verifiedIdentity.length < 1 &&
        pinpointIdentity.length < 1
      ) {
        console.log(
          formatText('Invalid Input!', {
            backgroundColor: 'bg-white',
            textColor: 'red',
            bold: true
          })
        )
      } else if (config.pinpointEmail.verifiedIdentity.length > 0) {
        pinpointIdentityApproved = true
      }
    }
    let pinpointSenderApproved = false
    while (!pinpointSenderApproved) {
      console.log(
        formatText(
          'What is the email address used to send Newsletter emails?',
          { textColor: 'blue' }
        )
      )
      console.log(
        formatText(
          'Note: this email should be part of the approved identity you provided',
          { italic: true }
        )
      )
      const pinpointSender = prompter(
        `(${config?.pinpointEmail.senderAddress}):`,
        config?.pinpointEmail.senderAddress ?? ''
      )
      if (pinpointSender.length > 0) {
        config.pinpointEmail.senderAddress = pinpointSender
        pinpointSenderApproved = true
        break
      }
      console.log(
        formatText('Invalid Input!', {
          backgroundColor: 'bg-white',
          textColor: 'red',
          bold: true
        })
      )
    }
    let addEnvData = false
    if (config.env === undefined) {
      console.log(
        formatText(
          'Do you want to set the deployment AWS Account ID & Region?',
          { textColor: 'blue' }
        )
      )
      console.log(
        formatText(
          'Not typically needed, but useful if you want to persist deployment destintation outside of the CDK context',
          { italic: true }
        )
      )
      const addEnv = prompter(
        formatText('Do you want to proceed? (y/N):', { bold: true }),
        'N'
      )
      if (addEnv.toLowerCase() === 'y') {
        addEnvData = true
      }
    }
    if (
      addEnvData ||
      config.env?.account != null ||
      config.env?.region != null
    ) {
      console.log(
        formatText('Deployment AWS Account ID', { textColor: 'blue' })
      )
      const accountId = prompter(
        config?.env?.account !== undefined
          ? `(${config?.env?.account}):`
          : 'Account ID:',
        config?.env?.account ?? ''
      )
      if (config.env == null) {
        config.env = {}
      }
      config.env.account = accountId ?? ''
      console.log(formatText('Deployment AWS Region', { textColor: 'blue' }))
      const region = prompter(
        config?.env?.region !== undefined
          ? `(${config?.env?.region}):`
          : 'AWS Region:',
        config?.env?.region ?? ''
      )
      config.env.region = region ?? ''
    }
    let selfSignUpResponseApproved = false
    while (!selfSignUpResponseApproved) {
      const response = prompter(
        formatText('Do you want to enable self sign up? (y/N):', {
          bold: true,
          textColor: 'blue'
        }),
        'N'
      )
      if (response.toLowerCase() === 'y') {
        config.selfSignUpEnabled = true
        selfSignUpResponseApproved = true
      } else if (response.toLowerCase() === 'n') {
        selfSignUpResponseApproved = true
        config.selfSignUpEnabled = false
      } else {
        console.log(
          formatText('Invalid Input!', {
            backgroundColor: 'bg-white',
            textColor: 'red',
            bold: true
          })
        )
      }
    }
  }
  fs.writeFileSync(deployConfig, JSON.stringify(config, null, '\t'))
}
if (config !== null) {
  console.log(
    formatText('Configuration Complete! 💫', {
      backgroundColor: 'bg-green',
      textColor: 'white',
      bold: true
    })
  )
  console.log(
    formatText('You GenAI Newsletter App Stack is ready for deployment. 🥳', {
      bold: true
    })
  )
}
