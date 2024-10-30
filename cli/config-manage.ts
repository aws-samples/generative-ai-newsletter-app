// config-manage.ts
import * as fs from 'fs';
import path from 'path';
import figlet from 'figlet';
import prompt from 'prompt-sync';
import { CONFIG_VERSION } from './config-version';
import { formatText } from './consts';
import { type DeployConfig } from '../lib/shared/common/deploy-config';

const deployConfig = path.join(__dirname, '../bin/config.json');
const prompter = prompt({ sigint: true });

interface ValidatorResponse {
  isValid: boolean;
  message?: string;
}

const validators = {
  stackName: (value: string): ValidatorResponse => ({
    isValid: value.length > 0,
    message: 'Stack name cannot be empty',
  }),

  pinpointIdentity: (value: string): ValidatorResponse => {
    const arnRegex = /^arn:aws:(ses|pinpoint):[a-z0-9-]+:\d{12}:/;
    return {
      isValid: arnRegex.test(value),
      message: 'Invalid ARN format. Should be a valid SES/Pinpoint ARN',
    };
  },

  email: (value: string): ValidatorResponse => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: emailRegex.test(value),
      message: 'Invalid email format',
    };
  },

  hostname: (value: string): ValidatorResponse => {
    const hostnameRegex = /^([a-zA-Z0-9](-?[a-zA-Z0-9])*\.)*[a-zA-Z0-9](-?[a-zA-Z0-9])*$/;
    return {
      isValid: hostnameRegex.test(value),
      message: 'Invalid hostname format',
    };
  },

  acmCert: (value: string): ValidatorResponse => {
    const acmCertRegex = /^arn:aws:acm:\S+:\d+:\w+\/\S+$/;
    return {
      isValid: acmCertRegex.test(value),
      message: 'Invalid ACM certificate ARN format',
    };
  },
};

async function promptForValue(
  promptValue: string,
  currentValue: string | undefined,
  validator: (value: string) => ValidatorResponse,
  isOptional = false,
): Promise<string | undefined> {
  let isValid = false;
  let value = currentValue;

  while (!isValid) {
    const displayPrompt = formatText(promptValue, { textColor: 'blue', bold: true });
    const currentValueDisplay = currentValue
      ? formatText(` (current: ${currentValue})`, { textColor: 'gray', italic: true })
      : '';

    console.log(`\n${displayPrompt}${currentValueDisplay}`);
    if (isOptional) {
      console.log(formatText('Press Enter to skip', { textColor: 'gray', italic: true }));
    }

    const input = prompter('> ');

    if (input === '' && currentValue) {
      return currentValue;
    }

    if (input === '' && isOptional) {
      return undefined;
    }

    const validation = validator(input);
    if (validation.isValid) {
      value = input;
      isValid = true;
    } else {
      console.log(formatText(`❌ ${validation.message}`, {
        textColor: 'red',
        bold: true,
      }));
    }
  }

  return value;
}

async function confirmAction(message: string, defaultValue = false): Promise<boolean> {
  const response = prompter(
    formatText(`${message} (${defaultValue ? 'Y/n' : 'y/N'}): `, { bold: true }),
    defaultValue ? 'Y' : 'N',
  );
  return response.toLowerCase() === 'y';
}

