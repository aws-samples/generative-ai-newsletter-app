import {
  type Context,
  util,
  type DynamoDBUpdateItemRequest
} from '@aws-appsync/utils'
import { type UpdateNewsletterInput } from '../../../../shared/api'

export function request (ctx: Context): DynamoDBUpdateItemRequest {
  const input: UpdateNewsletterInput = ctx.args.input
  let expression = 'SET '
  const expressionNames: Record<string, string> = {}
  const expressionValues: Record<
  string,
  string | number | object | string[] | boolean
  > = {}
  let updates = 0
  if (input.title != null) {
    expression += '#title = :title, '
    expressionNames['#title'] = 'title'
    expressionValues[':title'] = util.dynamodb.toDynamoDB(input.title)
    updates = updates + 1
  }
  if (input.numberOfDaysToInclude != null) {
    expression += '#numberOfDaysToInclude = :numberOfDaysToInclude, '
    expressionNames['#numberOfDaysToInclude'] = 'numberOfDaysToInclude'
    expressionValues[':numberOfDaysToInclude'] = util.dynamodb.toDynamoDB(
      input.numberOfDaysToInclude
    )
    updates = updates + 1
  }
  if (input.dataFeedIds != null) {
    expression += '#dataFeedIds = :dataFeedIds, '
    expressionNames['#dataFeedIds'] = 'dataFeedIds'
    expressionValues[':dataFeedIds'] = util.dynamodb.toDynamoDB(
      input.dataFeedIds
    )
    updates = updates + 1
  }
  if (input.isPrivate !== null) {
    expression += '#isPrivate = :isPrivate, '
    expressionNames['#isPrivate'] = 'isPrivate'
    expressionValues[':isPrivate'] = util.dynamodb.toDynamoDB(
      input.isPrivate ?? true
    )
    updates = updates + 1
  }
  if (input.newsletterIntroPrompt != null) {
    expression += '#newsletterIntroPrompt = :newsletterIntroPrompt, '
    expressionNames['#newsletterIntroPrompt'] = 'newsletterIntroPrompt'
    expressionValues[':newsletterIntroPrompt'] = util.dynamodb.toDynamoDB(
      input.newsletterIntroPrompt
    )
    updates = updates + 1
  }
  if (input.newsletterStyle != null) {
    expression += '#newsletterStyle = :newsletterStyle, '
    expressionNames['#newsletterStyle'] = 'newsletterStyle'
    expressionValues[':newsletterStyle'] = util.dynamodb.toDynamoDB(
      input.newsletterStyle
    )
    updates = updates + 1
  }
  if (input.articleSummaryType != null) {
    expression += '#articleSummaryType = :articleSummaryType, '
    expressionNames['#articleSummaryType'] = 'articleSummaryType'
    expressionValues[':articleSummaryType'] = util.dynamodb.toDynamoDB(
      input.articleSummaryType
    )
    updates = updates + 1
  }
  if (updates > 0) {
    return {
      operation: 'UpdateItem',
      key: {
        newsletterId: util.dynamodb.toDynamoDB(input.newsletterId),
        sk: util.dynamodb.toDynamoDB('newsletter')
      },
      update: {
        expression: expression.trim().replace(',+$', ''),
        expressionNames,
        expressionValues
      }
    }
  }
  util.error(`No updates to perform for newsletter ${input.newsletterId}`)
}

export function response (ctx: Context): unknown {
  const { error } = ctx
  if (error !== undefined && error !== null) {
    util.error(error.message, error.type)
  } else {
    return true
  }
}
