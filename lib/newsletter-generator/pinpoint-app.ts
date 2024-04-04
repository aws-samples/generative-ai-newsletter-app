/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  Effect,
  Policy,
  PolicyStatement,
  PrincipalWithConditions,
  ServicePrincipal
} from 'aws-cdk-lib/aws-iam'
import { CfnApp, CfnEmailChannel, CfnSegment } from 'aws-cdk-lib/aws-pinpoint'
import { Construct } from 'constructs'
import { Duration, Stack } from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import {
  ApplicationLogLevel,
  Architecture,
  LambdaInsightsVersion,
  LogFormat,
  Runtime,
  Tracing
} from 'aws-cdk-lib/aws-lambda'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { type Table } from 'aws-cdk-lib/aws-dynamodb'
import { NagSuppressions } from 'cdk-nag'

interface PinpointAppProps {
  newsletterTable: Table
  newsletterTableCampaignGSI: string
}

export class PinpointApp extends Construct {
  public readonly pinpointAppId: string
  public readonly pinpointCampaignHookFunction: NodejsFunction
  public readonly pinpointBaseSegmentId: string
  public readonly pinpointProjectAdminPolicy: Policy
  public readonly pinpointSubscribeUserToNewsletterPolicyStatement: PolicyStatement
  public readonly pinpointAddNewsletterCampaignAndSegmentPolicyStatement: PolicyStatement
  constructor (scope: Construct, id: string, props: PinpointAppProps) {
    super(scope, id)

    const pinpointEmail = this.node.tryGetContext('pinpointEmail')
    const { verifiedIdentity, senderAddress } = pinpointEmail

    const stackDetails = Stack.of(this)
    const pinpointApp = new CfnApp(this, 'PinpointApp', {
      name: 'GenAINewsletter'
    })

    new CfnEmailChannel(this, 'PinpointEmailChannel', {
      applicationId: pinpointApp.ref,
      enabled: true,
      fromAddress: senderAddress,
      identity: verifiedIdentity
    })

    const baseSegment = new CfnSegment(this, 'BaseSegment', {
      applicationId: pinpointApp.ref,
      name: 'BaseSegment'
    })

    const baseSegmentId = baseSegment.getAtt('SegmentId').toString()

    const pinpointCampaignHookFunction = new NodejsFunction(
      this,
      'pinpoint-campaign-hook',
      {
        description:
          'Function responsible for filtering Pinpoint Endpoints for a Pinpoint Campaign to only subscribed users',
        handler: 'handler',
        architecture: Architecture.ARM_64,
        runtime: Runtime.NODEJS_20_X,
        tracing: Tracing.ACTIVE,
        logFormat: LogFormat.JSON,
        logRetention: RetentionDays.ONE_WEEK,
        applicationLogLevel: ApplicationLogLevel.DEBUG,
        insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
        timeout: Duration.minutes(5),
        environment: {
          POWERTOOLS_LOG_LEVEL: 'DEBUG',
          NEWSLETTER_DATA_TABLE: props.newsletterTable.tableName,
          NEWSLETTER_DATA_TABLE_CAMPAIGN_GSI: props.newsletterTableCampaignGSI,
          PINPOINT_APP_ID: pinpointApp.ref,
          PINPOINT_BASE_SEGMENT_ID: baseSegmentId
        }
      }
    )
    props.newsletterTable.grantReadData(pinpointCampaignHookFunction)

    const pinpointPrincipal = new PrincipalWithConditions(
      new ServicePrincipal('pinpoint.amazonaws.com'),
      {
        ArnLike: {
          'aws:SourceArn': `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${pinpointApp.ref}/*`
        }
      }
    )
    pinpointCampaignHookFunction.grantInvoke(pinpointPrincipal)

    const pinpointProjectAdminPolicy = new Policy(
      this,
      'PinpointProjectAdmin',
      {
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['mobiletargeting:GetApps'],
            resources: [
              `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}`
            ]
          }),
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['mobiletargeting:*'],
            resources: [
              `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${pinpointApp.ref}`,
              `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${pinpointApp.ref}/*`,
              `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:reports`
            ]
          })
        ]
      }
    )

    const pinpointAddNewsletterCampaignAndSegmentPolicyStatement =
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'mobiletargeting:CreateSegment',
          'mobiletargeting:GetSegment',
          'mobiletargeting:CreateCampaign',
          'mobiletargeting:GetCampaign',
          'mobiletargeting:ListTemplates',
          'mobiletargeting:ListTemplateVersions',
          'mobiletargeting:GetEmailTemplate',
          'mobiletargeting:CreateEmailTemplate',
          'mobiletargeting:UpdateEmailTemplate'
        ],
        resources: [
          `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${pinpointApp.ref}`,
          `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${pinpointApp.ref}/*`,
          `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:templates/*`
        ]
      })

    const pinpointSubscribeUserToNewsletterPolicyStatement =
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'mobiletargeting:UpdateEndpoint',
          'mobiletargeting:GetEndpoint',
          'mobiletargeting:GetUserEndpoints'
        ],
        resources: [
          `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${pinpointApp.ref}`,
          `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${pinpointApp.ref}/*`
        ]
      })

    this.pinpointAppId = pinpointApp.ref
    this.pinpointBaseSegmentId = baseSegmentId
    this.pinpointCampaignHookFunction = pinpointCampaignHookFunction
    this.pinpointProjectAdminPolicy = pinpointProjectAdminPolicy
    this.pinpointAddNewsletterCampaignAndSegmentPolicyStatement =
      pinpointAddNewsletterCampaignAndSegmentPolicyStatement
    this.pinpointSubscribeUserToNewsletterPolicyStatement =
      pinpointSubscribeUserToNewsletterPolicyStatement

    /**
       * CDK NAG Suppressions
       */
    NagSuppressions.addResourceSuppressions(
      [pinpointCampaignHookFunction, pinpointProjectAdminPolicy],
      [{
        id: 'AwsSolutions-IAM5',
        reason: 'Allowing CloudWatch/XRay'
      }], true
    )
  }
}