export async function interactiveManage(): Promise<void> {
  console.log(
    figlet.textSync('Configuration Manager', {
      font: 'Mini',
    }),
  );

  let config: DeployConfig | null = null;
  let configStyle: 'EXISTING' | 'UPDATE' | 'NEW' = 'NEW';

  // Check for existing configuration
  if (fs.existsSync(deployConfig)) {
    try {
      const configFromFile: DeployConfig = JSON.parse(
        fs.readFileSync(deployConfig, 'utf8'),
      );

      console.log(
        formatText('\n📁 Existing configuration detected!', {
          bold: true,
          backgroundColor: 'bg-blue',
          textColor: 'white',
        }),
      );

      console.log(formatText('\nChoose an option:', { bold: true }));
      console.log(
        `   ▶️ (${formatText('e', { textColor: 'green' })}) Use ${formatText('EXISTING', { textColor: 'green' })} configuration` +
        `\n   ▶️ (${formatText('u', { textColor: 'yellow' })}) ${formatText('UPDATE', { textColor: 'yellow' })} existing configuration` +
        `\n   ▶️ (${formatText('n', { textColor: 'red' })}) Create ${formatText('NEW', { textColor: 'red' })} configuration`,
      );

      let readyToProceed = false;
      while (!readyToProceed) {
        const choice = prompter(formatText('(E/u/n):', { bold: true }), 'e');

        switch (choice.toLowerCase()) {
          case 'e':
            console.log(formatText('\n✅ Using existing configuration', {
              textColor: 'green',
              bold: true,
            }));
            configStyle = 'EXISTING';
            config = configFromFile;
            readyToProceed = true;
            break;
          case 'u':
            console.log(formatText('\n📝 Updating existing configuration', {
              textColor: 'yellow',
              bold: true,
            }));
            configStyle = 'UPDATE';
            config = configFromFile;
            readyToProceed = true;
            break;
          case 'n':
            console.log(formatText('\n🆕 Creating new configuration', {
              textColor: 'blue',
              bold: true,
            }));
            configStyle = 'NEW';
            readyToProceed = true;
            break;
          default:
            console.log(formatText('❌ Invalid choice!', {
              textColor: 'red',
              bold: true,
            }));
        }
      }
    } catch (error) {
      console.log(formatText('\n❌ Error reading existing configuration!', {
        backgroundColor: 'bg-red',
        textColor: 'white',
        bold: true,
      }));
      configStyle = 'NEW';
    }
  }

  // Requirements check
  console.log(formatText('\n🔍 Requirements Check', { bold: true }));
  console.log(formatText(
    'This app requires certain AWS resources to exist before deployment:',
    { italic: true },
  ));
  console.log(formatText('  • SES/Pinpoint Verified Identity for email sending', { textColor: 'blue' }));

  const readyToProceed = await confirmAction('\nAre you ready to proceed?', true);
  if (!readyToProceed) {
    console.log(formatText('\n👋 Configuration cancelled', {
      backgroundColor: 'bg-yellow',
      textColor: 'black',
      bold: true,
    }));
    return;
  }

  // Initialize new configuration if needed
  if (configStyle === 'NEW') {
    config = {
      stackName: 'GenAINewsletter',
      pinpointEmail: {
        senderAddress: '',
        verifiedIdentity: '',
      },
      configVersion: CONFIG_VERSION,
      selfSignUpEnabled: false,
    };
  }

  if (config && ['UPDATE', 'NEW'].includes(configStyle)) {
    console.log(formatText('\n📝 Configuration Setup', { bold: true }));

    // Stack Configuration
    console.log(formatText('\n🏗️  Stack Configuration', { textColor: 'blue', bold: true }));
    config.stackName = await promptForValue(
      'Stack Name:',
      config.stackName,
      validators.stackName,
    ) || 'GenAINewsletter';

    // Email Configuration
    console.log(formatText('\n📧 Email Configuration', { textColor: 'blue', bold: true }));
    config.pinpointEmail.verifiedIdentity = await promptForValue(
      'SES/Pinpoint Verified Identity ARN:',
      config.pinpointEmail.verifiedIdentity,
      validators.pinpointIdentity,
    ) || '';

    config.pinpointEmail.senderAddress = await promptForValue(
      'Sender Email Address:',
      config.pinpointEmail.senderAddress,
      validators.email,
    ) || '';

    // Authentication Configuration
    console.log(formatText('\n🔐 Authentication Configuration', { textColor: 'blue', bold: true }));
    config.selfSignUpEnabled = await confirmAction('Enable self sign-up?', false);

    // Optional UI Configuration
    if (await confirmAction('\nDo you want to configure a custom frontend hostname?', false)) {
      if (!config.ui) config.ui = {};

      config.ui.hostName = await promptForValue(
        'Frontend Hostname:',
        config.ui?.hostName,
        validators.hostname,
        true,
      );

      if (config.ui.hostName) {
        config.ui.acmCertificateArn = await promptForValue(
          'ACM Certificate ARN:',
          config.ui?.acmCertificateArn,
          validators.acmCert,
        );
      }
    }

    // Optional Environment Configuration
    if (await confirmAction('\nDo you want to set deployment account and region?', false)) {
      if (!config.env) config.env = {};

      const accountId = prompter(
        formatText('\nAWS Account ID:', { textColor: 'blue', bold: true }) +
        (config.env.account ? formatText(` (current: ${config.env.account})`, { textColor: 'gray', italic: true }) : '') +
        '\n> ',
      );
      if (accountId) config.env.account = accountId;

      const region = prompter(
        formatText('\nAWS Region:', { textColor: 'blue', bold: true }) +
        (config.env.region ? formatText(` (current: ${config.env.region})`, { textColor: 'gray', italic: true }) : '') +
        '\n> ',
      );
      if (region) config.env.region = region;
    }

    // Save configuration
    fs.writeFileSync(deployConfig, JSON.stringify(config, null, 2));

    console.log(formatText('\n✅ Configuration saved successfully!', {
      backgroundColor: 'bg-green',
      textColor: 'white',
      bold: true,
    }));
  }

  if (config) {
    console.log(formatText('\n🚀 Your GenAI Newsletter App Stack is ready for deployment!', {
      bold: true,
      textColor: 'green',
    }));
  }
}