import {
  AuthorizationType,
  Definition,
  FieldLogLevel,
  GraphqlApi
} from 'aws-cdk-lib/aws-appsync'
import { Construct } from 'constructs'
import path = require('path')
import { ApiResolvers } from './resolvers'
import { type ITable, type Table } from 'aws-cdk-lib/aws-dynamodb'
import { type NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Stack } from 'aws-cdk-lib'
import { type CfnPolicyStore } from 'aws-cdk-lib/aws-verifiedpermissions'
import { UserPool } from 'aws-cdk-lib/aws-cognito'
import { type Bucket } from 'aws-cdk-lib/aws-s3'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'

export interface ApiProps {
  userPoolId: string
  dataFeedTable: Table
  newsletterTable: Table
  newsletterTableItemTypeGSI: string
  accountTable: ITable
  accountTableUserIndex: string
  avpPolicyStore: CfnPolicyStore
  loggingBucket: Bucket
  functions: {
    readActionAuthCheckFunction: NodejsFunction
    createActionAuthCheckFunction: NodejsFunction
    listAuthFilterFunction: NodejsFunction
    updateActionAuthCheckFunction: NodejsFunction
    createNewsletterFunction: NodejsFunction
    userSubscriberFunction: NodejsFunction
    userUnsubscriberFunction: NodejsFunction
    feedSubscriberFunction: NodejsFunction
    getNewsletterFunction: NodejsFunction
  }
}

export class API extends Construct {
  public readonly graphqlApiUrl: string
  constructor (scope: Construct, id: string, props: ApiProps) {
    super(scope, id)

    const graphqlApi = new GraphqlApi(this, 'API', {
      name: Stack.of(this).stackName + 'GraphQLAPI',
      definition: Definition.fromFile(
        path.join(__dirname, '..', 'shared', 'api', 'schema.graphql')
      ),
      authorizationConfig: {
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool: UserPool.fromUserPoolId(this, 'UserPool', props.userPoolId)
            }
          }
        ]
      },
      environmentVariables: {
        DATA_FEED_TABLE: props.dataFeedTable.tableName,
        NEWSLETTER_TABLE: props.newsletterTable.tableName,
        NEWSLETTER_TABLE_ITEM_TYPE_GSI: props.newsletterTableItemTypeGSI,
        ACCOUNT_TABLE: props.accountTable.tableName
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
        retention: RetentionDays.INFINITE
      },
      xrayEnabled: true
    })

    new ApiResolvers(this, 'ApiResolvers', {
      api: graphqlApi,
      ...props
    })
    this.graphqlApiUrl = graphqlApi.graphqlUrl
  }
}
