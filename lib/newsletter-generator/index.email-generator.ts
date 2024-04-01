import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import {
  DynamoDBClient,
  QueryCommand,
  type QueryCommandInput,
  GetItemCommand,
  type GetItemCommandInput,
  PutItemCommand,
  type PutItemCommandInput
} from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import middy from '@middy/core'
import { v4 as uuidv4 } from 'uuid'
// Note: Requires local path rather than shared path to bundle deps correctly
import NewsletterEmail from '../shared/email-generator/emails/newsletter'
import { AnthropicBedrock } from '@anthropic-ai/bedrock-sdk'
import { render } from '@react-email/render'
import { Upload } from '@aws-sdk/lib-storage'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { NewsletterSummaryBuilder } from 'genai-newsletter-shared/prompts'
import { type ArticleData } from 'genai-newsletter-shared/prompts/types'
import { MultiSizeFormattedResponse } from 'genai-newsletter-shared/prompts/prompt-processing'
import { ArticleSummaryType, type Newsletter } from 'genai-newsletter-shared/api/API'
import { type NewsletterStyle } from 'genai-newsletter-shared/common/newsletter-style'

const SERVICE_NAME = 'email-generator'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())
const s3 = tracer.captureAWSv3Client(new S3Client())
const lambda = tracer.captureAWSv3Client(new LambdaClient())
const anthropic = new AnthropicBedrock()

const BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'

const DATA_FEED_TABLE = process.env.DATA_FEED_TABLE
const DATA_FEED_TABLE_LSI = process.env.DATA_FEED_TABLE_LSI
const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE
const EMAIL_BUCKET = process.env.EMAIL_BUCKET
const NEWSLETTER_CAMPAIGN_CREATOR_FUNCTION =
  process.env.NEWSLETTER_CAMPAIGN_CREATOR_FUNCTION
const APP_HOST_NAME = process.env.APP_HOST_NAME

interface EmailGeneratorInput {
  newsletterId: string
}

interface GeneratedEmailContents {
  html: string
  text: string
}

const lambdaHandler = async (event: EmailGeneratorInput): Promise<void> => {
  const { newsletterId } = event
  logger.debug('Starting email generator', {
    newsletterId
  })
  logger.debug('Base App Hostname = ' + APP_HOST_NAME)
  const newsletter = await getNewsletterDetails(newsletterId)
  const accountId = newsletter.accountId
  tracer.putMetadata('numberOfDaysToInclude', newsletter.numberOfDaysToInclude)
  if (newsletter.dataFeedIds !== undefined && newsletter.dataFeedIds !== null && newsletter.dataFeedIds.length > 0) {
    const articles = await getArticlesForDataFeeds(
      newsletter.dataFeedIds,
      newsletter.numberOfDaysToInclude
    )
    if (articles.length === 0) {
      logger.debug('No articles found')
    } else {
      const date = new Date()
      const emailId = uuidv4()
      const newsletterSummary = await generateNewsletterSummary(
        articles,
        newsletter.newsletterIntroPrompt ?? undefined
      )
      const emailContents = await generateEmail(
        articles,
        newsletterSummary,
        newsletter.title,
        newsletterId,
        newsletter.articleSummaryType ?? ArticleSummaryType.SHORT_SUMMARY,
        newsletter.newsletterStyle !== null ? newsletter.newsletterStyle as unknown as NewsletterStyle : undefined
      )
      const emailKey = await storeEmailInS3(emailContents, date, emailId)
      await recordEmailDetails(newsletterId, emailId, date, emailKey, accountId)
      await sendNewsletter(newsletterId, emailId, emailKey)
      logger.debug('Email generator complete')
    }
  }
}

