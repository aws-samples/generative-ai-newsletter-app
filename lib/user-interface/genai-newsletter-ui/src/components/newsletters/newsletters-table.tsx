/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useCallback, useContext, useEffect, useState } from 'react'
import { useCollection } from '@cloudscape-design/collection-hooks'
import { Newsletter } from '../../../../../shared/api/API'
import { AppContext } from '../../common/app-context'
import {
  Alert,
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
import { useNavigate } from 'react-router-dom'
import useOnFollow from '../../common/hooks/use-on-follow'
import { UserContext } from '../../common/user-context'
import { listNewsletters, listUserSubscriptions } from '../../../../../shared/api/graphql/queries'
import { generateAuthorizedClient } from '../../common/helpers'

export interface ListableNewslettersTableProps {
  title?: string
  includeOwned?: boolean
  includeShared?: boolean
  includeDiscoverable?: boolean
  includeSubscriptions?: never
}

export interface UserSubscriptionNewslettersTableProps {
  title?: string
  includeOwned?: never
  includeShared?: never
  includeDiscoverable?: never
  includeSubscriptions?: boolean
}

export default function NewslettersTable (props: ListableNewslettersTableProps | UserSubscriptionNewslettersTableProps) {
  const appContext = useContext(AppContext)
  const userContext = useContext(UserContext)
  const navigate = useNavigate()
  const onFollow = useOnFollow()
  const { includeOwned, includeDiscoverable, includeShared, includeSubscriptions } = props
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter>()
  const [loadingNewsletters, setLoadingNewsletters] = useState<boolean>(true)
  const [subscribedCount, setSubscribedCount] = useState<number>(0)
  const [subscribedAlertDismissed, setSubscribedAlertDismissed] = useState<boolean>(false)
  const [editDisabled, setEditDisabled] = useState<boolean>(false)

  const getNewsletters = useCallback(async () => {
    if (!appContext) {
      return
    }
    const apiClient = await generateAuthorizedClient()
    try {
      setSubscribedCount(0)
      if (includeSubscriptions === true) {
        const result =
          await apiClient.graphql({
            query: listUserSubscriptions
          })
        if (result.data !== undefined && result.errors === undefined) {
          setNewsletters(result.data.listUserSubscriptions?.items as Newsletter[])
          setSubscribedCount(result.data.listUserSubscriptions?.items?.length ?? 0)
        }
      } else {
        const result =
          await apiClient.graphql({
            query: listNewsletters,
            variables: {
              input: {
                includeDiscoverable,
                includeOwned,
                includeShared
              }
            }
          })
        if (result.data !== undefined && result.errors === undefined) {
          setNewsletters(result.data.listNewsletters?.items as Newsletter[])
        }
      }



    } catch (e) {
      console.error(e)
    }
    setLoadingNewsletters(false)
  }, [appContext, includeDiscoverable, includeOwned, includeShared, includeSubscriptions])

  const handleUpdateDropdownItemClick = (
    event: CustomEvent<ButtonDropdownProps.ItemClickDetails>
  ) => {
    const { detail } = event
    switch (detail.id) {
      case 'edit':
        if (!selectedNewsletter) {
          return
        }
        navigate(`/newsletters/${selectedNewsletter?.id}/edit`)
        break
      default:
        break
    }
  }

  const newslettersTableColumnDefinitions = [
    {
      id: 'accountId',
      header: 'Account ID',
      cell: (item: Newsletter) => item.account?.id,
      isHeaderRow: true
    },
    {
      id: 'name',
      header: 'Newsletter Name',
      cell: (item: Newsletter) => (
        <Link onFollow={onFollow} href={`/newsletters/${item.id}`}>
          {item.title}
        </Link>
      ),
      isHeaderRow: true
    },
    {
      id: 'numberOfDays',
      header: 'Number of Days between Newsletters',
      cell: (item: Newsletter) => item.numberOfDaysToInclude,
      isHeaderRow: true
    },
    {
      id: 'private',
      header: 'Private',
      cell: (item: Newsletter) =>
        item.isPrivate !== undefined
          ? item.isPrivate
            ? 'Private'
            : 'Discoverable'
          : 'Private',
      isHeaderRow: true
    },
    {
      id: 'Newsletter Created',
      header: 'Newsletter Created',
      cell: (item: Newsletter) => new Date(item.createdAt ?? "").toUTCString()
    }
  ]
  const newslettersTableColumnDisplay = [
    { id: 'accountId', visible: false },
    { id: 'name', visible: true },
    { id: 'numberOfDays', visible: true },
    { id: 'private', visible: true },
    { id: 'Newsletter Created', visible: true }
  ]

  useEffect(() => {
    getNewsletters()
  }, [getNewsletters])

  const { items, actions, collectionProps, filterProps } = useCollection(
    newsletters,
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

  return (
    <SpaceBetween direction='vertical' size='s'>
      {(subscribedCount > newsletters.length && !subscribedAlertDismissed) ?
        <Alert type='warning'
          dismissible
          onDismiss={() => setSubscribedAlertDismissed(true)}
        >
          There are {subscribedCount - newsletters.length} newsletters you are subscribed to that are no longer visible to you.
          This can happen when a newsletter owner stops sharing a newsletter and doesn't unsubscribe its users.
          Please contact your administrator for support.
        </Alert> : <></>
      }
      <Table
        {...collectionProps}
        columnDisplay={newslettersTableColumnDisplay}
        columnDefinitions={newslettersTableColumnDefinitions}
        items={items}
        loadingText="Loading"
        resizableColumns
        loading={loadingNewsletters}
        empty={
          <Box>
            <SpaceBetween size="m" direction="vertical">
              <b>No Newsletters Found</b>
            </SpaceBetween>
          </Box>
        }
        variant="embedded"
        selectionType="single"
        filter={
          <TextFilter
            filteringPlaceholder="Filter Newsletters"
            {...filterProps}
            filteringAriaLabel="Filter Newsletters"
          />
        }
        selectedItems={selectedNewsletter ? [selectedNewsletter] : []}
        onSelectionChange={({ detail }) => {
          setSelectedNewsletter(detail.selectedItems[0] as Newsletter)
          setEditDisabled(detail.selectedItems[0]?.account?.id !== userContext?.accountId)
        }}
        header={
          <Header
            actions={
              <SpaceBetween size="s" direction="horizontal">
                <Button
                  variant="primary"
                  onClick={() => {
                    navigate('/newsletters/create')
                  }}
                >
                  Create New Newsletter
                </Button>
                <ButtonDropdown
                  items={[{ text: 'Edit Newsletter', id: 'edit', disabled: editDisabled }]}
                  onItemClick={handleUpdateDropdownItemClick}
                >
                  Update Newsletter
                </ButtonDropdown>
              </SpaceBetween>
            }
          >
            {props?.title ?? 'Newsletters'}
          </Header>
        }
      />
    </SpaceBetween>
  )
}
