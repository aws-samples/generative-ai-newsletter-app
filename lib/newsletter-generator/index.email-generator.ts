import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { DynamoDBClient, QueryCommand, type QueryCommandInput, GetItemCommand, type GetItemCommandInput, PutItemCommand, type PutItemCommandInput } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import middy from '@middy/core'
import { v4 as uuidv4 } from 'uuid'
import { NewsletterEmail } from './react-email-generator/emails/newsletter'
import { render } from '@react-email/render'
import { Upload } from '@aws-sdk/lib-storage'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const SERVICE_NAME = 'email-generator'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())
const s3 = tracer.captureAWSv3Client(new S3Client())

const NEWS_SUBSCRIPTION_TABLE = process.env.NEWS_SUBSCRIPTION_TABLE
const NEWS_SUBSCRIPTION_TABLE_LSI = process.env.NEWS_SUBSCRIPTION_TABLE_LSI
const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE
const EMAIL_BUCKET = process.env.EMAIL_BUCKET

interface EmailGeneratorInput {
  newsletterId: string
}

interface GeneratedEmailContents {
  html: string
  text: string
}

interface ArticleData {
  title: string
  url: string
  content: string
  createdAt: string
}

const lambdaHandler = async (event: EmailGeneratorInput): Promise<void> => {
  logger.debug('Starting email generator', {
    newsletterId: event.newsletterId
  })
  tracer.putMetadata('subscriptionIds', event.newsletterId)
  const { subscriptionIds, numberOfDaysToInclude } = await getNewsletterDetails(event.newsletterId)

  tracer.putMetadata('numberOfDaysToInclude', numberOfDaysToInclude)
  const articles = await getArticlesForSubscriptions(subscriptionIds, numberOfDaysToInclude)
  if (articles.length === 0) {
    logger.debug('No articles found')
    return
  }
  const date = new Date()
  const emailId = uuidv4()
  const emailContents = await generateEmail(articles)
  await storeEmailInS3(emailContents, date, emailId)
  await recordEmailDetails(event.newsletterId, emailId, date)
  logger.debug('Email generator complete')
}

const getNewsletterDetails = async (newsletterId: string): Promise<{ subscriptionIds: string[], numberOfDaysToInclude: number }> => {
  console.debug('Getting newsletter details', { newsletterId })
  const input: GetItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Key: {
      newsletterId: { S: newsletterId },
      compoundSortKey: { S: 'newsletter#' + newsletterId }
    }
  }
  const command = new GetItemCommand(input)
  const response = await dynamodb.send(command)
  console.debug('Newsletter details', { response })
  if (response.Item === undefined) {
    console.debug('No newsletter found')
    throw new Error('No newsletter found')
  }
  const newsletterItem = unmarshall(response.Item)
  return {
    subscriptionIds: newsletterItem.subscriptionIds as string[],
    numberOfDaysToInclude: newsletterItem.numberOfDaysToInclude as number
  }
}

const getArticlesForSubscriptions = async (subscriptionIds: string[], numberOfDaysToInclude: number): Promise<ArticleData[]> => {
  logger.debug('Getting articles for subscriptions')
  const articlesData: ArticleData[] = []
  const calculatedDate = new Date(Date.now() - (numberOfDaysToInclude * 24 * 60 * 60 * 1000)).toISOString()
  console.debug('Articles included starting after date ' + calculatedDate)
  for (const subscriptionId of subscriptionIds) {
    const input: QueryCommandInput = {
      TableName: NEWS_SUBSCRIPTION_TABLE,
      IndexName: NEWS_SUBSCRIPTION_TABLE_LSI,
      KeyConditionExpression: '#subscriptionId = :subscriptionId and #createdAt > :startDate',
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#subscriptionId': 'subscriptionId',
        '#createdAt': 'createdAt',
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':subscriptionId': { S: subscriptionId },
        ':startDate': { S: calculatedDate },
        ':type': { S: 'article' }
      }
    }
    const command = new QueryCommand(input)
    const result = await dynamodb.send(command)
    if (result.Items !== undefined) {
      for (const item of result.Items) {
        if (item.title.S !== undefined && item.url.S !== undefined && item.articleSummary.S !== undefined && item.createdAt.S !== undefined) {
          metrics.addMetric('ArticlesFound', MetricUnits.Count, 1)
          articlesData.push({
            title: item.title.S,
            url: item.url.S,
            content: item.articleSummary.S,
            createdAt: item.createdAt.S
          })
        } else {
          logger.warn('Item does not contain title, url, articleSummary or createdAt', item)
        }
      }
    } else {
      logger.warn('Result does not contain items', { result })
    }
  }
  console.debug('Articles found', articlesData)
  return articlesData
}

