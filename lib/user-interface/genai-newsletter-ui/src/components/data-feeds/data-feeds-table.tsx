/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useCollection } from '@cloudscape-design/collection-hooks'
import {
  Badge,
  Box,
  Button,
  ButtonDropdown,
  ButtonDropdownProps,
  Header,
  Link,
  SpaceBetween,
  Table,
  TextFilter
} from '@cloudscape-design/components'
import { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../common/app-context'
import { DataFeed, ListDataFeedsInput } from '../../../../../shared/api/API'
import { DataFeedsTableColumnDisplay } from '../newsletters/definitions'
import { useNavigate } from 'react-router-dom'
import useOnFollow from '../../common/hooks/use-on-follow'
import { listDataFeeds } from '../../../../../shared/api/graphql/queries'
import { generateAuthorizedClient } from '../../common/helpers'

export default function DataFeedsTable (input?: ListDataFeedsInput) {
  const appContext = useContext(AppContext)
  const {
    includeOwned = true,
    includeShared = false,
    includeDiscoverable = false
  } = input ?? {}
  const navigate = useNavigate()
  const onFollow = useOnFollow()
  const [dataFeeds, setDataFeeds] = useState<DataFeed[]>([])
  const [selectedDataFeed, setSelectedDataFeed] = useState<DataFeed>()
  const [loadingDataFeeds, setLoadingDataFeeds] = useState<boolean>(true)

  const getDataFeeds = useCallback(async () => {
    if (!appContext) {
      return
    }
    const apiClient = await generateAuthorizedClient()
    try {
      const result = await apiClient.graphql({
        query: listDataFeeds,
        variables: {
          input: {
            includeDiscoverable,
            includeOwned,
            includeShared
          }
        }
      })

      if (
        result.data?.listDataFeeds?.items !== undefined &&
        result.data.listDataFeeds.items !== null
      ) {
        setDataFeeds(result.data.listDataFeeds.items as DataFeed[])
        setLoadingDataFeeds(false)
      }
    } catch (e) {
      console.log(e)
    }
    setLoadingDataFeeds(false)
  }, [appContext, includeDiscoverable, includeOwned, includeShared])

  const handleUpdateDropdownClick = (
    event: CustomEvent<ButtonDropdownProps.ItemClickDetails>
  ) => {
    const { detail } = event
    switch (detail.id) {
      case 'edit':
        if (!selectedDataFeed) {
          return
        }
        navigate(`/feeds/${selectedDataFeed?.id}/edit`)
        break
      default:
        break
    }
  }

  const { items, actions, collectionProps, filterProps } = useCollection(
    dataFeeds,
    {
      filtering: {
        empty: <Box>No items</Box>,
        noMatch: (
          <SpaceBetween direction="vertical" size="s">
            <Header>title="No matches"</Header>
            action=
            {
              <Button onClick={() => actions.setFiltering('')}>
                Clear filter
              </Button>
            }
          </SpaceBetween>
        )
      },
      pagination: { pageSize: 10 }
    }
  )

  const dataFeedsTableColumnDefinition = [
    {
      id: 'dataFeedId',
      cell: (item: DataFeed) => item.id,
      header: 'Data Feed ID',
      isHeaderRow: false
    },
    {
      id: 'title',
      cell: (item: DataFeed) => (
        <Link
          onFollow={onFollow}
          href={`/feeds/${item.id}`}
          key={'FEED-LINK-' + item.id}
        >
          {item.title}
        </Link>
      ),
      header: 'Title',
      isHeaderRow: true
    },
    {
      id: 'url',
      cell: (item: DataFeed) => item.url,
      header: 'Feed URL',
      isHeaderRow: true
    },
    {
      id: 'feedType',
      cell: (item: DataFeed) => item.feedType,
      header: 'Feed Type',
      isHeaderRow: true
    },
    {
      id: 'enabled',
      cell: (item: DataFeed) => (
        <Badge color={item.enabled ? 'green' : 'grey'}>
          {item.enabled ? 'ENABLED' : 'DISABLED'}
        </Badge>
      ),
      header: 'Enabled',
      isHeaderRow: true
    },
    {
      id: 'createdAt',
      cell: (item: DataFeed) =>
        item.createdAt ? new Date(item.createdAt).toUTCString() : '',
      header: 'Created At',
      isHeaderRow: true
    }
  ]

  useEffect(() => {
    setLoadingDataFeeds(true)
    getDataFeeds()
  }, [getDataFeeds])

  return (
    <Table
      {...collectionProps}
      columnDefinitions={dataFeedsTableColumnDefinition}
      columnDisplay={DataFeedsTableColumnDisplay()}
      items={items}
      resizableColumns
      loading={loadingDataFeeds}
      selectionType="single"
      trackBy="dataFeedId"
      selectedItems={selectedDataFeed ? [selectedDataFeed] : []}
      onSelectionChange={({ detail }) => {
        setSelectedDataFeed(detail.selectedItems[0])
      }}
      filter={
        <TextFilter
          filteringPlaceholder="Filter Data Feeds"
          {...filterProps}
          filteringAriaLabel="Filter Data Feeds"
        />
      }
      empty={
        <Box>
          <SpaceBetween size="m" direction="vertical">
            <b>No Data Feeds</b>
            <Button
              onClick={() => {
                navigate('/feeds/create')
              }}
            >
              Create a Data Feed
            </Button>
          </SpaceBetween>
        </Box>
      }
      header={
        <Header
          actions={
            <SpaceBetween size="s" direction="horizontal">
              <Button
                variant="primary"
                onClick={() => {
                  navigate('/feeds/create')
                }}
              >
                Create New Data Feed
              </Button>
              <ButtonDropdown
                items={[{ id: 'edit', text: 'Edit Data Feed' }]}
                onItemClick={handleUpdateDropdownClick}
              >
                Update Data Feed
              </ButtonDropdown>
            </SpaceBetween>
          }
        />
      }
    />
  )
}
