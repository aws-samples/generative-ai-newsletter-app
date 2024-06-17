/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { Logger } from '@aws-lambda-powertools/logger'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import middy from '@middy/core'
import {
  DynamoDBClient,
  type GetItemCommandInput,
  QueryCommand,
  type QueryCommandInput,
  GetItemCommand
} from '@aws-sdk/client-dynamodb'
import {
  type EndpointBatchItem,
  type MessageConfiguration
} from '@aws-sdk/client-pinpoint'
import { SubscriberType } from '../shared/common'

const SERVICE_NAME = 'pinpoint-campaign-hook'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })

const NEWSLETTER_DATA_TABLE = process.env.NEWSLETTER_DATA_TABLE
const NEWSLETTER_DATA_TABLE_CAMPAIGN_GSI =
  process.env.NEWSLETTER_DATA_TABLE_CAMPAIGN_GSI
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())

// Interface derviced from documentation: https://docs.aws.amazon.com/pinpoint/latest/developerguide/segments-dynamic.html#segments-dynamic-payload
interface PinpointCampaignHookInput {
  MessageConfiguration: MessageConfiguration
  ApplicationId: string
  CampaignId: string
  TreatmentId?: string
  ActivityId?: string
  ScheduleTime?: string
  Endpoints: Record<string, EndpointBatchItem>
}

const lambdaHandler = async (
  event: PinpointCampaignHookInput
): Promise<any> => {
  logger.debug('Filter event called.', { event })
  const newsletterId = await getNewsletterForCampaign(event.CampaignId)
  if (
    event?.ApplicationId === PINPOINT_APP_ID &&
    event.CampaignId !== undefined &&
    event.Endpoints !== undefined
  ) {
    const subscribedEndpoints: Record<string, EndpointBatchItem> = {}
    for (const [endpointId, endpointData] of Object.entries(event.Endpoints)) {
      if (
        await isUserSubcribed(
          newsletterId,
          endpointId,
          (endpointData.Attributes?.SubscriberType.toString() as SubscriberType) ??
            SubscriberType.COGNITO_SUBSCRIBER
        )
      ) {
        subscribedEndpoints[endpointId] = endpointData
      }
    }
    logger.debug('Subscribed endpoints in batch', {
      subscribedEndpoints,
      totalEndpointsProvided: event.Endpoints.length
    })
    return subscribedEndpoints
  } else {
    return event.Endpoints
  }
}

const getNewsletterForCampaign = async (
  campaignId: string
): Promise<string> => {
  logger.debug('Getting newsletter for campaign', { campaignId })
  const input: QueryCommandInput = {
    TableName: NEWSLETTER_DATA_TABLE,
    IndexName: NEWSLETTER_DATA_TABLE_CAMPAIGN_GSI,
    KeyConditionExpression:
      '#campaignId = :campaignId AND begins_with(#sk,:sk)',
    ExpressionAttributeNames: {
      '#campaignId': 'campaignId',
      '#sk': 'sk'
    },
    ExpressionAttributeValues: {
      ':campaignId': { S: campaignId },
      ':sk': { S: 'publication#' }
    }
  }
  const command = new QueryCommand(input)
  const response = await dynamodb.send(command)
  if (
    response.Items?.length === 1 &&
    response.Items[0].newsletterId.S !== undefined
  ) {
    logger.debug('Newsletter found', {
      newsletterId: response.Items[0].newsletterId.S
    })
    return response.Items[0].newsletterId.S
  } else if (response.Items?.length === 0) {
    logger.error('No newsletter found for campaign', { campaignId })
    throw new Error('No newsletter found for campaign')
  } else {
    logger.error('Multiple newsletters found for campaign', { campaignId })
    throw new Error('Multiple newsletters found for campaign')
  }
}

const isUserSubcribed = async (
  newsletterId: string,
  userId: string,
  subscriberType: SubscriberType
): Promise<boolean> => {
  logger.debug('Checking if user is subscribed', {
    campaignId: newsletterId,
    userId,
    subscriberType
  })
  const sk =
    subscriberType === SubscriberType.COGNITO_SUBSCRIBER
      ? 'subscriber#' + userId
      : 'subscriber-external#' + userId
  const input: GetItemCommandInput = {
    TableName: NEWSLETTER_DATA_TABLE,
    Key: {
      newsletterId: { S: newsletterId },
      sk: { S: sk }
    }
  }
  const command = new GetItemCommand(input)
  const response = await dynamodb.send(command)
  logger.debug('User subscribed', { subscribed: response.Item !== undefined })
  return response.Item !== undefined
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
