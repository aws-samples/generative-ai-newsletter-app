import { type Context, util, type DynamoDBUpdateItemRequest } from '@aws-appsync/utils'
import { type UpdateNewsletterInput } from '@shared/api/API'

export function request (ctx: Context): DynamoDBUpdateItemRequest {
  const { newsletterId } = ctx.args
  const input: UpdateNewsletterInput = ctx.args.input
  let expression = 'SET '
  const expressionNames: Record<string, string> = {}
  const expressionValues: Record<string, string | number | object | string[] | boolean> = {}
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
    expressionValues[':numberOfDaysToInclude'] = util.dynamodb.toDynamoDB(input.numberOfDaysToInclude)
    updates = updates + 1
  }
  if (input.subscriptionIds != null) {
    expression += '#subscriptionIds = :subscriptionIds, '
    expressionNames['#subscriptionIds'] = 'subscriptionIds'
    expressionValues[':subscriptionIds'] = util.dynamodb.toDynamoDB(input.subscriptionIds)
    updates = updates + 1
  }
  if (input.shared ?? false) {
    expression += '#shared = :shared, '
    expressionNames['#shared'] = 'shared'
    expressionValues[':shared'] = util.dynamodb.toDynamoDB(input.shared ?? false)
    updates = updates + 1
  }
  if (input.discoverable ?? false) {
    expression += '#discoverable = :discoverable, '
    expressionNames['#discoverable'] = 'discoverable'
    expressionValues[':discoverable'] = util.dynamodb.toDynamoDB(input.discoverable ?? false)
    updates = updates + 1
  }
  if (input.newsletterIntroPrompt != null) {
    expression += '#newsletterIntroPrompt = :newsletterIntroPrompt, '
    expressionNames['#newsletterIntroPrompt'] = 'newsletterIntroPrompt'
    expressionValues[':newsletterIntroPrompt'] = util.dynamodb.toDynamoDB(input.newsletterIntroPrompt)
    updates = updates + 1
  }
  if (input.newsletterStyle != null) {
    expression += '#newsletterStyle = :newsletterStyle, '
    expressionNames['#newsletterStyle'] = 'newsletterStyle'
    expressionValues[':newsletterStyle'] = util.dynamodb.toDynamoDB(input.newsletterStyle)
    updates = updates + 1
  }
  if (updates > 0) {
    return {
      operation: 'UpdateItem',
      key: {
        newsletterId: util.dynamodb.toDynamoDB(newsletterId),
        compoundSortKey: util.dynamodb.toDynamoDB('newsletter')
      },
      update: {
        expression: expression.trim().replace(',+$', ''),
        expressionNames,
        expressionValues
      }
    }
  }
  util.error(`No updates to perform for newsletter ${newsletterId}`)
}

export function response (ctx: Context): unknown {
  const { error, result } = ctx
  if (error !== undefined && error !== null) {
    util.appendError(error.message, error.type)
    return result
  } else {
    return true
  }
}
