import { Stack, type StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { ApplicationLogLevel, LambdaInsightsVersion, LogFormat, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { type Construct } from 'constructs'

interface NewsletterGeneratorProps extends StackProps {
  newsSubscriptionTable: Table
  newsSubscriptionTableLSI: string
}

export class NewsletterGeneratorStack extends Stack {
  public readonly newsletterTable: Table
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

    const emailBucket = new Bucket(this, 'EmailBucket')

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
        EMAIL_BUCKET: emailBucket.bucketName
      }
    })
    props.newsSubscriptionTable.grantReadData(emailGeneratorFunction)
    emailBucket.grantWrite(emailGeneratorFunction)

    this.newsletterTable = newsletterTable
  }
}
