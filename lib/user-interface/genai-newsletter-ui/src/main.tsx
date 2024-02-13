import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AppConfigured from './components/app-configured'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <AppConfigured />
  </React.StrictMode>
)
