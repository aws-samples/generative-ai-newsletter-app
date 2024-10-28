// config-show.ts
import * as fs from 'fs';
import { CONFIG_VERSION } from './config-version';
import { bigHeader, formatText } from './consts';
import { type DeployConfig } from '../lib/shared/common/deploy-config';
const configFile = './bin/config.json';

function formatJsonValue(value: any, indent: number = 0): string {
  if (value === null) return formatText('null', { textColor: 'gray' });
  if (value === undefined) return formatText('undefined', { textColor: 'gray' });

  switch (typeof value) {
    case 'string':
      return formatText(`"${value}"`, { textColor: 'green' });
    case 'number':
      return formatText(value.toString(), { textColor: 'yellow' });
    case 'boolean':
      return formatText(value.toString(), { textColor: 'cyan' });
    case 'object':
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        const arrayItems = value
          .map(item => formatJsonValue(item, indent + 2))
          .join(',\n' + ' '.repeat(indent + 2));
        return `[\n${' '.repeat(indent + 2)}${arrayItems}\n${' '.repeat(indent)}]`;
      }

      const entries = Object.entries(value);
      if (entries.length === 0) return '{}';

      const formattedEntries = entries
        .map(([key, val]) => {
          const formattedKey = formatText(`"${key}"`, { textColor: 'blue' });
          return `${' '.repeat(indent + 2)}${formattedKey}: ${formatJsonValue(val, indent + 2)}`;
        })
        .join(',\n');

      return `{\n${formattedEntries}\n${' '.repeat(indent)}}`;
    default:
      return String(value);
  }
}

export function showConfig(): void {
  console.log(formatText('\nChecking for existing configuration....', { bold: true }));

  if (!fs.existsSync(configFile)) {
    console.log(
      formatText('\n⚠️  No configuration file found!', {
        backgroundColor: 'bg-yellow',
        textColor: 'black',
        bold: true,
      }),
    );
    console.log(
      formatText('\nPlease select MANAGE from the main menu to setup your deployment configurations.', {
        textColor: 'yellow',
        italic: true,
      }),
    );
    return;
  }

  try {
    const config: DeployConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    console.log(
      formatText('\n✅ Deployment Configuration Located!', {
        backgroundColor: 'bg-green',
        textColor: 'white',
        bold: true,
      }),
    );

    // Version check
    if (config.configVersion !== CONFIG_VERSION) {
      console.log(
        formatText(
          `\n⚠️  Configuration version mismatch! Current: ${config.configVersion}, Latest: ${CONFIG_VERSION}`, {
            backgroundColor: 'bg-yellow',
            textColor: 'black',
            bold: true,
          }),
      );
    }

    // Configuration Details Section
    console.log(bigHeader('Configuration Details'));

    // Stack Info
    console.log(formatText('📚 Stack Information', { textColor: 'blue', bold: true }));
    console.log(formatText('├─ Stack Name:', { textColor: 'white' }), formatText(config.stackName ?? 'GenAI Newsletter App', { textColor: 'green' }));

    // Email Configuration
    console.log(formatText('\n📧 Email Configuration', { textColor: 'blue', bold: true }));
    console.log(formatText('├─ Sender Address:', { textColor: 'white' }), formatText(config.pinpointEmail.senderAddress, { textColor: 'green' }));
    console.log(formatText('└─ Verified Identity:', { textColor: 'white' }), formatText(config.pinpointEmail.verifiedIdentity, { textColor: 'green' }));

    // Auth Configuration
    console.log(formatText('\n🔐 Authentication', { textColor: 'blue', bold: true }));
    console.log(
      formatText('└─ Self Sign-up:', { textColor: 'white' }),
      config.selfSignUpEnabled
        ? formatText('Enabled', { textColor: 'green' })
        : formatText('Disabled', { textColor: 'red' }),
    );

    // UI Configuration
    if (config.ui) {
      console.log(formatText('\n🖥️  UI Configuration', { textColor: 'blue', bold: true }));
      if (config.ui.hostName) {
        console.log(formatText('├─ Hostname:', { textColor: 'white' }), formatText(config.ui.hostName, { textColor: 'green' }));
      }
      if (config.ui.acmCertificateArn) {
        console.log(formatText('└─ ACM Certificate:', { textColor: 'white' }), formatText(config.ui.acmCertificateArn, { textColor: 'green' }));
      }
    }

    // Environment Configuration
    if (config.env) {
      console.log(formatText('\n🌍 Environment', { textColor: 'blue', bold: true }));
      if (config.env.account) {
        console.log(formatText('├─ AWS Account:', { textColor: 'white' }), formatText(config.env.account, { textColor: 'green' }));
      }
      if (config.env.region) {
        console.log(formatText('└─ AWS Region:', { textColor: 'white' }), formatText(config.env.region, { textColor: 'green' }));
      }
    }

    // Raw JSON output
    console.log(formatText('\n📋 Raw Configuration', { textColor: 'blue', bold: true }));
    console.log(formatJsonValue(config));

  } catch (error) {
    console.log(
      formatText('\n❌ Error reading configuration file!', {
        backgroundColor: 'bg-red',
        textColor: 'white',
        bold: true,
      }),
    );
    if (error instanceof Error) {
      console.log(
        formatText(error.message, {
          textColor: 'red',
          italic: true,
        }),
      );
    }
  }
}