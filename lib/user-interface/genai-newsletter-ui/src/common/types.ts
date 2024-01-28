import { Dispatch, SetStateAction } from "react"
import { AuthConfig, APIConfig } from "@aws-amplify/core"



export interface AppConfig {
  aws_project_region: string
  Auth: AuthConfig
  API: APIConfig
  appConfig : {
    emailBucket: string
  }
  ui?: {
    sideNavigition?: Array<{
      title: string
      url: string
    }>
    headerLinks?: Array<{
      title: string
      url: string
    }>
  }
}

export interface UserData {
  userId: string,
  userGroups?: string[],
  userGivenName?: string,
  userFamilyName?: string,
  setUserId: Dispatch<SetStateAction<string>>
  setUserGroups: Dispatch<SetStateAction<string[]>>
  setUserGivenName: Dispatch<SetStateAction<string>>
  setUserFamilyName: Dispatch<SetStateAction<string>>
}

export interface NavigationPanelState {
  collapsed?: boolean;
  collapsedSections?: Record<number, boolean>;
}

