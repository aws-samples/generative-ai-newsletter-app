/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { BreadcrumbGroup, Header } from '@cloudscape-design/components'
import BaseAppLayout from '../../components/base-app-layout'
import useOnFollow from '../../common/hooks/use-on-follow'
import DataFeedsTable from '../../components/data-feeds/data-feeds-table'
import BaseContentLayout from '../../components/base-content-layout'

export default function DataFeedsDashboard () {
  const onFollow = useOnFollow()

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
              text: 'Data Feeds',
              href: '/feeds'
            }
          ]}
        />
      }
      content={
        <BaseContentLayout
          header={
            <Header
              variant='awsui-h1-sticky'
             description="Create new data feeds for Newsletters or browse/update existing feeds.">
              Data Feeds Dashboard
            </Header>
          }
        >
          <DataFeedsTable
            includeDiscoverable
            includeOwned
            includeShared
          />
        </BaseContentLayout>
      }
    />
  )
}
