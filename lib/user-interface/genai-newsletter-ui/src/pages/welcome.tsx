/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  Container,
  Grid,
  Header,
  Link,
  SpaceBetween
} from '@cloudscape-design/components'
import { useEffect } from 'react'
import BaseAppLayout from '../components/base-app-layout'
import BaseContentLayout from '../components/base-content-layout'

export default function Welcome () {
  useEffect(() => {})
  return (
    <BaseAppLayout
      content={
        <BaseContentLayout
          header={
            <Header
              variant="awsui-h1-sticky"
              description="Effortlessly Curate and Distribute Personalized Newsletters"
            >
              Generative AI Newsletter App
            </Header>
          }
        >
          <SpaceBetween size="l" direction="vertical">
            <Container>
              <Grid gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}>
                <div>
                  <h3>
                    Effortlessly Curate and Distribute Personalized Newsletters
                  </h3>
                  <p>
                    The GenAI Newsletter App allows you to easily connect data
                    sources, curate content, and automatically generate and
                    distribute personalized newsletters to your subscribers.
                    Harness the power of AI-driven summarization to deliver
                    engaging and informative newsletter content on a regular
                    schedule.
                  </p>
                  <h3>Key Features</h3>
                  <ul>
                    <li>
                      <span style={{ fontWeight: 'bold' }}>
                        Connect Data Sources
                      </span>
                      : Ingest content from various RSS and ATOM feeds on a
                      daily basis.
                    </li>
                    <li>
                      <span style={{ fontWeight: 'bold' }}>
                        Intelligent Summarization
                      </span>
                      : Leverage AI-powered summarization to create short, long,
                      and keyword-based summaries for each piece of content.
                    </li>
                    <li>
                      <span style={{ fontWeight: 'bold' }}>
                        Customizable Newsletters
                      </span>
                      : Assemble newsletters by selecting the data feeds you
                      want to include and set a publication schedule.
                    </li>
                    <li>
                      <span style={{ fontWeight: 'bold' }}>
                        Automated Distribution
                      </span>
                      : Newsletters are automatically generated and emailed to
                      your subscribers using Amazon Pinpoint.
                    </li>
                    <li>
                      <span style={{ fontWeight: 'bold' }}>
                        Content Discoverability
                      </span>
                      : Make your data feeds and newsletters available for other
                      users to discover and subscribe to.
                    </li>
                    <li>
                      <span style={{ fontWeight: 'bold' }}>
                        Secure and Scalable
                      </span>
                      : The app is built on a fully serverless AWS architecture,
                      ensuring reliability, security, and scalability.
                    </li>
                  </ul>
                </div>
                <div>
                  <img
                    style={{ width: '100%' }}
                    src="/images/SampleNewsletterDetails.png"
                  />
                </div>
              </Grid>
            </Container>
            <Container>
              <h3>Architecture Overview</h3>
              <p>
                The GenAI Newsletter App is a serverless solution built on AWS
                that includes the following key components:
              </p>
              <ul>
                <li>
                  <span style={{ fontWeight: 'bold' }}>Frontend</span>: A
                  React-based UI built using{' '}
                  <Link
                    external
                    target="_blank"
                    href="https://cloudscape.design/"
                  >
                    {' '}
                    Cloudscape Design
                  </Link>{' '}
                  components, providing a seamless user experience.
                </li>
                <li>
                  <span style={{ fontWeight: 'bold' }}>Backend</span>: A GraphQL
                  API powered by{' '}
                  <Link
                    href="https://aws.amazon.com/appsync/"
                    external
                    target="_blank"
                  >
                    AWS AppSync
                  </Link>
                  , handling all data management and business logic.
                </li>
                <li>
                  <span style={{ fontWeight: 'bold' }}>Authentication</span>:{' '}
                  <Link
                    href="https://aws.amazon.com/cognito/"
                    external
                    target="_blank"
                  >
                    Amazon Cognito
                  </Link>{' '}
                  manages user authentication.
                </li>
                <li>
                  <span style={{ fontWeight: 'bold' }}>Authorization</span>:{' '}
                  <Link
                    href="https://aws.amazon.com/verified-permissions/"
                    external
                    target="_blank"
                  >
                    Amazon Verified Permissions
                  </Link>{' '}
                  is leveraged to validate user authorization for actions
                  against defined policies.
                </li>
                <li>
                  <span style={{ fontWeight: 'bold' }}>Data Storage</span>:
                  Content, summaries, and newsletter data are stored in{' '}
                  <Link
                    href="https://aws.amazon.com/s3/"
                    external
                    target="_blank"
                  >
                    Amazon S3
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="https://aws.amazon.com/dynamodb/"
                    external
                    target="_blank"
                  >
                    Amazon DynamoDB
                  </Link>
                  .
                </li>
                <li>
                  <span style={{ fontWeight: 'bold' }}>Automation</span>:{' '}
                  <Link
                    href="https://aws.amazon.com/eventbridge/"
                    external
                    target="_blank"
                  >
                    Amazon EventBridge
                  </Link>
                  ,{' '}
                  <Link
                    href="https://aws.amazon.com/step-functions/"
                    external
                    target="_blank"
                  >
                    AWS Step Functions
                  </Link>
                  , and{' '}
                  <Link
                    href="https://aws.amazon.com/lambda/"
                    external
                    target="_blank"
                  >
                    AWS Lambda
                  </Link>{' '}
                  functions handle the automated ingestion of data feeds and
                  newsletter generation.
                </li>
                <li>
                  <span style={{ fontWeight: 'bold' }}>Content Delivery</span>:{' '}
                  <Link
                    href="https://aws.amazon.com/pinpoint/"
                    external
                    target="_blank"
                  >
                    Amazon Pinpoint
                  </Link>{' '}
                  is used to distribute the newsletters to subscribers.
                </li>
              </ul>
            </Container>
          </SpaceBetween>
        </BaseContentLayout>
      }
    />
  )
}
