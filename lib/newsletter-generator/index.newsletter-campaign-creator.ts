/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import middy from '@middy/core'
import {
  DynamoDBClient,
  type GetItemCommandInput,
  GetItemCommand,
  type UpdateItemCommandInput,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb'
import {
  CreateCampaignCommand,
  PinpointClient,
  type CreateCampaignCommandInput,
  type CreateEmailTemplateCommandInput,
  CreateEmailTemplateCommand,
  BadRequestException,
  type UpdateEmailTemplateCommandInput,
  UpdateEmailTemplateCommand
} from '@aws-sdk/client-pinpoint'
import {
  GetObjectCommand,
  type GetObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'

const SERVICE_NAME = 'newsletter-campaign-creator'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())
const s3 = tracer.captureAWSv3Client(new S3Client())
const pinpoint = tracer.captureAWSv3Client(new PinpointClient())

const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID
const PINPOINT_CAMPAIGN_HOOK_FUNCTION =
  process.env.PINPOINT_CAMPAIGN_HOOK_FUNCTION
const PINPOINT_BASE_SEGMENT_ID = process.env.PINPOINT_BASE_SEGMENT_ID
const EMAIL_BUCKET = process.env.EMAIL_BUCKET

interface NewsletterCampaignCreatorInput {
  newsletterId: string
  emailId: string
  emailKey?: string
}

const lambdaHandler = async (
  event: NewsletterCampaignCreatorInput
): Promise<void> => {
  logger.debug('Starting newsletter campaign creator', { event })
  const { newsletterId, emailId, emailKey } = event
  const { title } = await getNewsletterDetails(newsletterId)
  const { html, text } =
    emailKey !== undefined
      ? await getEmailBodiesFromS3(emailKey)
      : await getEmailBodiesFromS3(await getEmailKey(newsletterId, emailId))
  await createEmailTemplate(emailId, html, text, title)
  const campaignId = await createEmailCampaign(emailId, title)
  await saveCampaignId(newsletterId, emailId, campaignId)
}

const getEmailKey = async (
  newsletterId: string,
  emailId: string
): Promise<string> => {
  logger.debug('Getting email details')
  const input: GetItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Key: {
      newsletterId: { S: newsletterId },
      sk: { S: 'publication#' + emailId }
    }
  }
  const command = new GetItemCommand(input)
  const response = await dynamodb.send(command)
  console.debug('Newsletter Details Repsponse', { response })
  if (response.Item?.emailKey?.S !== undefined) {
    return response.Item?.emailKey?.S
  } else {
    logger.error('Email details not found', { response })
    throw new Error('Email details not found')
  }
}

const getNewsletterDetails = async (
  newsletterId: string
): Promise<{ title: string }> => {
  logger.debug('Getting Newsletter Details', { newsletterId })
  const input: GetItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Key: {
      newsletterId: { S: newsletterId },
      sk: { S: 'newsletter' }
    }
  }
  const command = new GetItemCommand(input)
  const response = await dynamodb.send(command)
  if (response.Item?.title?.S !== undefined) {
    logger.debug('Newsletter details found', { response })
    return { title: response.Item.title.S }
  } else {
    logger.error('Newsletter details not found', { response })
    throw new Error('Newsletter details not found')
  }
}

const getEmailBodiesFromS3 = async (
  emailKey: string
): Promise<{ html: string, text: string }> => {
  logger.debug('Getting email bodies from S3', { emailKey })
  try {
    const htmlInput: GetObjectCommandInput = {
      Bucket: EMAIL_BUCKET,
      Key: `${emailKey}.html`
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
      Key: `${emailKey}.txt`
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

const createEmailTemplate = async (
  emailId: string,
  html: string,
  text: string,
  title: string
): Promise<void> => {
  logger.debug('Creating email template', { emailId })
  try {
    const input: CreateEmailTemplateCommandInput = {
      EmailTemplateRequest: {
        HtmlPart: html,
        TextPart: text,
        Subject: title
      },
      TemplateName: emailId
    }
    const command = new CreateEmailTemplateCommand(input)
    const response = await pinpoint.send(command)
    if (response.CreateTemplateMessageBody?.Arn !== undefined) {
      logger.debug('Email template created', { response })
      metrics.addMetric('EmailTemplateCreated', MetricUnits.Count, 1)
    } else {
      throw new Error('Email template not created')
    }
  } catch (error) {
    logger.error('Error creating email template', { error })
    if (error instanceof BadRequestException && error.message.includes('Pinpoint Template already exists')) {
      logger.warn('Pinpoint Email Template Already Exists!', { error })
      logger.info('Attempting to create a new template version')
      const input: UpdateEmailTemplateCommandInput = {
        CreateNewVersion: false,
        EmailTemplateRequest: {
          HtmlPart: html,
          TextPart: text,
          Subject: title
        },
        TemplateName: emailId
      }
      const command = new UpdateEmailTemplateCommand(input)
      await pinpoint.send(command)
    } else {
      logger.error('Error!', { error })
    }
  }
}

const createEmailCampaign = async (
  emailId: string,
  newsletterTitle: string
): Promise<string> => {
  logger.debug('Creating email campaign', { emailId })
  const input: CreateCampaignCommandInput = {
    ApplicationId: PINPOINT_APP_ID,
    WriteCampaignRequest: {
      TemplateConfiguration: {
        EmailTemplate: {
          Name: emailId
        }
      },
      Hook: {
        LambdaFunctionName: PINPOINT_CAMPAIGN_HOOK_FUNCTION,
        Mode: 'FILTER'
      },
      Name: emailId,
      SegmentId: PINPOINT_BASE_SEGMENT_ID,
      Schedule: {
        StartTime: 'IMMEDIATE',
        Frequency: 'ONCE'
      }
    }
  }
  logger.debug('CreateCampaignCommandInput', { input })
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

const saveCampaignId = async (
  newsletterId: string,
  emailId: string,
  campaignId: string
): Promise<void> => {
  logger.debug('Saving campaign ID', { newsletterId, emailId, campaignId })
  const input: UpdateItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Key: {
      newsletterId: { S: newsletterId },
      sk: { S: 'publication#' + emailId }
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
