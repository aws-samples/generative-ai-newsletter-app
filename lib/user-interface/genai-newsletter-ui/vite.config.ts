import { defineConfig,loadEnv } from 'vite'
import { splitVendorChunkPlugin } from 'vite'
import fs from "fs"
import react from '@vitejs/plugin-react'
import path from 'path';

const isDev = process.env.NODE_ENV === "development";
console.log("isDev = " + isDev)
// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  console.log(process.env.VITE_CLOUDFRONT_ENDPOINT)
  return defineConfig({
  server: {
    proxy: {
      '/newsletter-content': {
        target: process.env.VITE_CLOUDFRONT_ENDPOINT,
        secure: true,
        changeOrigin: true
      }
    }
  },
  plugins: [isDev && {
      name: 'aws-exports',
      writeBundle() {
        const outputPath = path.resolve('public/aws-exports.json')

        fs.writeFileSync(
          outputPath,
          JSON.stringify(
            {
              aws_project_region: process.env.AWS_PROJECT_REGION,
              aws_cognito_region: process.env.AWS_COGNITO_REGION,
              aws_user_pools_id: process.env.AWS_USER_POOLS_ID,
              aws_user_pools_web_client_id: process.env.AWS_USER_POOLS_WEB_CLIENT_ID,
              aws_cognito_identity_pool_id: process.env.AWS_COGNITO_IDENTITY_POOL_ID,
              Auth: {
                  region: process.env.AWS_COGNITO_REGION,
                  userPoolId: process.env.AWS_USER_POOLS_ID,
                  userPoolWebClientId: process.env.AWS_USER_POOLS_WEB_CLIENT_ID,
                  IdentityPoolId: process.env.AWS_COGNITO_IDENTITY_POOL_ID
              },
              API: {
                  GraphQL: {
                      endpoints: process.env.GRAPHQL_ENDPOINT,
                      region: process.env.AWS_PROJECT_REGION,
                      defaultAuthMode: "userPool"
                  }
              },
              aws_appsync_graphqlEndpoint: process.env.GRAPHQL_ENDPOINT,
              aws_appsync_region: process.env.AWS_PROJECT_REGION,
              aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
              aws_appsync_apiKey: process.env.APPSYNC_API_KEY,
          }
          )
        )
      }
    },
    splitVendorChunkPlugin(), react(),
  ],
})
}
