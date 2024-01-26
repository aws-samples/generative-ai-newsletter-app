import { Dispatch, SetStateAction } from "react"
import { AuthConfig, APIConfig } from "@aws-amplify/core"



export interface AppConfig {
  aws_project_region: string
  Auth: AuthConfig
  API: APIConfig
  appConfig : {
    emailBucket: string
  }
}

export interface UserData {
  userId: string,
  userGroups?: string[],
  setUserId: Dispatch<SetStateAction<string>>
  setUserGroups: Dispatch<SetStateAction<string[]>>
}

export interface NavigationPanelState {
  collapsed?: boolean;
  collapsedSections?: Record<number, boolean>;
}

