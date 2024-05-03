/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  BreadcrumbGroup,
  Button,
  Header,
  SpaceBetween
} from '@cloudscape-design/components'
import BaseAppLayout from '../../components/base-app-layout'
import useOnFollow from '../../common/hooks/use-on-follow'
import DataFeedDetail from '../../components/data-feeds/data-feed-detail'
import { useNavigate, useParams } from 'react-router-dom'
import DataFeedArticleTable from '../../components/data-feeds/article-table'
import BaseContentLayout from '../../components/base-content-layout'
// import { useCallback, useContext, useEffect, useState } from 'react'
// import { AppContext } from '../../common/app-context'

export default function DataFeedDetails() {
  const navigate = useNavigate()
  // const appContext = useContext(AppContext)
  const { dataFeedId } = useParams()
  const onFollow = useOnFollow()
  // const [canManageDataFeed, setCanManageDataFeed] = useState<boolean>(false)
  // const checkManagePermission = useCallback(async () => {
  //   if (!appContext) {
  //     return
  //   }
  //   if (!dataFeedId) {
  //     return
  //   }
  //   const apiClient = new ApiClient(appContext)
  //   try {
  //     const canManageDataFeed = await apiClient.dataFeeds.canManageDataFeed({ dataFeedId })
  //     setCanManageDataFeed(canManageDataFeed.data.canManageDataFeed)
  //   } catch (e) {
  //     setCanManageDataFeed(false)
  //   }
  // }, [appContext, dataFeedId])

  // useEffect(() => {
  //   checkManagePermission()
  // },[checkManagePermission, dataFeedId])

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
            },
            {
              text: 'Data Feed Details',
              href: `/feeds/${dataFeedId}`
            }
          ]}
        />
      }
      content={
        <BaseContentLayout
          header={
            <Header
              variant="awsui-h1-sticky"
              description="Browse the details of the Data Feed"
              actions={
                <SpaceBetween size="xs" direction="horizontal">
                  <Button
                    // disabled={!canManageDataFeed}
                    onClick={() => {
                      navigate(`/feeds/${dataFeedId}/edit`)
                    }}
                  >
                    Edit
                  </Button>
                  <Button disabled>Delete (Not Yet Implemented)</Button>
                </SpaceBetween>
              }
            >
              Data Feed Details
            </Header>
          }
        >
          <SpaceBetween size="l" direction="vertical">
            <DataFeedDetail />
            <DataFeedArticleTable />
          </SpaceBetween>
        </BaseContentLayout>
      }
    />
  )
}
