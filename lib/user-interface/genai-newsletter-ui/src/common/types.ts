/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Dispatch, SetStateAction } from 'react'
import { AuthConfig, APIConfig } from '@aws-amplify/core'
import { UIConfig } from '../../../../shared/common'
import { Client } from 'aws-amplify/api'
import { ArticleSummaryType } from '../../../../shared/api'

export interface AppConfig {
  Auth: AuthConfig
  API: APIConfig
  appConfig: {
    emailBucket: string
  }
  ui?: UIConfig
  apiClient?: Client
}

export interface UserData {
  userId: string
  userGroups?: string[]
  userGivenName?: string
  userFamilyName?: string
  accountId: string
  setUserId: Dispatch<SetStateAction<string>>
  setUserGroups: Dispatch<SetStateAction<string[]>>
  setUserGivenName: Dispatch<SetStateAction<string>>
  setUserFamilyName: Dispatch<SetStateAction<string>>
  setAccountId: Dispatch<SetStateAction<string>>
}

export interface NavigationPanelState {
  collapsed?: boolean
  collapsedSections?: Record<number, boolean>
}

export const ArticleSummaryTypeLabel = (articleSummaryType: ArticleSummaryType): string => {
  switch(articleSummaryType){
    case ArticleSummaryType.SHORT_SUMMARY: return "Short Summary";
    case ArticleSummaryType.LONG_SUMMARY: return "Long Summary";
    case ArticleSummaryType.KEYWORDS: return "Keywords"
    default: return "Keywords"
  }
}