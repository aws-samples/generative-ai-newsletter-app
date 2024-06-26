/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Hub } from 'aws-amplify/utils'
import { PropsWithChildren, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../common/app-context'
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth'
import { UserContext, userContextDefault } from '../../common/user-context'
import {
  CustomAuthenticator,
  DefaultAuthenticator
} from './authenticator-views'
import { Container, SpaceBetween, Spinner } from '@cloudscape-design/components'

export default function Authenticator (props: PropsWithChildren) {
  const appContext = useContext(AppContext)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [userId, setUserId] = useState(userContextDefault.userId)
  const [account, setAccount] = useState(userContextDefault.accountId)
  const [userGroups, setUserGroups] = useState(
    userContextDefault.userGroups ?? []
  )
  const [userGivenName, setUserGivenName] = useState(
    userContextDefault.userGivenName ?? ''
  )
  const [userFamilyName, setUserFamilyName] = useState(
    userContextDefault.userFamilyName ?? ''
  )
  const { children } = props
  useEffect(() => {
    setIsLoading(true)
    if (!appContext) {
      return
    }
    const setUser = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          try {
            const attributes = await fetchUserAttributes()
            if (attributes.given_name) {
              setUserGivenName(attributes.given_name)
            }
            if (attributes.family_name) {
              setUserFamilyName(attributes.family_name)
            }
            if (attributes.sub) {
              setUserId(attributes.sub)
            } else {
              console.error('No sub found in user attributes')
            }
            if (attributes['custom:Account']) {
              setAccount(attributes['custom:Account'])
            }
          } catch (error) {
            //Error is okay
          }
        }
      } catch (error) {
        //Error is okay
      } finally {
        setIsLoading(false)
      }
    }

    const clearUser = async () => {
      setUserId('')
      setAccount('')
      setUserGroups([])
      setUserGivenName('')
      setUserFamilyName('')
    }
    if (appContext.Auth.Cognito.loginWith?.oauth) {
      setUser()
      Hub.listen('auth', ({ payload }) => {
        switch (payload.event) {
          case 'signInWithRedirect':
            setUser()
            break
          case 'signedOut':
            clearUser()
            break
        }
      })
    } else {
      Hub.listen('auth', ({ payload }) => {
        if (payload.event === 'signedOut') {
          clearUser()
        }
        if (payload.event === 'signedIn') {
          try {
            setUser()
          } catch (error) {
            console.log(error)
          }
        }
      })
    }
    try {
      setUser()
    } catch (error) {
      //ERROR IS OKAY
    }
  }, [appContext])

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        userGroups,
        setUserGroups,
        userGivenName,
        setUserGivenName,
        userFamilyName,
        setUserFamilyName,
        accountId: account,
        setAccountId: setAccount
      }}
    >
      {isLoading ? (
        <SpaceBetween direction="vertical" size="l" alignItems="center">
          <Container>
            <SpaceBetween size="l" direction="vertical" alignItems="center">
              <h2>Loading</h2>
              <Spinner size="big" />
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      ) : userId.length < 1 ? (
        appContext?.Auth.Cognito.loginWith?.oauth !== undefined ? (
          <CustomAuthenticator />
        ) : (
          <DefaultAuthenticator />
        )
      ) : (
        children
      )}
    </UserContext.Provider>
  )
}
