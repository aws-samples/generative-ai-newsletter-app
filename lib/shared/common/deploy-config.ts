/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
export interface DeployConfig {
  stackName?: string;
  env?: {
    account?: string;
    region?: string;
  };
  selfSignUpEnabled: boolean;
  configVersion: string;
  pinpointEmail: {
    verifiedIdentity: string;
    senderAddress: string;
  };
  ui?: UIConfig;
  auth?: {
    cognito: {
      userPoolId: string;
      userPoolArn: string;
      userPoolClientId: string;
      userPoolDomain: string;
      identityPoolId: string;
      authenticatedUserArn: string;
      oauth?: {
        customProvider?: string;
        domain: string;
        scope: string[];
        redirectSignIn: string;
        redirectSignOut: string;
        responseType: string;
      };
    };
  };
}

export interface UIConfig {
  hostName?: string;
  acmCertificateArn?: string;
  sideNavigation?: Array<{
    text: string;
    href: string;
  }>;
  headerLinks?: Array<{
    text: string;
    href: string;
  }>;
  persistentAlert?: {
    type: 'error' | 'success' | 'info' | 'warning';
    message: string;
    buttonText?: string;
    buttonHref?: string;
    dismissable: boolean;
  };
}
