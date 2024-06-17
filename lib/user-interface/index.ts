/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Aws, CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib'
import {
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  ViewerCertificate,
  ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  ObjectOwnership
} from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import * as path from 'path'
import { type UIConfig } from '../shared/common/deploy-config'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { NagSuppressions } from 'cdk-nag'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface UserInterfaceProps {
  emailBucket: Bucket
  userPoolId: string
  userPoolClientId: string
  identityPoolId: string
  graphqlApiUrl: string
  loggingBucket: Bucket
}

export class UserInterface extends Construct {
  constructor (scope: Construct, id: string, props: UserInterfaceProps) {
    super(scope, id)
    const { emailBucket } = props

    const ui = this.node.tryGetContext('ui') as UIConfig
    const appPath = path.join(__dirname, 'genai-newsletter-ui')

    const websiteBucket = new Bucket(this, 'GenAINewsletterFrontEnd', {
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      encryption: BucketEncryption.S3_MANAGED,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      serverAccessLogsBucket: props.loggingBucket,
      serverAccessLogsPrefix: 'website-access-logs/'
    })

    const websiteOAI = new OriginAccessIdentity(this, 'S3OriginWebsite')
    websiteBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:ListBucket', 's3:GetObject'],
        resources: [websiteBucket.bucketArn, websiteBucket.arnForObjects('*')],
        principals: [websiteOAI.grantPrincipal],
        effect: Effect.ALLOW
      })
    )

    const newslettersOAI = new OriginAccessIdentity(this, 'S3OriginNewsletters')
    emailBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:ListBucket', 's3:GetObject'],
        resources: [emailBucket.bucketArn, emailBucket.arnForObjects('*')],
        principals: [newslettersOAI.grantPrincipal],
        effect: Effect.ALLOW
      })
    )

    const cloudfrontDistribution = new CloudFrontWebDistribution(
      this,
      'CloudFrontDistribution',
      {
        comment: `${Stack.of(this).stackName} Front End`,
        loggingConfig: {
          bucket: new Bucket(this, 'CloudFrontLoggingBucket', {
            objectOwnership: ObjectOwnership.OBJECT_WRITER,
            serverAccessLogsBucket: props.loggingBucket,
            serverAccessLogsPrefix: 'cloudfront-access-logs-access-logs/',
            enforceSSL: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED
          }),
          prefix: 'cloudfront-access-logs/'
        },
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        viewerCertificate:
          ui?.acmCertificateArn !== undefined && ui?.hostName !== undefined
            ? ViewerCertificate.fromAcmCertificate(
                Certificate.fromCertificateArn(
                  this,
                  'AcmCertificate',
                  ui.acmCertificateArn
                ),
                {
                  aliases: [ui.hostName]
                }
              )
            : undefined,
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

    let amplifyUI = ui
    if (ui !== undefined) {
      delete amplifyUI.acmCertificateArn
    } else {
      amplifyUI = {}
    }
    if (amplifyUI.hostName === undefined) {
      amplifyUI.hostName = cloudfrontDistribution.distributionDomainName
    }

    const exports = {
      Auth: {
        Cognito: {
          userPoolId: props.userPoolId,
          userPoolClientId: props.userPoolClientId,
          identityPoolId: props.identityPoolId,
          loginWith: {}
        }
      },
      ui: amplifyUI,
      API: {
        GraphQL: {
          endpoint: props.graphqlApiUrl,
          region: Aws.REGION,
          defaultAuthMode: 'lambda'
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

    const frontEndAsset = s3deploy.Source.asset(`${appPath}/dist`)

    new s3deploy.BucketDeployment(this, 'UIDeployment', {
      prune: false,
      sources: [frontEndAsset, awsExports],
      destinationBucket: websiteBucket,
      distribution: cloudfrontDistribution
    })

    new CfnOutput(this, 'AppLink', {
      value: `https://${ui?.acmCertificateArn !== undefined && ui?.hostName !== undefined ? ui.hostName : cloudfrontDistribution.distributionDomainName}/`
    })

    NagSuppressions.addResourceSuppressions(
      websiteBucket,
      [
        {
          id: 'AwsSolutions-S5',
          reason: 'OAI requires ListBucket permission'
        }
      ],
      true
    )
    NagSuppressions.addResourceSuppressions(cloudfrontDistribution, [
      {
        id: 'AwsSolutions-CFR2',
        reason: 'WAF not required for solution'
      },
      {
        id: 'AwsSolutions-CFR4',
        reason:
          "Using default CloudFront cert which doesn't allow for customized TLS versions"
      },
      {
        id: 'AwsSolutions-CFR1',
        reason: 'Not requiring any geo-restrictions'
      }
    ])
  }
}
