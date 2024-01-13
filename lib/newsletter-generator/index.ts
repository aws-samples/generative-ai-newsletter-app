import { RemovalPolicy, Duration, Aws } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { ApplicationLogLevel, Architecture, LambdaInsightsVersion, LogFormat, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { CfnScheduleGroup } from 'aws-cdk-lib/aws-scheduler'
import { Construct } from 'constructs'
import { PinpointApp } from './pinpoint-app'
import { UserPool } from 'aws-cdk-lib/aws-cognito'

interface NewsletterGeneratorProps {
  newsSubscriptionTable: Table
  newsSubscriptionTableLSI: string
  userPoolId: string
}
export const newsletterTableCampaignGSI: string = 'newsletter-campaign-index'
export const newsletterTableItemTypeGSI: string = 'newsletter-item-type-index'

export class NewsletterGenerator extends Construct {
  public readonly newsletterTable: Table
  public readonly createNewsletterFunction: NodejsFunction
  public readonly userSubscriberFunction: NodejsFunction
  public readonly newsletterScheduleGroup: CfnScheduleGroup
  public readonly getNewsletterFunction: NodejsFunction
  public readonly emailBucket: Bucket
  private readonly newsletterScheduleGroupName: string = 'NewsletterSubscriptions'
  constructor (scope: Construct, id: string, props: NewsletterGeneratorProps) {
    super(scope, id)
    const { newsSubscriptionTable } = props
    const newsletterTable = new Table(this, 'NewsletterTable', {
      tableName: 'NewsletterData',
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'newsletterId',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'compoundSortKey',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST
    })

    newsletterTable.addGlobalSecondaryIndex({
      indexName: newsletterTableCampaignGSI,
      partitionKey: {
        name: 'campaignId',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'compoundSortKey',
        type: AttributeType.STRING
      }
    })

    newsletterTable.addGlobalSecondaryIndex({
      indexName: newsletterTableItemTypeGSI,
      partitionKey: {
        name: 'compoundSortKey',
        type: AttributeType.STRING
      }
    })
    const emailBucket = new Bucket(this, 'EmailBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    const pinpointApp = new PinpointApp(this, 'NewsletterPinpoint', { newsletterTable, newsletterTableCampaignGSI })

    const emailGeneratorFunction = new NodejsFunction(this, 'email-generator', {
      description: 'Function responsible for generating the newsletter HTML & Plain Text emails',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        NEWS_SUBSCRIPTION_TABLE: props.newsSubscriptionTable.tableName,
        NEWS_SUBSCRIPTION_TABLE_LSI: props.newsSubscriptionTableLSI,
        NEWSLETTER_TABLE: newsletterTable.tableName,
        EMAIL_BUCKET: emailBucket.bucketName
      }
    })
    props.newsSubscriptionTable.grantReadData(emailGeneratorFunction)
    newsletterTable.grantReadWriteData(emailGeneratorFunction)
    emailBucket.grantWrite(emailGeneratorFunction)

    const newsletterScheduleGroup = new CfnScheduleGroup(this, 'NewsletterScheduleGroup', {
      name: this.newsletterScheduleGroupName
    })

    const emailGeneratorSchedulerInvokeRole = new Role(this, 'EmailGeneratorSchedulerInvokeRole', {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
      description: 'Role used by the scheduler to invoke the email generator function'
    })
    emailGeneratorFunction.grantInvoke(emailGeneratorSchedulerInvokeRole)
    const newsletterCreatorFunction = new NodejsFunction(this, 'newsletter-creator', {
      description: 'Function responsible for creating and scheduling the newsletter',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        NEWSLETTER_DATA_TABLE: newsletterTable.tableName,
        NEWSLETTER_SCHEDULE_GROUP_NAME: this.newsletterScheduleGroupName,
        EMAIL_GENERATOR_FUNCTION_ARN: emailGeneratorFunction.functionArn,
        EMAIL_GENERATOR_SCHEDULER_ROLE_ARN: emailGeneratorSchedulerInvokeRole.roleArn,
        PINPOINT_APP_ID: pinpointApp.pinpointAppId,
        PINPOINT_BASE_SEGMENT_ID: pinpointApp.pinpointBaseSegmentId
      }
    })
    newsletterTable.grantReadWriteData(newsletterCreatorFunction)
    newsletterCreatorFunction.addToRolePolicy(pinpointApp.pinpointAddNewsletterCampaignAndSegmentPolicyStatement)
    newsletterCreatorFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'scheduler:CreateSchedule',
        'iam:PassRole'
      ],
      resources: [
        emailGeneratorSchedulerInvokeRole.roleArn,
        `arn:aws:scheduler:${Aws.REGION}:${Aws.ACCOUNT_ID}:schedule/${this.newsletterScheduleGroupName}/*`
      ]
    }))

    const getNewsletterFunction = new NodejsFunction(this, 'get-newsletter', {
      description: 'Function responsible for getting looking up a Newsletter and its associated details',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        NEWSLETTER_DATA_TABLE: newsletterTable.tableName,
        NEWS_SUBSCRIPTION_TABLE: newsSubscriptionTable.tableName
      }
    })

    newsletterTable.grantReadData(getNewsletterFunction)
    newsSubscriptionTable.grantReadData(getNewsletterFunction)

    const userSubscriberFunction = new NodejsFunction(this, 'user-subscriber', {
      description: 'Function responsible for subscribing a user to the newsletter',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        PINPOINT_APP_ID: pinpointApp.pinpointAppId,
        COGNITO_USER_POOL_ID: props.userPoolId,
        NEWSLETTER_TABLE: newsletterTable.tableName
      }
    })
    newsletterTable.grantReadWriteData(userSubscriberFunction)
    UserPool.fromUserPoolId(this, 'AuthUserPool', props.userPoolId).grant(userSubscriberFunction, 'cognito-idp:AdminUpdateUserAttributes', 'cognito-idp:AdminGetUser')
    userSubscriberFunction.addToRolePolicy(pinpointApp.pinpointSubscribeUserToNewsletterPolicyStatement)

    const newsletterCampaignCreatorFunction = new NodejsFunction(this, 'newsletter-campaign-creator', {
      description: 'Function responsible for creating the newsletter campaigns for each unique email',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        NEWSLETTER_TABLE: newsletterTable.tableName,
        PINPOINT_APP_ID: pinpointApp.pinpointAppId,
        PINPOINT_BASE_SEGMENT_ID: pinpointApp.pinpointBaseSegmentId,
        PINPOINT_CAMPAIGN_HOOK_FUNCTION: pinpointApp.pinpointCampaignHookFunction.functionName,
        EMAIL_BUCKET: emailBucket.bucketName
      }
    })
    newsletterCampaignCreatorFunction.addToRolePolicy(pinpointApp.pinpointAddNewsletterCampaignAndSegmentPolicyStatement)
    emailBucket.grantRead(newsletterCampaignCreatorFunction)
    newsletterTable.grantReadWriteData(newsletterCampaignCreatorFunction)

    this.emailBucket = emailBucket
    this.newsletterTable = newsletterTable
    this.newsletterScheduleGroup = newsletterScheduleGroup
    this.createNewsletterFunction = newsletterCreatorFunction
    this.userSubscriberFunction = userSubscriberFunction
    this.getNewsletterFunction = getNewsletterFunction
  }
}
