import { awscdk } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';
import { web } from 'projen'
import { exec } from 'child_process';

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.164.1',
  defaultReleaseBranch: 'main',
  name: 'generative-ai-newsletter-app',
  projenrcTs: true,
  sampleCode: false,
  packageManager: NodePackageManager.NPM,
  deps: [
    '@aws-sdk/client-s3',
    '@aws-sdk/client-cognito-identity-provider',
    '@aws-sdk/client-lambda',
    '@aws-sdk/client-verifiedpermissions',
    '@aws-sdk/client-bedrock-runtime',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/client-pinpoint',
    '@aws-sdk/client-scheduler',
    '@aws-sdk/client-sfn',
    '@aws-sdk/lib-storage',
    '@aws-sdk/util-dynamodb',
    '@middy/core',
    '@aws-amplify/cli',
    '@aws-appsync/utils',
    '@aws-lambda-powertools/logger',
    '@aws-lambda-powertools/metrics',
    '@aws-lambda-powertools/tracer',
    'aws-jwt-verify',
    'commander',
    'graphql',
    'mui-color-input',
    'react',
    'uuid',
    'ansi-escape-sequences',
    'react-email',
    'react',
    'cdk-nag',
    'axios',
    'tsx',
    'source-map-support',
    'cheerio',
  ],
  devDeps: [
    '@types/prompt-sync',
    '@types/uuid',
    'git-cz',
    'cz-conventional-changelog',
    'figlet',
    'prettier',
    '@types/cheerio',
  ]
});
project.tasks.addTask('config', {
  description: 'Run the CLI to configure the project',
  exec: 'tsx ./cli/config.ts'
})

const frontend = new web.ReactTypeScriptProject({
  parent: project,
  outdir: 'lib/user-interface/genai-newsletter-ui/',
  name: 'genai-newsletter-ui',
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.NPM,
  sampleCode: false,
  deps: [
    'react',
    'react-dom',
    'react-router-dom',
    'graphql',
    'react-router',
    'react',
    "@aws-amplify/ui-react",
    '@cloudscape-design/chat-components',
    '@cloudscape-design/collection-hooks',
    '@cloudscape-design/component-toolkit',
    '@cloudscape-design/global-styles',
    'vite',
  ]
})

project.synth();
frontend.synth();