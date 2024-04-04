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
import { ApiClient } from '../../../common/api'
import {
  NewsletterWizardDataFeedsTableColumnDefinition,
  NewsletterWizardNewsFeedsTableColumnDisplay
} from '../definitions'

export interface NewsletterNewsFeedFormProps extends ListDataFeedsInput {
  selectedDataFeeds: DataFeed[]
  setSelectedDataFeeds: (dataFeeds: DataFeed[]) => void
}

export default function NewsletterDataFeedsSelectionForm(
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
    const apiClient = new ApiClient(appContext)
    const results = await apiClient.dataFeeds.listDataFeeds(
      { includeOwned, includeShared }
    )

    if (results?.data?.listDataFeeds?.dataFeeds !== null) {
      setDataFeeds(results.data.listDataFeeds.dataFeeds as DataFeed[])
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
          console.log('SELECTION CHANGE ===>' + JSON.stringify(detail))
          setSelectedDataFeeds(detail.selectedItems)
        }

      }
      trackBy="dataFeedId"
      loading={loading}
      selectionType="multi"
      columnDefinitions={NewsletterWizardDataFeedsTableColumnDefinition()}
      columnDisplay={NewsletterWizardNewsFeedsTableColumnDisplay()}
    />
  )
}
