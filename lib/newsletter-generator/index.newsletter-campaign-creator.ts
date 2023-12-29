import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import { DynamoDBClient, type GetItemCommandInput, GetItemCommand, type UpdateItemCommandInput, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { CreateCampaignCommand, PinpointClient, type CreateCampaignCommandInput } from '@aws-sdk/client-pinpoint'
import { GetObjectCommand, type GetObjectCommandInput, S3Client } from '@aws-sdk/client-s3'

const SERVICE_NAME = 'newsletter-campaign-creator'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())
const s3 = tracer.captureAWSv3Client(new S3Client())
const pinpoint = tracer.captureAWSv3Client(new PinpointClient())

const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID
const PINPOINT_CAMPAIGN_HOOK_FUNCTION = process.env.PINPOINT_CAMPAIGN_HOOK_FUNCTION
const PINPOINT_BASE_SEGMENT_ID = process.env.PINPOINT_BASE_SEGMENT_ID
const EMAIL_BUCKET = process.env.EMAIL_BUCKET

interface NewsletterCampaignCreatorInput {
  newsletterId: string
  emailId: string
}

const lambdaHandler = async (event: NewsletterCampaignCreatorInput): Promise<void> => {
  logger.debug('Starting newsletter campaign creator', { event })
  const s3Prefix = await getEmailContentsPath(event.newsletterId, event.emailId)
  const { newsletterTitle } = await getNewsletterDetails(event.newsletterId)
  const { html, text } = await getEmailBodiesFromS3(s3Prefix, event.emailId)
  const campaignId = await createEmailCampaign(event.newsletterId, html, text, newsletterTitle)
  await saveCampaignId(event.newsletterId, event.emailId, campaignId)
}

const getEmailContentsPath = async (newsletterId: string, emailId: string): Promise<string> => {
  logger.debug('Getting email details')
  const input: GetItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Key: {
      newsletterId: { S: newsletterId },
      compoundSortKey: { S: 'email#' + emailId }
    }
  }
  const command = new GetItemCommand(input)
  const response = await dynamodb.send(command)
  console.debug('Newsletter Details Repsponse', { response })
  if (response.Item?.createdAt?.S !== undefined) {
    logger.debug('Email details found', { response })
    const date = new Date(response.Item.createdAt.S)
    const prefix = `NEWSLETTERS/${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}`
    return prefix
  } else {
    logger.error('Email details not found', { response })
    throw new Error('Email details not found')
  }
}

const getNewsletterDetails = async (newsletterId: string): Promise<{ newsletterTitle: string }> => {
  logger.debug('Getting Newsletter Details', { newsletterId })
  const input: GetItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Key: {
      newsletterId: { S: newsletterId },
      compoundSortKey: { S: 'newsletter#' + newsletterId }
    }
  }
  const command = new GetItemCommand(input)
  const response = await dynamodb.send(command)
  if (response.Item?.newsletterTitle?.S !== undefined) {
    logger.debug('Newsletter details found', { response })
    return { newsletterTitle: response.Item.newsletterTitle.S }
  } else {
    logger.error('Newsletter details not found', { response })
    throw new Error('Newsletter details not found')
  }
}

const getEmailBodiesFromS3 = async (emailContentsPath: string, emailId: string): Promise<{ html: string, text: string }> => {
  logger.debug('Getting email bodies from S3', { emailContentsPath, emailId })
  try {
    const htmlInput: GetObjectCommandInput = {
      Bucket: EMAIL_BUCKET,
      Key: `${emailContentsPath}/${emailId}.html`
    }
    const htmlCommand = new GetObjectCommand(htmlInput)
    const htmlResponse = await s3.send(htmlCommand)
    const html = await htmlResponse.Body?.transformToString()
    if (html === undefined) {
      throw new Error('HTML body not found')
    }
    logger.debug('HTML body retrieved')
    const textInput: GetObjectCommandInput = {
      Bucket: EMAIL_BUCKET,
      Key: `${emailContentsPath}/${emailId}.txt`
    }
    const textCommand = new GetObjectCommand(textInput)
    const textResponse = await s3.send(textCommand)
    const text = await textResponse.Body?.transformToString()
    if (text === undefined) {
      throw new Error('Text body not found')
    }
    logger.debug('Text body retrieved')
    return { html, text }
  } catch (error) {
    logger.error('Error getting email bodies from S3', { error })
    tracer.addErrorAsMetadata(error as Error)
    throw error
  }
}

const createEmailCampaign = async (emailId: string, html: string, text: string, newsletterTitle: string): Promise<string> => {
  logger.debug('Creating email campaign', { emailId })
  const input: CreateCampaignCommandInput = {
    ApplicationId: PINPOINT_APP_ID,
    WriteCampaignRequest: {
      Hook: {
        LambdaFunctionName: PINPOINT_CAMPAIGN_HOOK_FUNCTION,
        Mode: 'FILTER'
      },
      Name: emailId,
      SegmentId: PINPOINT_BASE_SEGMENT_ID,
      MessageConfiguration: {
        EmailMessage: {
          Title: newsletterTitle,
          Body: text,
          HtmlBody: html
        }
      },
      Schedule: {
        StartTime: 'IMMEDIATE',
        Frequency: 'ONCE'
      }
    }
  }
  const command = new CreateCampaignCommand(input)
  const response = await pinpoint.send(command)
  if (response.CampaignResponse?.Id !== undefined) {
    logger.debug('Email campaign created', { response })
    metrics.addMetric('EmailCampaignCreated', MetricUnits.Count, 1)
    return response.CampaignResponse.Id
  } else {
    logger.error('Email campaign not created', { response })
    tracer.addErrorAsMetadata(new Error('Email campaign not created'))
    metrics.addMetric('EmailCampaignNotCreated', MetricUnits.Count, 1)
    throw new Error('Email campaign not created')
  }
}

const saveCampaignId = async (newsletterId: string, emailId: string, campaignId: string): Promise<void> => {
  logger.debug('Saving campaign ID', { newsletterId, emailId, campaignId })
  const input: UpdateItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Key: {
      newsletterId: { S: newsletterId },
      compoundSortKey: { S: 'email#' + emailId }
    },
    UpdateExpression: 'SET #campaignId = :campaignId',
    ExpressionAttributeNames: {
      '#campaignId': 'campaignId'
    },
    ExpressionAttributeValues: {
      ':campaignId': { S: campaignId }
    }
  }
  const command = new UpdateItemCommand(input)
  await dynamodb.send(command)
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
