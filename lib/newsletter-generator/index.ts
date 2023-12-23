import { Stack, type StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { ApplicationLogLevel, LambdaInsightsVersion, LogFormat, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { CfnScheduleGroup } from 'aws-cdk-lib/aws-scheduler'
import { type Construct } from 'constructs'
import { PinpointApp } from './pinpoint-app'
import { type IUserPool } from 'aws-cdk-lib/aws-cognito'

interface NewsletterGeneratorProps extends StackProps {
  newsSubscriptionTable: Table
  newsSubscriptionTableLSI: string
  cognitoUserPool: IUserPool
}

export class NewsletterGeneratorStack extends Stack {
  public readonly newsletterTable: Table
  public readonly newsletterScheduleGroup: CfnScheduleGroup
  private readonly newsletterScheduleGroupName: string = 'NewsletterSubscriptions'
  constructor (scope: Construct, id: string, props: NewsletterGeneratorProps) {
    super(scope, id)

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

    const emailBucket = new Bucket(this, 'EmailBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    const pinpointApp = new PinpointApp(this, 'NewsletterPinpoint')

    const emailGeneratorFunction = new NodejsFunction(this, 'email-generator', {
      description: 'Function responsible for generating the newsletter HTML & Plain Text emails',
      handler: 'handler',
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
    newsletterTable.grantWriteData(emailGeneratorFunction)
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
        PINPOINT_APP_ID: pinpointApp.pinpointAppId
      }
    })
    newsletterTable.grantWriteData(newsletterCreatorFunction)
    newsletterCreatorFunction.addToRolePolicy(pinpointApp.pinpointAddNewsletterSegmentPolicyStatement)
    newsletterCreatorFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'scheduler:CreateSchedule',
        'iam:PassRole'
      ],
      resources: [
        emailGeneratorSchedulerInvokeRole.roleArn,
        `arn:aws:scheduler:${this.region}:${this.account}:schedule/${this.newsletterScheduleGroupName}/*`
      ]
    }))

    const userSubscriberFunction = new NodejsFunction(this, 'user-subscriber', {
      description: 'Function responsible for subscribing a user to the newsletter',
      handler: 'handler',
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      logRetention: RetentionDays.ONE_WEEK,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        PINPOINT_APP_ID: pinpointApp.pinpointAppId,
        COGNITO_USER_POOL_ID: props.cognitoUserPool.userPoolId
      }
    })
    props.cognitoUserPool.grant(userSubscriberFunction, 'cognito-idp:AdminUpdateUserAttributes', 'cognito-idp:AdminGetUser')
    userSubscriberFunction.addToRolePolicy(pinpointApp.pinpointSubscribeUserToNewsletterPolicyStatement)

    this.newsletterTable = newsletterTable
    this.newsletterScheduleGroup = newsletterScheduleGroup
  }
}
