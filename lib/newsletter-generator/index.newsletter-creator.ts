import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { DynamoDBClient, PutItemCommand, type PutItemCommandInput } from '@aws-sdk/client-dynamodb'
import middy from '@middy/core'
import { v4 as uuidv4 } from 'uuid'
import { marshall } from '@aws-sdk/util-dynamodb'
import { type CreateScheduleCommandInput, SchedulerClient, CreateScheduleCommand } from '@aws-sdk/client-scheduler'

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

interface NewsletterCreatorInput {
  newsletterTitle: string
  subscriptionIds: string[]
  numberOfDaysToInclude: number
  scheduleCronExpression: string
}

const lambdaHandler = async (event: NewsletterCreatorInput): Promise<void> => {
  logger.debug('Starting newsletter creator', { event })
  const newsletterId = uuidv4()
  const scheduleId = await createNewsletterSchedule(newsletterId, event.scheduleCronExpression)
  await storeNewsletterData(newsletterId, event.newsletterTitle, event.subscriptionIds, event.numberOfDaysToInclude, scheduleId)
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

const storeNewsletterData = async (newsletterId: string, newsletterTitle: string, subscriptionIds: string[], numberOfDaysToInclude: number, scheduleId: string): Promise<void> => {
  logger.debug('Storing newsletter data', {
    newsletterId,
    compoundSortKey: 'newsletter#' + newsletterId,
    newsletterTitle,
    subscriptionIds,
    numberOfDaysToInclude,
    scheduleId
  })
  const input: PutItemCommandInput = {
    TableName: NEWSLETTER_DATA_TABLE,
    Item: marshall({
      newsletterId,
      compoundSortKey: 'newsletter#' + newsletterId,
      newsletterTitle,
      subscriptionIds,
      numberOfDaysToInclude,
      scheduleId
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
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
