import { defineConfig, loadEnv } from 'vite'
import { splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'



// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  return defineConfig({
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
    base: '/',
    plugins: [
      splitVendorChunkPlugin(),
      react()
    ]
  })
})
