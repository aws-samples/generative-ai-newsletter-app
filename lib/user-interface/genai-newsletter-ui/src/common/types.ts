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
    sideNavigation?: Array<{
      text: string
      href: string
    }>
    headerLinks?: Array<{
      text: string
      href: string
    }>
    persistentAlert?: {
      type: 'error' | 'success' | 'info' | 'warning'
      message: string
      buttonText?: string
      buttonHref?: string
      dismissable: boolean
    }
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

