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
