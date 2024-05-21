/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { aws_verifiedpermissions as verifiedpermissions, Duration, RemovalPolicy } from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as fs from 'fs'
import * as path from 'path'
import { Construct } from 'constructs'
import {
  ApplicationLogLevel,
  Architecture,
  LambdaInsightsVersion,
  LogFormat,
  Runtime,
  Tracing
} from 'aws-cdk-lib/aws-lambda'
import { PolicyStatement, Effect, Policy, PolicyDocument } from 'aws-cdk-lib/aws-iam'
import { type CfnPolicy } from 'aws-cdk-lib/aws-verifiedpermissions'
import { NagSuppressions } from 'cdk-nag'

interface PermissionsProps {
  userPoolId: string
  userPoolClientId: string
  userPoolArn: string
}

export class Authorization extends Construct {
  public readonly policyStore: verifiedpermissions.CfnPolicyStore
  public readonly graphqlActionAuthorizerFunction: NodejsFunction
  public readonly graphqlReadAuthorizerFunction: NodejsFunction
  public readonly graphqlFilterReadAuthorizerFunction: NodejsFunction
  public readonly avpAuthorizerValidationRegex: string = '^Bearer AUTH(.*)'
  readonly policyDefinitions: CfnPolicy[]
  constructor (scope: Construct, id: string, props: PermissionsProps) {
    const { userPoolId, userPoolClientId, userPoolArn } = props
    super(scope, id)

    const validationSettings: verifiedpermissions.CfnPolicyStore.ValidationSettingsProperty = {
      mode: 'STRICT'
    }

    const policyStore = new verifiedpermissions.CfnPolicyStore(
      this,
      'PolicyStore',
      {
        schema: {
          cedarJson: fs
            .readFileSync(path.join(__dirname, 'cedarschema.json'))
            .toString('utf-8')
        },
        validationSettings
      }
    )
    this.policyStore = policyStore

    new verifiedpermissions.CfnIdentitySource(this, 'IdentitySource', {
      policyStoreId: policyStore.ref,
      principalEntityType: 'GenAINewsletter::User',
      configuration: {
        cognitoUserPoolConfiguration: {
          userPoolArn,
          clientIds: [userPoolClientId]
        }
      }
    })

    const policiesFolder = path.join(__dirname, 'policies')
    this.policyDefinitions = fs.readdirSync(policiesFolder).filter(p => {
      const f = path.join(policiesFolder, p)
      return fs.statSync(f).isFile() && p.endsWith('.cedar')
    }).map((p) => {
      const f = path.join(policiesFolder, p)
      const policy = new verifiedpermissions.CfnPolicy(this, p, {
        policyStoreId: policyStore.ref,
        definition: {
          static: {
            description: p,
            statement: fs.readFileSync(f).toString('utf-8')
          }
        }
      })
      policy.applyRemovalPolicy(RemovalPolicy.DESTROY)
      return policy
    })

    const avpAccessPolicy = new Policy(this, 'AuthCheckAVPAccess', {
      document: new PolicyDocument({
        statements: [
          new PolicyStatement({
            actions: ['verifiedpermissions:IsAuthorized', 'verifiedpermissions:GetSchema'],
            resources: [policyStore.attrArn],
            effect: Effect.ALLOW
          })
        ]
      })
    })

    const graphqlActionAuthorizerFunction = new NodejsFunction(this, 'action-authorization', {
      description: 'Function responsible for checking if requests are authorized to create items using Amazon Verified Permissions',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        USER_POOL_CLIENT_ID: userPoolClientId,
        USER_POOL_ID: userPoolId,
        POLICY_STORE_ID: policyStore.ref,
        VALIDATION_REGEX: this.avpAuthorizerValidationRegex
      }
    })

    graphqlActionAuthorizerFunction.role?.attachInlinePolicy(avpAccessPolicy)

    const graphqlReadAuthorizerFunction = new NodejsFunction(this, 'read-authorization', {
      description: 'Function responsible for checking if requests are authorized to read/view data items using Amazon Verified Permissions',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        USER_POOL_CLIENT_ID: userPoolClientId,
        USER_POOL_ID: userPoolId,
        POLICY_STORE_ID: policyStore.ref,
        VALIDATION_REGEX: this.avpAuthorizerValidationRegex
      }
    })
    graphqlReadAuthorizerFunction.role?.attachInlinePolicy(avpAccessPolicy)

    const graphqlFilterReadAuthorizerFunction = new NodejsFunction(this, 'list-filter-authorization', {
      description: 'Function responsible for checking if requested resources are authorized for viewing data and filtering out unauthorized data from the list.',
      handler: 'handler',
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,
      tracing: Tracing.ACTIVE,
      logFormat: LogFormat.JSON,
      applicationLogLevel: ApplicationLogLevel.DEBUG,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
      timeout: Duration.minutes(5),
      environment: {
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        USER_POOL_CLIENT_ID: userPoolClientId,
        USER_POOL_ID: userPoolId,
        POLICY_STORE_ID: policyStore.ref
      }
    })
    graphqlFilterReadAuthorizerFunction.role?.attachInlinePolicy(avpAccessPolicy)

    this.graphqlActionAuthorizerFunction = graphqlActionAuthorizerFunction
    this.graphqlReadAuthorizerFunction = graphqlReadAuthorizerFunction
    this.graphqlFilterReadAuthorizerFunction = graphqlFilterReadAuthorizerFunction

    NagSuppressions.addResourceSuppressions(
      [graphqlActionAuthorizerFunction, graphqlReadAuthorizerFunction, graphqlFilterReadAuthorizerFunction], [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'The policy is restricted to the verifiedpermissions:IsAuthorized and verifiedpermissions:GetSchema actions'
        }
      ], true
    )
  }
}
