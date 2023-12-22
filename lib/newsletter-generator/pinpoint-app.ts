import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { CfnApp, CfnEmailChannel } from 'aws-cdk-lib/aws-pinpoint'
import { EmailIdentity, Identity } from 'aws-cdk-lib/aws-ses'
import { Construct } from 'constructs'
import { Stack } from 'aws-cdk-lib'

export class PinpointApp extends Construct {
  public readonly pinpointAppId: string
  public readonly pinpointProjectAdminPolicy: Policy
  public readonly pinpointAddNewsletterSegmentPolicy: Policy
  constructor (scope: Construct, id: string) {
    super(scope, id)

    const stackDetails = Stack.of(this)
    const pinpointApp = new CfnApp(this, 'PinpointApp', {
      name: 'GenAINewsletter'
    })
    this.pinpointAppId = pinpointApp.ref

    const emailIdentity = new EmailIdentity(this, 'EmailIdentity', {
      identity: Identity.email('awsrudy@amazon.com')
    })

    new CfnEmailChannel(this, 'PinpointEmailChannel', {
      applicationId: this.pinpointAppId,
      enabled: true,
      fromAddress: 'awsrudy@amazon.com', // TODO Make this parameterized
      identity: emailIdentity.emailIdentityName
    })

    const pinpointProjectAdminPolicy = new Policy(this, 'PinpointProjectAdmin', {
      statements: [
        // new PolicyStatement({
        //   effect: Effect.ALLOW,
        //   principals: [new ServicePrincipal('pinpoint.amazonaws.com')],
        //   actions: ['ses:*'],
        //   resources: [emailIdentity.emailIdentityName],
        //   conditions: {
        //     StringEquals: {
        //       'aws:SourceAccount': stackDetails.account
        //     },
        //     StringLike: {
        //       'aws:SourceArn': `arn:aws:ses:${stackDetails.region}:${stackDetails.account}:identity/${emailIdentity.emailIdentityName}`
        //     }
        //   }
        // }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['mobiletargeting:GetApps'],
          resources: [`arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}`]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'mobiletargeting:*'
          ],
          resources: [
            `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${this.pinpointAppId}`,
            `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${this.pinpointAppId}/*`,
            `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:reports`
          ]
        })
      ]
    })

    const pinpointAddNewsletterSegmentPolicy = new Policy(this, 'AllowAddNewsletterSegmentPolicy', {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'mobiletargeting:CreateSegment',
            'mobiletargeting:GetSegment'
          ],
          resources: [
                  `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${this.pinpointAppId}`,
                  `arn:aws:mobiletargeting:${stackDetails.region}:${stackDetails.account}:apps/${this.pinpointAppId}/segments/*`
          ]
        })
      ]
    })

    this.pinpointProjectAdminPolicy = pinpointProjectAdminPolicy
    this.pinpointAddNewsletterSegmentPolicy = pinpointAddNewsletterSegmentPolicy
  }
}
