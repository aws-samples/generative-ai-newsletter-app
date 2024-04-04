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
import { CfnPolicyTemplate, type CfnPolicy } from 'aws-cdk-lib/aws-verifiedpermissions'
import { NagSuppressions } from 'cdk-nag'

interface PermissionsProps {
  userPoolId: string
  userPoolClientId: string
  userPoolArn: string
}

export class Authorization extends Construct {
  public readonly policyStore: verifiedpermissions.CfnPolicyStore
  public readonly createActionAuthCheckFunction: NodejsFunction
  public readonly readActionAuthCheckFunction: NodejsFunction
  public readonly updateActionAuthCheckFunction: NodejsFunction
  public readonly listAuthFilterFunction: NodejsFunction
  readonly policyDefinitions: CfnPolicy[]
  readonly policyTemplateDefinitions: CfnPolicyTemplate[]
  constructor (scope: Construct, id: string, props: PermissionsProps) {
    const { userPoolId, userPoolClientId, userPoolArn } = props
    super(scope, id)

    const validationSettings = {
      mode: 'OFF'
    }

    const policyStore = new verifiedpermissions.CfnPolicyStore(
      this,
      'PolicyStore',
      {
        schema: {
          cedarJson: fs
            .readFileSync(path.join(__dirname, 'AVPSchema.json'))
            .toString('utf-8')
        },
        validationSettings
      }
    )
    this.policyStore = policyStore

    new verifiedpermissions.CfnIdentitySource(this, 'IdentitySource', {
      policyStoreId: policyStore.ref,
      principalEntityType: 'User',
      configuration: {
        cognitoUserPoolConfiguration: {
          userPoolArn,
          clientIds: [userPoolClientId]
        }
      }
    })
    const policyTemplatesFolder = path.join(__dirname, 'policy-templates')
    this.policyTemplateDefinitions = fs.readdirSync(policyTemplatesFolder).filter(p => {
      const f = path.join(policyTemplatesFolder, p)
      return fs.statSync(f).isFile() && p.endsWith('.cedar')
    }).map((p) => {
      const f = path.join(policyTemplatesFolder, p)
      const policyTemplate = new CfnPolicyTemplate(this, p, {
        policyStoreId: policyStore.ref,
        statement: fs.readFileSync(f).toString('utf-8')

      })
      policyTemplate.applyRemovalPolicy(RemovalPolicy.DESTROY)
      return policyTemplate
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

    const createActionAuthCheckFunction = new NodejsFunction(this, 'create-auth-check', {
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
        POLICY_STORE_ID: policyStore.ref
      }
    })

    createActionAuthCheckFunction.role?.attachInlinePolicy(avpAccessPolicy)

    const readActionAuthCheckFunction = new NodejsFunction(this, 'read-auth-check', {
      description: 'Function responsible for checking if requests are authorized to read items using Amazon Verified Permissions',
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
    readActionAuthCheckFunction.role?.attachInlinePolicy(avpAccessPolicy)

    const listAuthFilterFunction = new NodejsFunction(this, 'list-auth-filter', {
      description: 'Function responsible for filtering list requests using Amazon Verified Permissions',
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
    listAuthFilterFunction.role?.attachInlinePolicy(avpAccessPolicy)

    const updateAuthCheckFunction = new NodejsFunction(this, 'update-auth-check', {
      description: 'Function responsible for checking if requests are authorized to update items using Amazon Verified Permissions',
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
    updateAuthCheckFunction.role?.attachInlinePolicy(avpAccessPolicy)

    this.readActionAuthCheckFunction = readActionAuthCheckFunction
    this.createActionAuthCheckFunction = createActionAuthCheckFunction
    this.listAuthFilterFunction = listAuthFilterFunction
    this.updateActionAuthCheckFunction = updateAuthCheckFunction

    /**
     * cdk_nag suppressions
     */
    NagSuppressions.addResourceSuppressions(
      [
        createActionAuthCheckFunction,
        readActionAuthCheckFunction,
        listAuthFilterFunction,
        updateAuthCheckFunction
      ],
      [
        {
          id: 'AwsSolutions-IAM5',
          reason: 'Allowing CloudWatch & X-Ray to Operate'
        }
      ],
      true
    )
  }
}
