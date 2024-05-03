/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import * as path from 'path'
import { type CodegenConfig } from '@graphql-codegen/cli'

import './codegen-auth-plugin'

const config: CodegenConfig = {
  schema: [path.join(__dirname, '..', 'schema.graphql'), path.join(__dirname, '..', 'appsync.graphql')],
  generates: {
    '../types.json': {
      plugins: ['introspection']
    }
  },
  hooks: {
    afterAllFileWrite: ['prettier --write']
  }
}

export default config
