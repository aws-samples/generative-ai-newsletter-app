import { awscdk, typescript } from 'projen';
import { NodePackageManager, TypeScriptJsxMode, TypeScriptModuleResolution } from 'projen/lib/javascript';

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.164.1',
  srcdir: '.',
  outdir: '.',
  libdir: 'out/',
  defaultReleaseBranch: 'main',
  name: 'generative-ai-newsletter-app',
  projenrcTs: true,
  sampleCode: false,
  gitignore: [
    'bin/config.json',
    'pages/.vitepress/dist/*',
    'misc/',
    '.DS_Store',
    'eslint-results.sarif',
    '**/*.d.ts',
    'lib/**/*.js',
    'lib/api/functions/out/',
  ],
  github: false,
  pullRequestTemplate: true,
  appEntrypoint: 'bin/genai-newsletter-app.ts',
  bin: {
    'genai-newsletter-app': 'bin/genai-newsletter-app.ts',
  },
  packageManager: NodePackageManager.NPM,
  deps: [
    '@aws-cdk/aws-cognito-identitypool-alpha',
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
    '@react-email/components',
    '@react-email/render',
    'react',
    'cdk-nag',
    'axios',
    'tsx',
    'source-map-support',
    'cheerio',
    'figlet',
    'prompt-sync',
    'esbuild',
    '@graphql-codegen/plugin-helpers',
    '@graphql-codegen/cli',
    'typescript',
    'ts-node',
  ],
  devDeps: [
    'vitepress',
    'aws-lambda',
    '@types/ansi-escape-sequences',
    '@types/prompt-sync',
    '@types/figlet',
    '@types/uuid',
    'git-cz',
    'cz-conventional-changelog',
    'figlet',
    'prettier',
    '@types/cheerio',
  ],
  tsconfig: {
    compilerOptions: {
      outDir: 'out',
      rootDir: '.',
      lib: ['DOM', 'DOM.Iterable', 'ESNext'],
      jsx: TypeScriptJsxMode.REACT_JSX,
      noEmit: true,
    },
    exclude: ['node_modules', 'lib/user-interface/genai-newsletter-ui/*'],
  },
});
// projen auto adds lib/, but this project is laid out differently and needs to include lib/
project.gitignore.removePatterns('lib');

project.addFields({
  config: {
    commitizen: {
      path: './node_modules/cz-conventional-changelog',
    },
  },
});

// Existing tasks
project.tasks.addTask('config', {
  description: 'Run the CLI to configure the project',
  exec: 'ts-node ./cli/config.ts',
});

const codegenApi = project.tasks.addTask('codegen:api', {
  cwd: 'lib/shared/api',
  description: 'Generate the API code',
  exec: 'npx @aws-amplify/cli codegen',
});

const codegenAuth = project.tasks.addTask('codegen:auth', {
  cwd: 'lib/shared/api/schema-to-avp',
  description: 'Generate the Auth code',
  exec: 'npx graphql-codegen ./codegen.ts',
});

const codegenTask = project.tasks.addTask('codegen', {
  description: 'Run the codegen tasks',
});

codegenTask.spawn(codegenApi);
codegenTask.spawn(codegenAuth);


project.tasks.addTask('email:start', {
  description: 'Start the email generator',
  cwd: 'lib/shared/email-generator',
  exec: 'npm run start',
});

// Updated frontend project with Vite configuration
const frontend = new typescript.TypeScriptProject({
  parent: project,
  outdir: 'lib/user-interface/genai-newsletter-ui/',
  name: 'genai-newsletter-ui',
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.NPM,
  sampleCode: false,
  jestOptions: {
    jestVersion: '29',
  },
  deps: [
    'react',
    'react-dom',
    'react-router-dom',
    'graphql',
    'react-router',
    'aws-amplify',
    '@aws-amplify/ui-react',
    '@cloudscape-design/chat-components',
    '@cloudscape-design/collection-hooks',
    '@cloudscape-design/component-toolkit',
    '@cloudscape-design/global-styles',
  ],
  devDeps: [
    '@types/react',
    '@types/react-dom',
    '@vitejs/plugin-react',
    'vite',
    'typescript',
    'ts-jest@^29.2.5',
    'eslint-plugin-react-hooks@latest',
    'eslint-plugin-react',
    'eslint-plugin-react-refresh',
  ],
  tsconfig: {
    compilerOptions: {
      paths: {
        shared: ['../../../shared'],
      },
      rootDir: '../../../',
      sourceRoot: 'src/',
      lib: ['DOM', 'DOM.Iterable', 'ESNext'],
      jsx: TypeScriptJsxMode.REACT_JSX,
      noEmit: true,
      module: 'ESNext',
      resolveJsonModule: true,
      moduleResolution: TypeScriptModuleResolution.NODE,
      skipLibCheck: true,
    },
    exclude: ['node_modules/**/*', '../../../node_modules/**/*'],
  },

});

// Update UI tasks to use Vite
frontend.tasks.addTask('dev', {
  description: 'Start the UI in development mode',
  exec: 'vite',
});

frontend.tasks.addTask('preview', {
  description: 'Preview the UI build',
  exec: 'vite preview',
});

frontend.tasks.addTask('start', {
  description: 'Start the UI',
  exec: 'vite',
});

project.tasks.addTask('ui:start', {
  description: 'Start the UI',
  exec: 'vite',
  cwd: 'lib/user-interface/genai-newsletter-ui/',
});

const buildAppsync = project.tasks.addTask('build:appsync', {
  description: 'Build the appsync',
  exec: 'tsx ./lib/api/functions/bundle.ts',
});

project.tasks.addTask('docs:dev', {
  description: 'Run the docs in dev mode',
  exec: 'vitepress dev pages',
});

project.tasks.addTask('docs:build', {
  description: 'Build the docs',
  exec: 'vitepress build pages',
});

project.tasks.addTask('docs:preview', {
  description: 'Preview the docs',
  exec: 'vitepress preview pages',
});

project.preCompileTask.spawn(buildAppsync);
project.preCompileTask.spawn(frontend.compileTask);

// Formatting tasks
project.tasks.addTask('format', {
  description: 'Format the code',
  exec: 'npm run prettier && npm run lint',
});

project.tasks.addTask('lint', {
  description: 'Lint the code',
  exec: 'eslint . --config .eslintrc.json --ext .js,.jsx,.ts,.tsx --format @microsoft/eslint-formatter-sarif --output-file eslint-results.sarif --fix',
});

project.tasks.addTask('prettier', {
  description: 'Run prettier',
  exec: 'prettier --write \"**/*.{ts,tsx}\"',
});

//Commit friendly messages!
project.tasks.addTask('commit', {
  description: 'Commit the code',
  exec: 'git-cz',
});

frontend.synth();
project.synth();
