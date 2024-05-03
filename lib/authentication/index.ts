/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Duration, RemovalPolicy, Stack, CfnOutput } from 'aws-cdk-lib'
import {
  type IIdentityPool,
  IdentityPool,
  UserPoolAuthenticationProvider
} from '@aws-cdk/aws-cognito-identitypool-alpha'
import {
  type IUserPool,
  UserPool,
  UserPoolClient,
  StringAttribute,
  type IUserPoolClient,
  ClientAttributes
} from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'
import { Role, type IRole, PolicyStatement, Effect, Policy, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { ApplicationLogLevel, Architecture, LambdaInsightsVersion, LogFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NagSuppressions } from 'cdk-nag'

interface AuthenticationProps {
  userPoolId?: string
  userPoolArn?: string
  userPoolClientId?: string
}

export class Authentication extends Construct {
  public readonly userPool: IUserPool
  private readonly identityPool: IIdentityPool
  private readonly authenticatedUserRole: IRole
  public readonly unauthenticatedUserRole: IRole
  private readonly userPoolClient: IUserPoolClient
  public readonly userPoolId: string
  public readonly userPoolArn: string
  public readonly identityPoolId: string
  public readonly authenticatedUserRoleArn: string
  public readonly unauthenticatedUserRoleArn: string
  public readonly userPoolClientId: string
  public readonly accountTable: Table
  public readonly accountTableUserIndex = 'userId-index'
  constructor (scope: Construct, id: string, props?: AuthenticationProps) {
    super(scope, id)
    const auth = this.node.tryGetContext('authConfig')

    const accountTable = new Table(this, 'AccountTable', {
      tableName: Stack.of(this).stackName + '-AccountTable',
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'accountId',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true
    })
    accountTable.addGlobalSecondaryIndex({
      indexName: this.accountTableUserIndex,
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING
      }
    })
    this.accountTable = accountTable
    const preTokenGenerationHookFunctionRole = new Role(this, 'pre-token-generation-hook-role', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    })
    preTokenGenerationHookFunctionRole.addManagedPolicy(ManagedPolicy.fromManagedPolicyArn(this, 'PreTokenGenRoleLambdaExecution', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'))
    const preTokenGenerationHookFunction = new NodejsFunction(this, 'pre-token-generation-hook', {
      description:
        'Post Authentication, Pre-Token Generation Hook that creates a user\'s accountId',
      handler: 'handler',
      role: preTokenGenerationHookFunctionRole,
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      memorySize: 128,
      timeout: Duration.seconds(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        ACCOUNT_TABLE: accountTable.tableName
      }
    })
    if (auth === undefined || auth === null) {
      const selfSignUpEnabled =
        this.node.tryGetContext('selfSignUpEnabled') ?? false
      const userPool = new UserPool(this, 'UserPool', {
        removalPolicy: RemovalPolicy.DESTROY,
        selfSignUpEnabled,
        signInAliases: {
          email: true
        },
        standardAttributes: {
          email: {
            required: true
          },
          givenName: {
            required: true,
            mutable: true
          },
          familyName: {
            required: true,
            mutable: true
          }
        },
        customAttributes: {
          Account: new StringAttribute()
        },
        lambdaTriggers: {
          postAuthentication: preTokenGenerationHookFunction
        }
      })
      const clientWriteAttributes = new ClientAttributes().withStandardAttributes({
        familyName: true,
        givenName: true,
        email: true
      })
      const clientReadAttributes = clientWriteAttributes.withCustomAttributes('Account')
      const userPoolClient = userPool.addClient('UserPoolClient', {
        generateSecret: false,
        readAttributes: clientReadAttributes,
        writeAttributes: clientWriteAttributes,
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
          userSrp: true
        }
      })
      userPoolClient.node.addDependency(userPool)

      const identityPool = new IdentityPool(this, 'IdentityPool', {
        authenticationProviders: {
          userPools: [
            new UserPoolAuthenticationProvider({
              userPool,
              userPoolClient
            })
          ]
        }
      })
      this.userPool = userPool
      this.identityPool = identityPool
      this.userPoolClient = userPoolClient
      this.authenticatedUserRole = identityPool.authenticatedRole
      this.unauthenticatedUserRole = identityPool.unauthenticatedRole
    } else {
      const userPool = UserPool.fromUserPoolId(
        this,
        'UserPool',
        props?.userPoolId ?? (auth.cognito.userPoolId as string)
      )
      if (
        props?.userPoolClientId === undefined &&
        auth.cognito.userPoolClientId === undefined
      ) {
        const userPoolClient = userPool.addClient('UserPoolClient', {
          generateSecret: false,
          authFlows: {
            adminUserPassword: true,
            userPassword: true,
            userSrp: true
          }
        })

        const identityPool = new IdentityPool(this, 'IdentityPool', {
          authenticationProviders: {
            userPools: [
              new UserPoolAuthenticationProvider({
                userPool,
                userPoolClient
              })
            ]
          }
        })
        this.userPoolClient = userPoolClient
        this.identityPool = identityPool
      } else {
        const userPoolClientId =
          props?.userPoolClientId ?? auth.cognito.userPoolClientId
        this.userPoolClient = UserPoolClient.fromUserPoolClientId(
          this,
          'UserPoolClient',
          userPoolClientId as string
        )
        if (
          auth.cognito.identityPoolId !== undefined &&
          auth.cognito.authenticatedUserArn !== undefined
        ) {
          this.identityPool = IdentityPool.fromIdentityPoolId(
            this,
            'IdentityPool',
            auth.cognito.identityPoolId as string
          )
          this.authenticatedUserRole = Role.fromRoleArn(
            this,
            'AuthenticatedUserRole',
            auth.cognito.authenticatedUserArn as string,
            {
              mutable: true
            }
          )
          this.unauthenticatedUserRole = Role.fromRoleArn(
            this,
            'UnauthenticatedUserRole',
            auth.cognito.unauthenticatedUserArn as string,
            {
              mutable: true
            }
          )
        } else {
          const identityPool = new IdentityPool(this, 'IdentityPool', {
            authenticationProviders: {
              userPools: [
                new UserPoolAuthenticationProvider({
                  userPool,
                  userPoolClient: this.userPoolClient
                })
              ]
            }
          })
          this.identityPool = identityPool
          this.authenticatedUserRole = identityPool.authenticatedRole as Role
          this.unauthenticatedUserRole = identityPool.unauthenticatedRole as Role
        }
      }
      this.userPool = userPool
    }
    preTokenGenerationHookFunctionRole.attachInlinePolicy(new Policy(this, 'pre-token-generation-hook-policy', {
      statements: [
        new PolicyStatement({
          actions: ['dynamodb:PutItem', 'dynamodb:Scan'],
          resources: [
            accountTable.tableArn
          ],
          effect: Effect.ALLOW
        }),
        new PolicyStatement({
          actions: ['cognito-idp:AdminUpdateUserAttributes'],
          resources: [this.userPool.userPoolArn]
        })
      ]
    }))
    preTokenGenerationHookFunctionRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AWSXrayWriteOnlyAccess'))

    new CfnOutput(this, 'UserPoolLink', {
      value: `https://${Stack.of(this).region}.console.aws.amazon.com/cognito/v2/idp/user-pools/${this.userPool.userPoolId}/users?region=${Stack.of(this).region}`
    })
    this.userPoolId = this.userPool.userPoolId
    this.userPoolArn = this.userPool.userPoolArn
    this.identityPoolId = this.identityPool.identityPoolId
    this.authenticatedUserRoleArn = this.authenticatedUserRole.roleArn
    this.unauthenticatedUserRoleArn = this.unauthenticatedUserRole.roleArn
    this.userPoolClientId = this.userPoolClient.userPoolClientId
    /**
       * Adding nag suppression to decrease sec requirements for login
       */
    NagSuppressions.addResourceSuppressions(this.userPool, [
      {
        id: 'AwsSolutions-COG1',
        reason: 'Skipping - Sample doesn\'t need advanced security'
      },
      {
        id: 'AwsSolutions-COG2',
        reason: 'Skipping - Sample doesn\'t need advanced security'
      },
      {
        id: 'AwsSolutions-COG3',
        reason: 'Skipping - Sample doesn\'t need advanced security'
      }
    ])

    NagSuppressions.addResourceSuppressions(preTokenGenerationHookFunctionRole, [
      {
        id: 'AwsSolutions-IAM5',
        reason: 'Allowing PreTokenGenerationHookFunctionRole to have * policies'
      }
    ], true)
  }
}
