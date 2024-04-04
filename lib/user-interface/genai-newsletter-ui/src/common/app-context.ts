/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { createContext } from 'react'
import { AppConfig } from './types'

export const AppContext = createContext<AppConfig | null>(null)
