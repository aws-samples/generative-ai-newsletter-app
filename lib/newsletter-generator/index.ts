import { RemovalPolicy, Duration, Aws, Stack } from 'aws-cdk-lib'
import { AttributeType, BillingMode, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { ApplicationLogLevel, Architecture, LambdaInsightsVersion, LogFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
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
export const newsletterTableOwnerGSI: string = 'newsletter-owner-index'

export class NewsletterGenerator extends Construct {
  public readonly newsletterTable: Table
  public readonly createNewsletterFunction: NodejsFunction
  public readonly userSubscriberFunction: NodejsFunction
  public readonly userUnsubscriberFunction: NodejsFunction
  public readonly newsletterScheduleGroup: CfnScheduleGroup
  public readonly getNewsletterFunction: NodejsFunction
  public readonly emailBucket: Bucket
  private readonly newsletterScheduleGroupName: string
  constructor (scope: Construct, id: string, props: NewsletterGeneratorProps) {
    super(scope, id)
    const { newsSubscriptionTable } = props
    this.newsletterScheduleGroupName = Stack.of(this).stackName + 'NewsletterSubscriptions'
    const newsletterTable = new Table(this, 'NewsletterTable', {
      removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      tableName: Stack.of(this).stackName + '-NewsletterTable',
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
      },
      projectionType: ProjectionType.KEYS_ONLY
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

    const newsletterCampaignCreatorFunction = new NodejsFunction(this, 'newsletter-campaign-creator', {
      description: 'Function responsible for creating the newsletter campaigns for each unique email',
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

    const emailGeneratorFunction = new NodejsFunction(this, 'email-generator', {
      description: 'Function responsible for generating the newsletter HTML & Plain Text emails',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      memorySize: 512, // Bumping memory up on this function since it is doing rendering and processing
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        NEWS_SUBSCRIPTION_TABLE: props.newsSubscriptionTable.tableName,
        NEWS_SUBSCRIPTION_TABLE_LSI: props.newsSubscriptionTableLSI,
        NEWSLETTER_TABLE: newsletterTable.tableName,
        EMAIL_BUCKET: emailBucket.bucketName,
        NEWSLETTER_CAMPAIGN_CREATOR_FUNCTION: newsletterCampaignCreatorFunction.functionName,
        APP_HOST_NAME: this.node.tryGetContext('appHostName')
      }
    })
    props.newsSubscriptionTable.grantReadData(emailGeneratorFunction)
    newsletterTable.grantReadWriteData(emailGeneratorFunction)
    emailBucket.grantWrite(emailGeneratorFunction)
    newsletterCampaignCreatorFunction.grantInvoke(emailGeneratorFunction)

    const newsletterScheduleGroup = new CfnScheduleGroup(this, 'NewsletterScheduleGroup', {
      name: this.newsletterScheduleGroupName
    })

    const emailGeneratorSchedulerInvokeRole = new Role(this, 'EmailGeneratorSchedulerInvokeRole', {
      assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
      description: 'Role used by the scheduler to invoke the email generator function'
    })
    emailGeneratorFunction.grantInvoke(emailGeneratorSchedulerInvokeRole)
    emailGeneratorFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: ['*'],
        effect: Effect.ALLOW
      })
    )
    const newsletterCreatorFunction = new NodejsFunction(this, 'newsletter-creator', {
      description: 'Function responsible for creating and scheduling the newsletter',
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
      runtime: Runtime.NODEJS_20_X,
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
      runtime: Runtime.NODEJS_20_X,
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
    UserPool.fromUserPoolId(this, 'AuthUserPool', props.userPoolId).grant(userSubscriberFunction, 'cognito-idp:ListUsers')
    userSubscriberFunction.addToRolePolicy(pinpointApp.pinpointSubscribeUserToNewsletterPolicyStatement)

    const userUnsubscriberFunction = new NodejsFunction(this, 'user-unsubscriber', {
      description: 'Function responsible for unsubscribing a user from the newsletter',
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
        NEWSLETTER_TABLE: newsletterTable.tableName
      }
    })
    newsletterTable.grantReadWriteData(userUnsubscriberFunction)

    this.emailBucket = emailBucket
    this.newsletterTable = newsletterTable
    this.newsletterScheduleGroup = newsletterScheduleGroup
    this.createNewsletterFunction = newsletterCreatorFunction
    this.userSubscriberFunction = userSubscriberFunction
    this.userUnsubscriberFunction = userUnsubscriberFunction
    this.getNewsletterFunction = getNewsletterFunction
  }
}
