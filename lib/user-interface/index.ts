import { Aws, DockerImage, Duration, RemovalPolicy } from 'aws-cdk-lib'
import { CloudFrontAllowedMethods, CloudFrontWebDistribution, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import * as path from 'path'
import { type ExecSyncOptionsWithBufferEncoding, execSync } from 'child_process'
import { type IUserPool } from 'aws-cdk-lib/aws-cognito'
import { type IdentityPool } from '@aws-cdk/aws-cognito-identitypool-alpha'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'

interface UserInterfaceProps {
  userPoolClientId: string
  userPool: IUserPool
  identityPool: IdentityPool
  graphqlApiUrl: string
  graphqlApiKey: string | undefined
  emailBucket: Bucket
}

export class UserInterface extends Construct {
  constructor (scope: Construct, id: string, props: UserInterfaceProps) {
    const { emailBucket, userPoolClientId, userPool, identityPool, graphqlApiKey, graphqlApiUrl } = props
    const { identityPoolId } = identityPool
    const { userPoolId } = userPool
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

    const websiteOAI = new OriginAccessIdentity(this, 'S3OriginWebsite')
    websiteBucket.grantRead(websiteOAI)

    const newslettersOAI = new OriginAccessIdentity(this, 'S3OriginNewsletters')
    emailBucket.grantRead(newslettersOAI)

    const cloudfrontDistribution = new CloudFrontWebDistribution(this, 'CloudFrontDistribution', {
      originConfigs: [
        {
          behaviors: [{ isDefaultBehavior: true }],
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: websiteOAI
          }
        },
        {
          behaviors: [{

            pathPattern: 'newsletter-content/*',
            allowedMethods: CloudFrontAllowedMethods.GET_HEAD,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            defaultTtl: Duration.seconds(0)
          }],
          s3OriginSource: {
            s3BucketSource: emailBucket,
            originAccessIdentity: newslettersOAI
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

    identityPool.authenticatedRole.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:GetObject'],
        resources: [`${emailBucket.bucketArn}/NEWSLETTERS/`]
      })
    )

    const awsExports = s3deploy.Source.jsonData('aws-exports.json', {
      aws_project_region: Aws.REGION,
      aws_cognito_region: Aws.REGION,
      aws_user_pools_id: userPool.userPoolId,
      aws_user_pools_web_client_id: userPoolClientId,
      aws_cognito_identity_pool_id: identityPoolId,
      Auth: {
        region: Aws.REGION,
        userPoolId,
        userPoolWebClientId: userPoolClientId,
        identityPoolId
      },
      API: {
        GraphQL: {
          endpoints: graphqlApiUrl,
          region: Aws.REGION,
          defaultAuthMode: 'userPool'
        }
      },
      aws_appsync_graphqlEndpoint: graphqlApiUrl,
      aws_appsync_region: Aws.REGION,
      aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
      aws_appsync_apiKey: graphqlApiKey,
      appConfig: {
        emailBucket: emailBucket.bucketName
      }
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
