import { Aws, DockerImage, RemovalPolicy } from 'aws-cdk-lib'
import { CloudFrontWebDistribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import * as path from 'path'
import { type ExecSyncOptionsWithBufferEncoding, execSync } from 'child_process'

interface UserInterfaceProps {
  userPoolClientId: string
  userPoolId: string
  identityPoolId: string
  graphqlApiUrl: string
  graphqlApiKey: string | undefined
}

export class UserInterface extends Construct {
  constructor (scope: Construct, id: string, props: UserInterfaceProps) {
    super(scope, id)

    const appPath = path.join(__dirname, 'genai-newsletter-ui')
    const buildPath = path.join(appPath, 'dist')

    const websiteBucket = new Bucket(this, 'GenAINewsletterFrontEnd', {
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html'
    })

    const originAccessIdentity = new OriginAccessIdentity(this, 'S3Origin')
    websiteBucket.grantRead(originAccessIdentity)

    const cloudfrontDistribution = new CloudFrontWebDistribution(this, 'CloudFrontDistribution', {
      originConfigs: [
        {
          behaviors: [{ isDefaultBehavior: true }],
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity
          }
        }
      ],
      errorConfigurations: [
        {
          errorCode: 404,
          errorCachingMinTtl: 0,
          responseCode: 404,
          responsePagePath: '/index.html'
        }
      ]
    })

    const awsExports = s3deploy.Source.jsonData('aws-exports.json', {
      aws_project_region: Aws.REGION,
      aws_cognito_region: Aws.REGION,
      aws_user_pools_id: props.userPoolId,
      aws_user_pools_web_client_id: props.userPoolClientId,
      aws_cognito_identity_pool_id: props.identityPoolId,
      Auth: {
        region: Aws.REGION,
        userPoolId: props.userPoolId,
        userPoolWebClientId: props.userPoolClientId,
        IdentityPoolId: props.identityPoolId
      },
      API: {
        GraphQL: {
          endpoints: props.graphqlApiUrl,
          region: Aws.REGION,
          defaultAuthMode: 'userPool'
        }
      },
      aws_appsync_graphqlEndpoint: props.graphqlApiUrl,
      aws_appsync_region: Aws.REGION,
      aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
      aws_appsync_apiKey: props.graphqlApiKey
    })

    const frontEndAsset = s3deploy.Source.asset(appPath, {
      bundling: {
        image: DockerImage.fromRegistry(
          'public.ecr.aws/sam/build-nodejs18.x:latest'
        ),
        command: [
          'sh',
          '-c',
          [
            'npm --cache /tmp/.npm install',
            'npm --cache /tmp/.npm run build',
            'cp -aur /asset-input/dist/* /asset-output/'
          ].join(' && ')
        ],
        local: {
          tryBundle (outputDir: string) {
            try {
              const options: ExecSyncOptionsWithBufferEncoding = {
                stdio: 'inherit',
                env: {
                  ...process.env
                }
              }

              execSync(`npm --silent --prefix "${appPath}" ci`, options)
              execSync(`npm --silent --prefix "${appPath}" run build`, options)
              execSync(`cp -R ${buildPath}/* ${outputDir}`)
            } catch (e) {
              console.error(e)
              return false
            }
            return true
          }
        }
      }
    })

    new s3deploy.BucketDeployment(this, 'UIDeployment', {
      prune: false,
      sources: [frontEndAsset, awsExports],
      destinationBucket: websiteBucket,
      distribution: cloudfrontDistribution
    })
  }
}
