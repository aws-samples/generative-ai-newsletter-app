/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { type DeployConfig } from '../lib/shared/common/deploy-config';

export default function getConfig (pathValue?: string): DeployConfig {
  if (
    existsSync(pathValue ?? path.join(__dirname, '..', 'bin', 'config.json'))
  ) {
    return JSON.parse(
      readFileSync(
        pathValue ?? path.join(__dirname, '..', 'bin', 'config.json'),
      ).toString('utf8'),
    ) as DeployConfig;
  } else {
    throw new Error(
      'Deploy config not found. Run `npm run config` to configure the deployment.',
    );
  }
}
