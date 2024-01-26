export interface DeployConfig {
  stackName?: string
  env?: {
    account?: string
    region?: string
  }
  selfSignUpEnabled: boolean
  configVersion: string
  pinpointIdentity: string
  appHostName?: {
    domainName: string
  }
  auth?: {
    cognito: {
      userPoolId: string
      userPoolClientId: string
      userPoolDomain: string
      identityPoolId: string
      authenticatedUserArn: string
      oauth?: {
        customProvider?: string
        domain: string
        scope: string[]
        redirectSignIn: string
        redirectSignOut: string
        responseType: string
      }
    }

  }
}
