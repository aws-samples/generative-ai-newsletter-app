/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import path from 'path'
import { type DeployConfig } from '../lib/shared/common/deploy-config'
import { existsSync, readFileSync } from 'fs'

export default function getConfig (pathValue?: string): DeployConfig {
  if (
    existsSync(pathValue ?? path.join(__dirname, '..', 'bin', 'config.json'))
  ) {
    return JSON.parse(
      readFileSync(
        pathValue ?? path.join(__dirname, '..', 'bin', 'config.json')
      ).toString('utf8')
    ) as DeployConfig
  } else {
    throw new Error(
      'Deploy config not found. Run `npm run config create` to configure the deployment.'
    )
  }
}
