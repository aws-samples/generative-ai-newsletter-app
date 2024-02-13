import path from 'path'
import { type DeployConfig } from '@shared/common/deploy-config'
import { existsSync, readFileSync } from 'fs'

export default function getConfig (): DeployConfig {
  if (existsSync(path.join(__dirname, 'config.json'))) {
    return JSON.parse(
      readFileSync(path.join(__dirname, 'config.json')).toString('utf8')
    ) as DeployConfig
  } else {
    throw new Error(
      'Deploy config not found. Run `npm run config create` to configure the deployment.'
    )
  }
}
