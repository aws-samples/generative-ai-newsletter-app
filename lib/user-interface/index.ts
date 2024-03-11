import {
  Aws,
  CfnOutput,
  DockerImage,
  Duration,
  RemovalPolicy
} from 'aws-cdk-lib'
import {
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { BlockPublicAccess, Bucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import * as path from 'path'
import { type ExecSyncOptionsWithBufferEncoding, execSync } from 'child_process'
import { type UIConfig } from '../shared/common/deploy-config'

interface UserInterfaceProps {

  emailBucket: Bucket
  userPoolId: string
  userPoolClientId: string
  identityPoolId: string
  graphqlApiUrl: string

}

export class UserInterface extends Construct {
  constructor (scope: Construct, id: string, props: UserInterfaceProps) {
    super(scope, id)
    const {
      emailBucket
    } = props

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

    const cloudfrontDistribution = new CloudFrontWebDistribution(
      this,
      'CloudFrontDistribution',
      {
        loggingConfig: {
          bucket: new Bucket(this, 'CloudFrontLoggingBucket', {
            objectOwnership: ObjectOwnership.OBJECT_WRITER
          })
        },
        originConfigs: [
          {
            behaviors: [{ isDefaultBehavior: true }],
            s3OriginSource: {
              s3BucketSource: websiteBucket,
              originAccessIdentity: websiteOAI
            }
          },
          {
            behaviors: [
              {
                pathPattern: 'newsletter-content/*',
                allowedMethods: CloudFrontAllowedMethods.GET_HEAD,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                defaultTtl: Duration.seconds(0)
              }
            ],
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
            responseCode: 200,
            responsePagePath: '/index.html'
          }
        ]
      }
    )
    new CfnOutput(this, 'CloudFrontDistributionDomainName', {
      value: cloudfrontDistribution.distributionDomainName
    })

    const exports = {
      Auth: {
        Cognito: {
          userPoolId: props.userPoolId,
          userPoolClientId: props.userPoolClientId,
          identityPoolId: props.identityPoolId,
          loginWith: {}
        }
      },
      ui: this.node.tryGetContext('ui') as UIConfig,
      API: {
        GraphQL: {
          endpoint: props.graphqlApiUrl,
          region: Aws.REGION,
          defaultAuthMode: 'userPool'
        }
      },
      appConfig: {
        emailBucket: emailBucket.bucketName
      }
    }
    const auth = this.node.tryGetContext('authConfig')

    if (auth !== undefined && auth.cognito.oauth !== undefined) {
      exports.Auth.Cognito.loginWith = {
        oauth: { ...auth.cognito.oauth }
      }
    }

    const awsExports = s3deploy.Source.jsonData(
      'amplifyconfiguration.json',
      exports
    )

    const frontEndAsset = s3deploy.Source.asset(appPath, {
      bundling: {
        image: DockerImage.fromRegistry(
          'public.ecr.aws/sam/build-nodejs20.x:latest'
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