const getNewsletterDetails = async (
  newsletterId: string
): Promise<Newsletter> => {
  console.debug('Getting newsletter details', { newsletterId })
  const input: GetItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Key: {
      newsletterId: { S: newsletterId },
      sk: { S: 'newsletter' }
    }
  }
  const command = new GetItemCommand(input)
  const response = await dynamodb.send(command)
  console.debug('Newsletter details', { response })
  if (response.Item === undefined) {
    console.debug('No newsletter found')
    throw new Error('No newsletter found')
  }
  const newsletterItem = unmarshall(response.Item) as Newsletter
  return { ...newsletterItem, __typename: 'Newsletter' }
}

const getArticlesForDataFeeds = async (
  dataFeedIds: string[],
  numberOfDaysToInclude: number
): Promise<ArticleData[]> => {
  logger.debug('Getting articles for subscriptions')
  const articlesData: ArticleData[] = []
  const calculatedDate = new Date(
    Date.now() - numberOfDaysToInclude * 24 * 60 * 60 * 1000
  ).toISOString()
  console.debug('Articles included starting after date ' + calculatedDate)
  for (const dataFeedId of dataFeedIds) {
    const input: QueryCommandInput = {
      TableName: DATA_FEED_TABLE,
      IndexName: DATA_FEED_TABLE_LSI,
      KeyConditionExpression:
        '#dataFeedId = :dataFeedId and #createdAt > :startDate',
      FilterExpression: 'begins_with(#type,:type)',
      ExpressionAttributeNames: {
        '#dataFeedId': 'dataFeedId',
        '#createdAt': 'createdAt',
        '#type': 'sk'
      },
      ExpressionAttributeValues: {
        ':dataFeedId': { S: dataFeedId },
        ':startDate': { S: calculatedDate },
        ':type': { S: 'article' }
      }
    }
    const command = new QueryCommand(input)
    const result = await dynamodb.send(command)
    if (result.Items !== undefined) {
      for (const item of result.Items) {
        try {
          if (
            item.title.S !== undefined &&
            item.url.S !== undefined &&
            item.longSummary !== undefined &&
            item.shortSummary !== undefined &&
            item.createdAt.S !== undefined
          ) {
            metrics.addMetric('ArticlesFound', MetricUnits.Count, 1)
            const content = new MultiSizeFormattedResponse({
              shortSummary: item.shortSummary.S,
              longSummary: item.longSummary.S,
              keywords: item.keywords.S
            })
            if (content === undefined) {
              logger.warn('Item does not contain content', item)
              continue
            }
            articlesData.push({
              title: item.title.S,
              url: item.url.S,
              content,
              createdAt: item.createdAt.S,
              flagLink: `/feeds/${dataFeedId}?flagArticle=true&articleId=${item.sk.S?.substring(8)}`
            })
          } else {
            logger.warn(
              'Item does not contain title, url, articleSummary or createdAt',
              item
            )
          }
        } catch (e) {
          logger.error('Error slurpping article', { e })
        }
      }
    } else {
      logger.warn('Result does not contain items', { result })
    }
  }
  console.debug('Articles found', articlesData)
  return articlesData
}

const generateNewsletterSummary = async (
  articles: ArticleData[],
  newsletterIntroPrompt?: string
): Promise<MultiSizeFormattedResponse> => {
  console.debug('Generating newsletter summary')
  tracer.putAnnotation('Newsletter has summary prompt', true)
  const summaryBuilder = new NewsletterSummaryBuilder(
    articles,
    newsletterIntroPrompt
  )
  const prompt = summaryBuilder.getCompiledPrompt()
  console.debug('Prompt generated', { prompt })
  const response = await anthropic.messages.create({
    model: BEDROCK_MODEL_ID,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  })
  logger.debug('GenAI Output', { response })
  const formattedResponse = summaryBuilder.getProcessedResponse(response.content.map(item => item.text).join('\n'))
  logger.debug('Formatted response from Model:', { formattedResponse })
  if (
    formattedResponse.error.response === null &&
    formattedResponse.longSummary.response === null
  ) {
    console.error('Error generating summary', { formattedResponse })
    throw new Error('Error generating summary')
  }
  return formattedResponse
}

