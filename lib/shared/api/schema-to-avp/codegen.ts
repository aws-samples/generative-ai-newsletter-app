import * as path from 'path'
import { type CodegenConfig } from '@graphql-codegen/cli'

import './codegen-auth-plugin'

const config: CodegenConfig = {
  schema: [path.join(__dirname, '..', 'schema.graphql'), path.join(__dirname, '..', 'appsync.graphql')],
  generates: {
    'action-authorizor.ts': {
      plugins: [{
        add: {
          content: '/* eslint-disable */'
        }
      }, 'codegen-auth-plugin.ts', 'typescript-operations'
      ]
    }
  },
  hooks: {
    afterAllFileWrite: ['prettier --write']
  }
}

export default config
