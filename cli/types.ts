export interface DeployConfig {
  stackName?: string
  env?: {
    account?: string
    region?: string
  }
  configVersion: string
  pinpointIdentity: string
  appHostName?: {
    domainName: string
  }
}
