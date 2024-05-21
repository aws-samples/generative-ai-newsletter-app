/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useEffect, useState } from 'react'
import { AppConfig } from '../common/types'
import { Amplify } from 'aws-amplify'
import { ThemeProvider, defaultDarkModeOverride } from '@aws-amplify/ui-react'
import { AppContext } from '../common/app-context'
import App from '../app'
import { Alert } from '@cloudscape-design/components'
import Authenticator from './auth/custom-authenticator'
import { StorageHelper } from '../common/helpers/storage-helper'
import { Mode } from '@cloudscape-design/global-styles'

export default function AppConfigured() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [error, setError] = useState<boolean | null>(null)
  const [theme, setTheme] = useState(StorageHelper.getTheme())
  useEffect(() => {
    (async () => {
      try {
        const result = await fetch('/amplifyconfiguration.json')
        const awsExports = (await result.json()) as AppConfig | null
        Amplify.configure({
          ...awsExports
        })
        setConfig(awsExports)
      } catch (e) {
        setError(true)
        console.error(e)
      }
    })()
  }, [])
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style'
        ) {
          const newValue =
            document.documentElement.style.getPropertyValue(
              '--app-color-scheme'
            )

          const mode = newValue === 'dark' ? Mode.Dark : Mode.Light
          if (mode !== theme) {
            setTheme(mode)
          }
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    })

    return () => {
      observer.disconnect()
    }
  }, [theme])

  if (!config) {
    if (error) {
      return (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Alert header="Configuration error" type="error">
            Error loading configuration from "
            <a href="/amplifyconfiguration.json" style={{ fontWeight: '600' }}>
              /amplifyconfiguration.json
            </a>
            "
          </Alert>
        </div>
      )
    }
    return <div>Loading</div>
  }

  return (
    <AppContext.Provider value={config}>
      <ThemeProvider
        theme={{
          name: 'default-theme',
          overrides: [defaultDarkModeOverride]
        }}
        colorMode={theme === Mode.Dark ? 'dark' : 'light'}
      >
        <Authenticator>
          <App />
        </Authenticator>
      </ThemeProvider>
    </AppContext.Provider>
  )
}
