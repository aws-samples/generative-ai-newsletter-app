/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import * as cdk from 'aws-cdk-lib'
import { RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import { type Table } from 'aws-cdk-lib/aws-dynamodb'
import { Rule, Schedule } from 'aws-cdk-lib/aws-events'
import {
  ApplicationLogLevel,
  Architecture,
  LambdaInsightsVersion,
  LogFormat,
  Runtime,
  Tracing
} from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import {
  StateMachine,
  IntegrationPattern,
  Map,
  DefinitionBody,
  JsonPath,
  LogLevel
} from 'aws-cdk-lib/aws-stepfunctions'
import {
  LambdaInvoke,
  StepFunctionsStartExecution
} from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { SfnStateMachine as StateMachineTarget } from 'aws-cdk-lib/aws-events-targets'
import { Construct } from 'constructs'
import { NagSuppressions } from 'cdk-nag'

interface DataFeedPollStepFunctionProps extends StackProps {
  dataFeedTable: Table
  dataFeedIngestionStateMachine: StateMachine
  dataFeedTableTypeIndex: string
}

export class DataFeedPollStepFunction extends Construct {
  public readonly stateMachine: StateMachine
  constructor (
    scope: Construct,
    id: string,
    props: DataFeedPollStepFunctionProps
  ) {
    super(scope, id)

    const getDataFeedsFunction = new NodejsFunction(
      this,
      'get-data-feeds',
      {
        description:
          'Function responsible for getting all enabled data feeds to poll',
        handler: 'handler',
        architecture: Architecture.ARM_64,
        runtime: Runtime.NODEJS_20_X,
        tracing: Tracing.ACTIVE,
        logFormat: LogFormat.JSON,
        applicationLogLevel: ApplicationLogLevel.DEBUG,
        insightsVersion: LambdaInsightsVersion.VERSION_1_0_229_0,
        environment: {
          POWERTOOLS_LOG_LEVEL: 'DEBUG',
          DATA_FEED_TABLE: props.dataFeedTable.tableName,
          DATA_FEED_TABLE_TYPE_INDEX:
            props.dataFeedTableTypeIndex
        },
        timeout: cdk.Duration.seconds(30)
      }
    )

    // Step Function Tasks
    // Get Data Feeds from Data Feed Table
    const getDataFeedsJob = new LambdaInvoke(this, 'GetDataFeeds', {
      lambdaFunction: getDataFeedsFunction,
      payloadResponseOnly: true,
      resultPath: '$'
    })

    const startIngestionStepFunctionJob = new StepFunctionsStartExecution(
      this,
      'StartIngestionStepFunction',
      {
        stateMachine: props.dataFeedIngestionStateMachine,
        integrationPattern: IntegrationPattern.REQUEST_RESPONSE
      }
    )

    const mapDataFeeds = new Map(this, 'MapDataFeeds', {
      itemsPath: '$.dataFeeds',
      itemSelector: {
        dataFeedId: JsonPath.stringAt('$$.Map.Item.Value')
      }
    })

    mapDataFeeds.itemProcessor(startIngestionStepFunctionJob)

    const definition = getDataFeedsJob.next(mapDataFeeds)

    const stateMachine = new StateMachine(this, 'StateMachine', {
      comment:
        "State machine responsible for starting each feed's ingestion process",
      definitionBody: DefinitionBody.fromChainable(definition),
      logs: {
        destination: new LogGroup(this, 'DataFeedPollStepFunction', {
          logGroupName: `/aws/vendedlogs/states/${Stack.of(this).stackName}-data-feed-poll-step-function`,
          removalPolicy: RemovalPolicy.DESTROY
        }),
        level: LogLevel.ALL,
        includeExecutionData: true
      },
      tracingEnabled: true
    })
    getDataFeedsFunction.grantInvoke(stateMachine)
    props.dataFeedTable.grantReadData(getDataFeedsFunction)

    new Rule(this, 'DataFeedCheckRule', {
      schedule: Schedule.rate(cdk.Duration.days(1)),
      targets: [new StateMachineTarget(stateMachine)]
    })

    this.stateMachine = stateMachine

    /**
     * CDK NAG Suppressions
     */
    NagSuppressions.addResourceSuppressions(
      [stateMachine, getDataFeedsFunction],
      [{
        id: 'AwsSolutions-IAM5',
        reason: 'Allowing CloudWatch & XRay'
      }], true
    )
  }
}
