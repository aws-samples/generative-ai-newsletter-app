/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import * as path from 'path';
import { Aws, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  AllowedMethods,
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { type UIConfig } from '../shared/common/deploy-config';

interface UserInterfaceProps {
  emailBucket: Bucket;
  userPoolId: string;
  userPoolClientId: string;
  identityPoolId: string;
  graphqlApiUrl: string;
  loggingBucket: Bucket;
}

export class UserInterface extends Construct {
  constructor(scope: Construct, id: string, props: UserInterfaceProps) {
    super(scope, id);
    const { emailBucket } = props;

    const ui = this.node.tryGetContext('ui') as UIConfig;
    const appPath = path.join(__dirname, 'genai-newsletter-ui');

    const websiteBucket = new Bucket(this, 'GenAINewsletterFrontEnd', {
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      encryption: BucketEncryption.S3_MANAGED,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      serverAccessLogsBucket: props.loggingBucket,
      serverAccessLogsPrefix: 'website-access-logs/',
    });

    const websiteOAI = new OriginAccessIdentity(this, 'S3OriginWebsite');
    websiteBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:ListBucket', 's3:GetObject'],
        resources: [websiteBucket.bucketArn, websiteBucket.arnForObjects('*')],
        principals: [websiteOAI.grantPrincipal],
        effect: Effect.ALLOW,
      }),
    );

    const newslettersOAI = new OriginAccessIdentity(this, 'S3OriginNewsletters');
    emailBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:ListBucket', 's3:GetObject'],
        resources: [emailBucket.bucketArn, emailBucket.arnForObjects('*')],
        principals: [newslettersOAI.grantPrincipal],
        effect: Effect.ALLOW,
      }),
    );

    const cloudfrontDistribution = new Distribution(this, 'CloudFrontDistributionNew', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(websiteBucket),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
      },
      additionalBehaviors: {
        'newsletter-content/*': {
          origin: S3BucketOrigin.withOriginAccessControl(emailBucket),
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      logBucket: props.loggingBucket,
      logFilePrefix: 'cloudfront-access-logs/',
      enableLogging: true,
      certificate: ui?.acmCertificateArn !== undefined && ui?.hostName !== undefined ? Certificate.fromCertificateArn(this, 'AcmCertificate', ui.acmCertificateArn) : undefined,

    });

    let amplifyUI = ui;
    if (ui !== undefined) {
      delete amplifyUI.acmCertificateArn;
    } else {
      amplifyUI = {};
    }
    if (amplifyUI.hostName === undefined) {
      amplifyUI.hostName = cloudfrontDistribution.distributionDomainName;
    }

    const exports = {
      Auth: {
        Cognito: {
          userPoolId: props.userPoolId,
          userPoolClientId: props.userPoolClientId,
          identityPoolId: props.identityPoolId,
          loginWith: {},
        },
      },
      ui: amplifyUI,
      API: {
        GraphQL: {
          endpoint: props.graphqlApiUrl,
          region: Aws.REGION,
          defaultAuthMode: 'lambda',
        },
      },
      appConfig: {
        emailBucket: emailBucket.bucketName,
      },
    };
    const auth = this.node.tryGetContext('authConfig');

    if (auth !== undefined && auth.cognito.oauth !== undefined) {
      exports.Auth.Cognito.loginWith = {
        oauth: { ...auth.cognito.oauth },
      };
    }

    const awsExports = s3deploy.Source.jsonData(
      'amplifyconfiguration.json',
      exports,
    );

    const frontEndAsset = s3deploy.Source.asset(`${appPath}/dist`);

    new s3deploy.BucketDeployment(this, 'UIDeployment', {
      prune: false,
      sources: [frontEndAsset, awsExports],
      destinationBucket: websiteBucket,
      distribution: cloudfrontDistribution,
    });

    new CfnOutput(this, 'AppLink', {
      value: `https://${ui?.acmCertificateArn !== undefined && ui?.hostName !== undefined ? ui.hostName : cloudfrontDistribution.distributionDomainName}/`,
    });

    NagSuppressions.addResourceSuppressions(
      websiteBucket,
      [
        {
          id: 'AwsSolutions-S5',
          reason: 'OAI requires ListBucket permission',
        },
      ],
      true,
    );
    NagSuppressions.addResourceSuppressions(cloudfrontDistribution, [
      {
        id: 'AwsSolutions-CFR2',
        reason: 'WAF not required for solution',
      },
      {
        id: 'AwsSolutions-CFR4',
        reason:
          "Using default CloudFront cert which doesn't allow for customized TLS versions",
      },
      {
        id: 'AwsSolutions-CFR1',
        reason: 'Not requiring any geo-restrictions',
      },
    ]);
  }
}
