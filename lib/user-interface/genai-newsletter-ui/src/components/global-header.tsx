/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useContext, useState } from 'react'
import { signOut } from '@aws-amplify/auth'
import {
  ButtonDropdownProps,
  TopNavigation
} from '@cloudscape-design/components'
import { UserContext } from '../common/user-context'
import { AppContext } from '../common/app-context'
import { StorageHelper } from '../common/helpers/storage-helper'
import { Mode } from '@cloudscape-design/global-styles'
export default function GlobalHeader () {
  const appContext = useContext(AppContext)
  const userContext = useContext(UserContext)
  const [theme, setTheme] = useState<Mode>(StorageHelper.getTheme())

  const onUtilClick = ({
    detail
  }: {
    detail: ButtonDropdownProps.ItemClickDetails
  }) => {
    if (detail.id === 'signout') {
      signOut()
    }
  }
  const onChangeThemeClick = () => {
    if (theme === Mode.Dark) {
      setTheme(StorageHelper.applyTheme(Mode.Light))
    } else {
      setTheme(StorageHelper.applyTheme(Mode.Dark))
    }
  }
  const addedLinks: any[] = []
  if (appContext?.ui?.headerLinks) {
    for (const link of appContext.ui.headerLinks) {
      addedLinks.push({
        id: 'added-link-' + link.text.replace(' ', ''),
        text: link.text,
        href: link.href
      })
    }
  }

  return (
    <div
      style={{
        zIndex: 1002,
        top: 0,
        left: 0,
        right: 0,
        position: 'fixed'
      }}
    >
      <TopNavigation
        identity={{
          title: 'Generative AI Newsletter Application',
          href: '/'
        }}
        utilities={[
          {
            type: 'button',
            text: 'User Guide',
            href: 'https://aws-samples.github.io/generative-ai-newsletter-app/user-guide.html',
            external: true,
            target: '_blank'
          },
          {
            type: 'button',
            text: theme === Mode.Dark ? 'Light Mode' : 'Dark Mode',
            onClick: onChangeThemeClick
          },
          {
            type: 'menu-dropdown',
            iconName: 'user-profile',
            onItemClick: onUtilClick,
            items: [
              {
                id: 'name',
                text: userContext?.userGivenName
                  ? 'Hi, ' + userContext?.userGivenName
                  : 'Hi there!'
              },
              {
                id: 'signout',
                text: 'Sign Out'
              },
              ...addedLinks
            ]
          }
        ]}
      />
    </div>
  )
}