const generateEmail = async (
  articles: ArticleData[],
  newsletterSummary: MultiSizeFormattedResponse,
  title: string,
  newsletterId: string,
  articleSummaryType: ArticleSummaryType,
  newsletterStyle?: NewsletterStyle
): Promise<GeneratedEmailContents> => {
  console.debug('Starting email generation')
  const html = render(
    NewsletterEmail({
      articles,
      newsletterId,
      title,
      newsletterSummary,
      appHostName: APP_HOST_NAME,
      articleSummaryType,
      styleProps: newsletterStyle
    })
  )
  metrics.addMetric('HTMLEmailsGenerated', MetricUnits.Count, 1)
  console.debug('HTML email generated', { html })
  console.debug('Starting plantext email generation')
  const text = render(
    NewsletterEmail({
      title,
      newsletterId,
      articles,
      newsletterSummary,
      appHostName: APP_HOST_NAME,
      articleSummaryType
    }),
    {
      plainText: true
    }
  )
  metrics.addMetric('TextEmailsGenerated', MetricUnits.Count, 1)
  console.debug('Plaintext email generated', { text })
  return { html, text }
}

const storeEmailInS3 = async (
  email: GeneratedEmailContents,
  date: Date,
  emailId: string
): Promise<string> => {
  logger.debug('Storing email in S3 Email Bucket')
  const year = date.getUTCFullYear()
  const month: string =
    (date.getUTCMonth() + 1).toString().length < 2
      ? '0' + (date.getUTCMonth() + 1).toString()
      : (date.getUTCMonth() + 1).toString()
  const day =
    date.getUTCDate() < 10 ? '0' + date.getUTCDate() : date.getUTCDate()
  const emailKey = `newsletter-content/${year}/${month}/${day}/${emailId}`
  logger.debug('Email Key', { emailKey })
  const htmlUpload = new Upload({
    client: s3,
    params: {
      Bucket: EMAIL_BUCKET,
      Key: `${emailKey}.html`,
      Body: Buffer.from(email.html),
      ContentType: 'text/html'
    }
  })
  const textUpload = new Upload({
    client: s3,
    params: {
      Bucket: EMAIL_BUCKET,
      Key: `${emailKey}.txt`,
      Body: Buffer.from(email.text),
      ContentType: 'text/plain'
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
  return emailKey
}

const recordEmailDetails = async (
  newsletterId: string,
  emailId: string,
  date: Date,
  emailKey: string,
  accountId: string
): Promise<void> => {
  console.debug('Recording email details')
  const input: PutItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Item: {
      newsletterId: { S: newsletterId },
      sk: {
        S: 'publication#' + emailId
      },
      createdAt: {
        S: date.toISOString()
      },
      emailKey: {
        S: emailKey
      },
      accountId: {
        S: accountId
      }
    }
  }
  const command = new PutItemCommand(input)
  await dynamodb.send(command)
}

const sendNewsletter = async (
  newsletterId: string,
  emailId: string,
  emailKey: string
): Promise<void> => {
  console.debug('Sending Newsletter')
  const command = new InvokeCommand({
    FunctionName: NEWSLETTER_CAMPAIGN_CREATOR_FUNCTION,
    Payload: JSON.stringify({
      newsletterId,
      emailId,
      emailKey
    })
  })
  logger.debug('Sending newsletter campaign', { command })
  const { Payload, LogResult, FunctionError } = await lambda.send(command)
  if (FunctionError !== undefined) {
    logger.error('Error creating email campaign', {
      FunctionError,
      LogResult,
      Payload
    })
    metrics.addMetric('EmailCampaignCreationFailed', MetricUnits.Count, 1)
    throw new Error(FunctionError)
  } else {
    logger.debug('Email campaign created', { Payload })
    metrics.addMetric('EmailCampaignCreated', MetricUnits.Count, 1)
  }
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
