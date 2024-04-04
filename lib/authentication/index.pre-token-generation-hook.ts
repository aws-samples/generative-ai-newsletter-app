/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { v4 as uuidv4 } from 'uuid'
import middy from '@middy/core'
import { type PreTokenGenerationAuthenticationTriggerEvent } from 'aws-lambda'
import { DynamoDBClient, type PutItemCommandInput, PutItemCommand, DynamoDBServiceException, type ScanCommandInput, ScanCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { AdminUpdateUserAttributesCommand, CognitoIdentityProviderClient, type AdminUpdateUserAttributesCommandInput } from '@aws-sdk/client-cognito-identity-provider'

const SERVICE_NAME = 'post-authentication-hook'
const ACCOUNT_TABLE = process.env.ACCOUNT_TABLE

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(new DynamoDBClient())
const cognito = tracer.captureAWSv3Client(new CognitoIdentityProviderClient())

const lambdaHandler = async (event: PreTokenGenerationAuthenticationTriggerEvent): Promise<PreTokenGenerationAuthenticationTriggerEvent> => {
  logger.debug('PostAuthenticationEventTriggered', { event })
  metrics.addMetric('PostAuthenticationEventTriggered', MetricUnits.Count, 1)
  const { userAttributes } = event.request
  if (userAttributes['custom:Account'] === undefined || userAttributes['custom:Account'] === null || userAttributes['custom:Account'].length < 1) {
    logger.debug('No Account ID found for user! Creating a new one', { event })
    metrics.addMetric('NewAccountCreated', MetricUnits.Count, 1)
    const userId = userAttributes.sub
    let accountId = uuidv4()
    try {
      const input: PutItemCommandInput = {
        Item: marshall({
          accountId,
          userId
        }),
        ConditionExpression: 'attribute_not_exists(accountId)',
        TableName: ACCOUNT_TABLE
      }
      const command = new PutItemCommand(input)
      await dynamodb.send(command)
      event.response.claimsOverrideDetails.claimsToAddOrOverride = { 'custom:Account': accountId }
      console.log(accountId)
    } catch (error) {
      if (error instanceof DynamoDBServiceException) {
        if (error.name === 'ConditionalCheckFailedException') {
          logger.debug('Account already exists for user', { event })
          metrics.addMetric('AccountAlreadyExists', MetricUnits.Count, 1)
          const scanInput: ScanCommandInput = {
            TableName: ACCOUNT_TABLE,
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': { S: userId }
            }
          }
          const command = new ScanCommand(scanInput)
          const result = await dynamodb.send(command)
          if (result.Items === undefined || result.Items.length !== 1 || result.Items[0].accountId.S === undefined) {
            throw new Error('Account already exists for user but not found in database')
          }
          accountId = result.Items[0].accountId.S
        }
      }
    }
    try {
      const input: AdminUpdateUserAttributesCommandInput = {
        UserPoolId: event.userPoolId,
        Username: event.userName,
        UserAttributes: [
          {
            Name: 'custom:Account',
            Value: accountId
          }
        ]
      }
      const command = new AdminUpdateUserAttributesCommand(input)
      await cognito.send(command)
    } catch (e) {
      logger.error('Error updating user attributes', { e })
    }
  }
  return event
}

export const handler = middy(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