const generateEmail = async (articles: ArticleData[]): Promise<GeneratedEmailContents> => {
  console.debug('Starting email generation')
  const html = render(NewsletterEmail({
    articles,
    title: 'Newsletter'
  }))
  metrics.addMetric('HTMLEmailsGenerated', MetricUnits.Count, 1)
  console.debug('HTML email generated', { html })
  console.debug('Starting plantext email generation')
  const text = render(NewsletterEmail({
    title: 'Newsletter',
    articles
  }), {
    plainText: true
  })
  metrics.addMetric('TextEmailsGenerated', MetricUnits.Count, 1)
  console.debug('Plaintext email generated', { text })
  return { html, text }
}

const storeEmailInS3 = async (email: GeneratedEmailContents, date: Date, emailId: string): Promise<void> => {
  logger.debug('Storing email in S3 Email Bucket')
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  const emailKey = `NEWSLETTERS/${year}/${month}/${day}/${emailId}`
  const htmlUpload = new Upload({
    client: s3,
    params: {
      Bucket: EMAIL_BUCKET,
      Key: `${emailKey}.html`,
      Body: Buffer.from(email.html)
    }
  })
  const textUpload = new Upload({
    client: s3,
    params: {
      Bucket: EMAIL_BUCKET,
      Key: `${emailKey}.txt`,
      Body: Buffer.from(email.text)
    }
  })
  logger.debug('Starting HTML Upload')
  try {
    await htmlUpload.done()
    metrics.addMetric('HTMLEmailsUploaded', MetricUnits.Count, 1)
    tracer.putAnnotation('htmlUploadComplete', true)
    tracer.putMetadata('htmlEmail', {
      bucket: EMAIL_BUCKET,
      key: `${emailKey}.html`
    })
  } catch (error) {
    metrics.addMetric('HTMLEmailsFailedToUpload', MetricUnits.Count, 1)
    logger.error('Error uploading HTML email', { error })
    tracer.addErrorAsMetadata(error as Error)
    tracer.putAnnotation('htmlUploadComplete', false)
  }
  try {
    await textUpload.done()
    metrics.addMetric('TextEmailsUploaded', MetricUnits.Count, 1)
    tracer.putAnnotation('textUploadComplete', true)
    tracer.putMetadata('textEmail', {
      bucket: EMAIL_BUCKET,
      key: `${emailKey}.txt`
    })
  } catch (error) {
    metrics.addMetric('TextEmailsFailedToUpload', MetricUnits.Count, 1)
    logger.error('Error uploading text email', { error })
    tracer.addErrorAsMetadata(error as Error)
    tracer.putAnnotation('textUploadComplete', false)
  }
}

const recordEmailDetails = async (newsletterId: string, emailId: string, date: Date): Promise<void> => {
  console.debug('Recording email details')
  const input: PutItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Item: {
      newsletterId: { S: newsletterId },
      compoundSortKey: {
        S: 'email#' + emailId
      },
      type: {
        S: 'email'
      },
      createdAt: {
        S: `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
      }
    }
  }
  const command = new PutItemCommand(input)
  await dynamodb.send(command)
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
