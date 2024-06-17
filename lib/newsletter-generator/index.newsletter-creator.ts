/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { Logger } from '@aws-lambda-powertools/logger'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import {
  DynamoDBClient,
  PutItemCommand,
  type QueryCommandInput,
  type PutItemCommandInput,
  QueryCommand
} from '@aws-sdk/client-dynamodb'
import middy from '@middy/core'
import { v4 as uuidv4 } from 'uuid'
import { marshall } from '@aws-sdk/util-dynamodb'
import {
  type CreateScheduleCommandInput,
  SchedulerClient,
  CreateScheduleCommand
} from '@aws-sdk/client-scheduler'
import { type CreateNewsletterInput, type Newsletter } from '../shared/api/API'

const SERVICE_NAME = 'newsletter-creator'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())
const scheduler = tracer.captureAWSv3Client(new SchedulerClient())

const NEWSLETTER_DATA_TABLE = process.env.NEWSLETTER_DATA_TABLE
const NEWSLETTER_SCHEDULE_GROUP_NAME =
  process.env.NEWSLETTER_SCHEDULE_GROUP_NAME
const EMAIL_GENERATOR_FUNCTION_ARN = process.env.EMAIL_GENERATOR_FUNCTION_ARN
const EMAIL_GENERATOR_SCHEDULER_ROLE_ARN =
  process.env.EMAIL_GENERATOR_SCHEDULER_ROLE_ARN
const ACCOUNT_TABLE = process.env.ACCOUNT_TABLE
const ACCOUNT_TABLE_USER_INDEX = process.env.ACCOUNT_TABLE_USER_INDEX

interface NewsletterCreatorEvent {
  createdBy: {
    accountId?: string
    userId?: string
  }
  input: CreateNewsletterInput
}

const lambdaHandler = async (
  event: NewsletterCreatorEvent
): Promise<Newsletter> => {
  logger.debug('Starting newsletter creator', { event })
  const input = event.input
  const inputAccountId = event.createdBy.accountId
  const userId = event.createdBy.userId
  let accountId = inputAccountId
  if ((accountId === undefined || accountId === null) && userId !== undefined) {
    accountId = await getAccountIdForUserId(userId)
  }
  if (accountId === undefined) {
    throw new Error("Account ID not found. Can't create newsletter.")
  }
  const newsletterId = uuidv4()
  const scheduleExpression = `rate(${input.numberOfDaysToInclude} ${input.numberOfDaysToInclude === 1 ? 'day' : 'days'})`
  const scheduleId = await createNewsletterSchedule(
    newsletterId,
    scheduleExpression
  )
  const newsletter = await storeNewsletterData(
    newsletterId,
    accountId,
    scheduleId,
    input
  )
  logger.debug('Newsletter created', { newsletterId, newsletter })
  return newsletter
}

const getAccountIdForUserId = async (userId: string): Promise<string> => {
  const input: QueryCommandInput = {
    TableName: ACCOUNT_TABLE,
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId'
    },
    ExpressionAttributeValues: {
      ':userId': { S: userId }
    },
    IndexName: ACCOUNT_TABLE_USER_INDEX
  }
  const command = new QueryCommand(input)
  const response = await dynamodb.send(command)
  if (
    response.Items === undefined ||
    response.Items.length === 0 ||
    response.Items[0].accountId.S === undefined
  ) {
    throw new Error('User not found')
  }
  return response.Items[0].accountId.S
}

const createNewsletterSchedule = async (
  newsletterId: string,
  scheduleExpression: string
): Promise<string> => {
  logger.debug('Creating newsletter schedule')
  const scheduleId = uuidv4()
  const input: CreateScheduleCommandInput = {
    Name: scheduleId,
    FlexibleTimeWindow: { Mode: 'OFF' },
    ScheduleExpression: scheduleExpression,
    GroupName: NEWSLETTER_SCHEDULE_GROUP_NAME,
    Target: {
      Input: JSON.stringify({ newsletterId }),
      Arn: EMAIL_GENERATOR_FUNCTION_ARN,
      RoleArn: EMAIL_GENERATOR_SCHEDULER_ROLE_ARN
    }
  }
  const command = new CreateScheduleCommand(input)
  const response = await scheduler.send(command)
  if (response.ScheduleArn !== undefined) {
    logger.debug('Newsletter schedule created', { response, scheduleId })
    return scheduleId
  } else {
    throw new Error('Schedule creation failed')
  }
}

const storeNewsletterData = async (
  newsletterId: string,
  accountId: string,
  scheduleId: string,
  input: CreateNewsletterInput
): Promise<any> => {
  logger.debug('Storing newsletter data', {
    newsletterId,
    sk: 'newsletter#' + newsletterId,
    input
  })
  const createdAt = new Date().toISOString()
  const {
    title,
    dataFeeds: dataFeedIds,
    numberOfDaysToInclude,
    newsletterIntroPrompt,
    newsletterStyle
  } = input
  const isPrivate: boolean = input.isPrivate ?? true
  const commandInput: PutItemCommandInput = {
    TableName: NEWSLETTER_DATA_TABLE,
    Item: marshall({
      newsletterId,
      sk: 'newsletter',
      title,
      dataFeedIds,
      numberOfDaysToInclude,
      scheduleId,
      isPrivate,
      createdAt,
      accountId,
      newsletterIntroPrompt,
      newsletterStyle: JSON.stringify(newsletterStyle)
    })
  }
  const command = new PutItemCommand(commandInput)
  const response = await dynamodb.send(command)
  if (response.$metadata.httpStatusCode === 200) {
    metrics.addMetric('NewsletterCreated', MetricUnits.Count, 1)
  } else {
    metrics.addMetric('NewsletterCreationFailed', MetricUnits.Count, 1)
    logger.error('Error storing newsletter data', { response })
    throw new Error('Error storing newsletter data')
  }
  return {
    id: newsletterId,
    title,
    dataFeedIds,
    numberOfDaysToInclude,
    scheduleId,
    isPrivate,
    createdAt,
    accountId,
    newsletterIntroPrompt,
    newsletterStyle,
    __typename: 'Newsletter'
  }
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
