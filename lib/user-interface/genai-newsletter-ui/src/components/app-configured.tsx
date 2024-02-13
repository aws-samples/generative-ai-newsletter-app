import { useEffect, useState } from 'react'
import { AppConfig } from '../common/types'
import { Amplify } from 'aws-amplify'
import { AppContext } from '../common/app-context'
import App from '../app'
import { Alert } from '@cloudscape-design/components'
import Authenticator from './auth/custom-authenticator'

export default function AppConfigured() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [error, setError] = useState<boolean | null>(null)
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
            <a href="/aws-exports.json" style={{ fontWeight: '600' }}>
              /aws-exports.json
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
      <Authenticator>
        <App />
      </Authenticator>
    </AppContext.Provider>
  )
}
