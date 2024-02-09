import { AuthorizationType, Definition, FieldLogLevel, GraphqlApi } from 'aws-cdk-lib/aws-appsync'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'
import path = require('path')
import { ApiResolvers } from './resolvers'
import { type Table } from 'aws-cdk-lib/aws-dynamodb'
import { UserPool } from 'aws-cdk-lib/aws-cognito'
import { type NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { type Bucket } from 'aws-cdk-lib/aws-s3'
import { Stack } from 'aws-cdk-lib'

export interface ApiProps {
  userPoolId: string
  newsSubscriptionTable: Table
  newsletterTable: Table
  emailBucket: Bucket
  functions: {
    createNewsletterFunction: NodejsFunction
    userSubscriberFunction: NodejsFunction
    userUnsubscriberFunction: NodejsFunction
    feedSubscriberFunction: NodejsFunction
    getNewsletterFunction: NodejsFunction
  }
}

export class API extends Construct {
  public readonly graphqlApiUrl: string
  public readonly graphqlApiKey: string | undefined
  constructor (scope: Construct, id: string, props: ApiProps) {
    super(scope, id)

    const graphqlApi = new GraphqlApi(this, 'API', {
      name: Stack.of(this).stackName + 'GraphQLAPI',
      definition: Definition.fromFile(path.join(__dirname, '../shared/api', 'schema.graphql')),
      authorizationConfig: {
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool: UserPool.fromUserPoolId(this, 'AuthUserPool', props.userPoolId)
            }
          }
        ]
      },
      logConfig: {
        retention: RetentionDays.ONE_MONTH,
        fieldLogLevel: FieldLogLevel.ALL
      },
      xrayEnabled: true
    })

    new ApiResolvers(this, 'ApiResolvers', {
      api: graphqlApi,
      ...props
    })

    this.graphqlApiUrl = graphqlApi.graphqlUrl
    this.graphqlApiKey = graphqlApi.apiKey
  }
}
