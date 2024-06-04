/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import AppConfigured from './components/app-configured'
import { StorageHelper } from './common/helpers/storage-helper'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

const theme = StorageHelper.getTheme()
StorageHelper.applyTheme(theme)

root.render(
  <React.StrictMode>
    <AppConfigured />
  </React.StrictMode>
)
