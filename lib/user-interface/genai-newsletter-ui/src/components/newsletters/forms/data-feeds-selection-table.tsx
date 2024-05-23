/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  Table
} from '@cloudscape-design/components'
import { useCallback, useContext, useEffect, useState } from 'react'
import { DataFeed, ListDataFeedsInput } from '../../../../../../shared/api/API'
import { AppContext } from '../../../common/app-context'
import {
  NewsletterWizardDataFeedsTableColumnDefinition,
  NewsletterWizardNewsFeedsTableColumnDisplay
} from '../definitions'
import { listDataFeeds } from '../../../../../../shared/api/graphql/queries'
import { generateAuthorizedClient } from '../../../common/helpers'

export interface NewsletterNewsFeedFormProps extends ListDataFeedsInput {
  selectedDataFeeds: DataFeed[]
  setSelectedDataFeeds: (dataFeeds: DataFeed[]) => void
}

export default function NewsletterDataFeedsSelectionForm (
  props: NewsletterNewsFeedFormProps
) {
  const { selectedDataFeeds, setSelectedDataFeeds, includeOwned, includeShared } = props
  const appContext = useContext(AppContext)
  const [dataFeeds, setDataFeeds] = useState<
    DataFeed[]
  >([])
  const [loading, setLoading] = useState<boolean>(true)


  const fetch = useCallback(async () => {
    if (!appContext) {
      return
    }
    const apiClient = await generateAuthorizedClient()
    const results = await apiClient.graphql({
      query: listDataFeeds,
      variables: {
        input: {
          includeOwned,
          includeShared
        }
      }
    })
    

    if (results?.data?.listDataFeeds?.items !== null) {
      setDataFeeds(results.data.listDataFeeds?.items as DataFeed[])
    }
    setLoading(false)
  }, [appContext, includeOwned, includeShared])



  useEffect(() => {
    if (loading) {
      fetch()
    }
  }, [fetch, loading])
  return (
    <Table
      items={dataFeeds}
      resizableColumns
      selectedItems={selectedDataFeeds}
      onSelectionChange={
        ({ detail }) => {
          setSelectedDataFeeds(detail.selectedItems)
        }

      }
      trackBy="id"
      loading={loading}
      selectionType="multi"
      columnDefinitions={NewsletterWizardDataFeedsTableColumnDefinition()}
      columnDisplay={NewsletterWizardNewsFeedsTableColumnDisplay()}
    />
  )
}
