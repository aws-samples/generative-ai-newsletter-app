/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { BreadcrumbGroup, Header } from '@cloudscape-design/components'
import useOnFollow from '../../common/hooks/use-on-follow'
import BaseAppLayout from '../../components/base-app-layout'
import DataFeedDetailsForm from '../../components/data-feeds/forms/data-feed-details-form'
import BaseContentLayout from '../../components/base-content-layout'
import { useParams } from 'react-router-dom'

export default function EditDataFeed() {
  const onFollow = useOnFollow()
  const { subscriptionId } = useParams()
  return (
    <BaseAppLayout
      breadcrumbs={
        <BreadcrumbGroup
          onFollow={onFollow}
          items={[
            {
              text: 'GenAI Newsletter',
              href: '/'
            },
            {
              text: 'Data Feeds Dashboard',
              href: '/feeds'
            },
            {
              text: 'Edit Data Feed',
              href: `/feeds/${subscriptionId}/edit`
            }
          ]}
        />
      }
      content={
        <BaseContentLayout
          header={
            <Header
              variant="awsui-h1-sticky"
              description="Edit a feed. Data feeds automate ingestion and Generative AI enhancement so you can develop meaningful newsletters."
            >
              Edit Data Feed
            </Header>
          }
        >
          <DataFeedDetailsForm />
        </BaseContentLayout>
      }
    />
  )
}
