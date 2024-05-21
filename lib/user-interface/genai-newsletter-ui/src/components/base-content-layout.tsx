/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  Alert,
  Button,
  ContentLayout,
  SpaceBetween
} from '@cloudscape-design/components'
import { PropsWithChildren, useContext, useState } from 'react'
import { AppContext } from '../common/app-context'

interface BaseContentLayoutProps extends PropsWithChildren {
  header?: JSX.Element
}

export default function BaseContentLayout(props: BaseContentLayoutProps) {
  const appContext = useContext(AppContext)
  const { children, header } = props
  const [dismissed, setDismissed] = useState(false)
  const dismissAlert = () => {
    setDismissed(true)
  }
  return (
    <ContentLayout header={header}>
      {appContext?.ui?.persistentAlert && !dismissed ? (
        <Alert
          type={appContext.ui.persistentAlert.type}
          action={
            appContext.ui.persistentAlert.buttonHref &&
            appContext.ui.persistentAlert.buttonText ? (
              <SpaceBetween direction="horizontal" size="s">
                <Button href={appContext.ui.persistentAlert.buttonHref}>
                  {appContext.ui.persistentAlert.buttonText}
                </Button>
              </SpaceBetween>
            ) : (
              <></>
            )
          }
          onDismiss={dismissAlert}
          dismissible={appContext.ui.persistentAlert.dismissable}
        >
          {appContext.ui.persistentAlert.message}
        </Alert>
      ) : (
        <></>
      )}
      {children}
    </ContentLayout>
  )
}
