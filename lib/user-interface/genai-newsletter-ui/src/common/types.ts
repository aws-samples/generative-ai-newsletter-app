

export interface AppConfig {
    aws_project_region: string
      aws_cognito_region: string
      aws_user_pools_id: string,
      aws_user_pools_web_client_id: string,
      aws_cognito_identity_pool_id: string,
      Auth: {
        region: string,
        userPoolId: string,
        userPoolWebClientId: string,
        IdentityPoolId: string
      },
      aws_appsync_graphqlEndpoint: string,
      aws_appsync_region: string,
      aws_appsync_authenticationType: string
      aws_appsync_apiKey: string,
      appConfig : {
        emailBucket: string
      }
}

export interface NavigationPanelState {
  collapsed?: boolean;
  collapsedSections?: Record<number, boolean>;
}

