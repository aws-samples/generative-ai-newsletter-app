import { Dispatch, SetStateAction } from 'react'
import { AuthConfig, APIConfig } from '@aws-amplify/core'
import { UIConfig } from '@shared/common/deploy-config'

export interface AppConfig {
  Auth: AuthConfig
  API: APIConfig
  appConfig: {
    emailBucket: string
  }
  ui?: UIConfig
}

export interface UserData {
  userId: string
  userGroups?: string[]
  userGivenName?: string
  userFamilyName?: string
  setUserId: Dispatch<SetStateAction<string>>
  setUserGroups: Dispatch<SetStateAction<string[]>>
  setUserGivenName: Dispatch<SetStateAction<string>>
  setUserFamilyName: Dispatch<SetStateAction<string>>
}

export interface NavigationPanelState {
  collapsed?: boolean
  collapsedSections?: Record<number, boolean>
}
