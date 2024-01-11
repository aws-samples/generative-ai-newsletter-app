import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { DynamoDBClient, PutItemCommand, type PutItemCommandInput } from '@aws-sdk/client-dynamodb'
import middy from '@middy/core'
import { v4 as uuidv4 } from 'uuid'
import { marshall } from '@aws-sdk/util-dynamodb'
import { type CreateScheduleCommandInput, SchedulerClient, CreateScheduleCommand } from '@aws-sdk/client-scheduler'
import { type CreateNewsletter, type Newsletter } from '../api/API'

const SERVICE_NAME = 'newsletter-creator'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())
const scheduler = tracer.captureAWSv3Client(new SchedulerClient())

const NEWSLETTER_DATA_TABLE = process.env.NEWSLETTER_DATA_TABLE
const NEWSLETTER_SCHEDULE_GROUP_NAME = process.env.NEWSLETTER_SCHEDULE_GROUP_NAME
const EMAIL_GENERATOR_FUNCTION_ARN = process.env.EMAIL_GENERATOR_FUNCTION_ARN
const EMAIL_GENERATOR_SCHEDULER_ROLE_ARN = process.env.EMAIL_GENERATOR_SCHEDULER_ROLE_ARN

const lambdaHandler = async (event: CreateNewsletter): Promise<Newsletter> => {
  logger.debug('Starting newsletter creator', { event })
  const { title, numberOfDaysToInclude, subscriptionIds } = event
  const shared: boolean = event.shared ?? false
  const discoverable: boolean = event.discoverable ?? false
  const newsletterId = uuidv4()
  const scheduleExpression = `rate(${numberOfDaysToInclude} ${numberOfDaysToInclude === 1 ? 'day' : 'days'})`
  const scheduleId = await createNewsletterSchedule(newsletterId, scheduleExpression)
  const newsletter = await storeNewsletterData(newsletterId, title, subscriptionIds, numberOfDaysToInclude, scheduleId, shared, discoverable)
  logger.debug('Newsletter created', { newsletterId })
  return newsletter
}

const createNewsletterSchedule = async (newsletterId: string, scheduleExpression: string): Promise<string> => {
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

const storeNewsletterData = async (newsletterId: string, title: string, subscriptionIds: string[], numberOfDaysToInclude: number, scheduleId: string, shared: boolean, discoverable: boolean): Promise<Newsletter> => {
  logger.debug('Storing newsletter data', {
    newsletterId,
    compoundSortKey: 'newsletter#' + newsletterId,
    title,
    subscriptionIds,
    numberOfDaysToInclude,
    scheduleId,
    shared
  })
  const createdAt = new Date().toISOString()
  const input: PutItemCommandInput = {
    TableName: NEWSLETTER_DATA_TABLE,
    Item: marshall({
      newsletterId,
      compoundSortKey: 'newsletter',
      title,
      subscriptionIds,
      numberOfDaysToInclude,
      scheduleId,
      shared,
      createdAt
    })
  }
  const command = new PutItemCommand(input)
  const response = await dynamodb.send(command)
  if (response.$metadata.httpStatusCode === 200) {
    metrics.addMetric('NewsletterCreated', MetricUnits.Count, 1)
  } else {
    metrics.addMetric('NewsletterCreationFailed', MetricUnits.Count, 1)
    logger.error('Error storing newsletter data', { response })
    throw new Error('Error storing newsletter data')
  }
  return {
    newsletterId,
    title,
    subscriptionIds,
    numberOfDaysToInclude,
    scheduleId,
    shared,
    discoverable,
    createdAt,
    __typename: 'Newsletter'
  }
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
