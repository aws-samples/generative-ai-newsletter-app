/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'



// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  return defineConfig({
    base: '/',
    server: {
      proxy: {
        '/newsletter-content': {
          target: process.env.VITE_CLOUDFRONT_ENDPOINT,
          secure: true,
          changeOrigin: true
        },
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          unsubscribe: resolve(__dirname, 'unsubscribe/index.html')
        }
      }
    },
    plugins: [
      react()
    ]
  })
})
