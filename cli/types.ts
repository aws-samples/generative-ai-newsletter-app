export interface CDKConfig {
  configVersion: string
  pinpointIdentity: string
  appHostName?: {
    domainName: string
    zoneName?: string
  }
}
