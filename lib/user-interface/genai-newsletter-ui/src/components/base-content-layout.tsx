import {
  Alert,
  Button,
  ContentLayout,
  SpaceBetween
} from '@cloudscape-design/components'
import { PropsWithChildren, useContext } from 'react'
import { AppContext } from '../common/app-context'

interface BaseContentLayoutProps extends PropsWithChildren {
  header?: JSX.Element
}

export default function BaseContentLayout(props: BaseContentLayoutProps) {
  const appContext = useContext(AppContext)
  const { children } = props
  return (
    <ContentLayout>
      {appContext?.ui?.persistentAlert ? (
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
