/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { createContext } from 'react'
import { UserData } from './types'

export const userContextDefault: UserData = {
  userId: '',
  userGroups: [],
  userFamilyName: '',
  userGivenName: '',
  accountId: '',
  setUserGroups: () => {},
  setUserId: () => {},
  setUserFamilyName: () => {},
  setUserGivenName: () => {},
  setAccountId: () => {}
}

export const UserContext = createContext<UserData | null>(userContextDefault)
