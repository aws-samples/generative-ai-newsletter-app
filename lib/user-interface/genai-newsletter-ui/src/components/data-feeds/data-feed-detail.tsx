/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DataFeed } from '../../../../../shared/api/API'
import { AppContext } from '../../common/app-context'
import {
  Container,
  FormField,
  SpaceBetween,
  Spinner,
  Toggle
} from '@cloudscape-design/components'
import { getDataFeed } from '../../../../../shared/api/graphql/queries'
import { generateAuthorizedClient } from '../../common/helpers'

export default function DataFeedDetail () {
  const { dataFeedId } = useParams()
  const appContext = useContext(AppContext)
  const [setDataFeedId, setDataFeed] = useState<DataFeed | null>(null)
  const [loading, setLoading] = useState(true)

  const getDataFeedData = useCallback(async () => {
    if (!appContext) {
      return
    }
    if (!dataFeedId) {
      return
    }
    const apiClient = await generateAuthorizedClient()
    const result = await apiClient.graphql({
        query: getDataFeed,
        variables: {
          input: {
            id: dataFeedId
          }
        }
    })
    if (result.errors) {
      console.error(result.errors)
      return
    }
    setDataFeed(result.data.getDataFeed as DataFeed)
    setLoading(false)
  }, [appContext, dataFeedId])

  useEffect(() => {
    getDataFeedData()
  }, [getDataFeedData, dataFeedId])

  return (
    <Container
    >
      {loading ? (
        <SpaceBetween size="l" alignItems="center" direction="vertical">
          <Spinner size="big" />
          <h4>Loading...</h4>
        </SpaceBetween>
      ) : (
        <SpaceBetween direction="vertical" size="s">
          <FormField label='Data Feed Name'>
            <span style={{ fontWeight: 'bold' }}>{setDataFeedId?.title}</span>
          </FormField>
          <FormField label='Description'>
            <i>{setDataFeedId?.description}</i>
          </FormField>

          <FormField label="Feed URL">{setDataFeedId?.url}</FormField>
          <FormField label="DataFeedId">{setDataFeedId?.id}</FormField>
          <FormField label="Enabled">
            <Toggle checked={setDataFeedId?.enabled ?? false} disabled>
              Data Feed {setDataFeedId?.enabled ? 'Enabled' : 'Disabled'}
            </Toggle>
            <FormField label="Private Data Feed"
              description="By default, Data Feeds are private to you. Disable Private Data Feed to allow others to discover your data feed and use in their own newsletters.">
              <Toggle
                checked={setDataFeedId?.isPrivate ?? true}
                disabled
              >Data Feed Private
              </Toggle>
            </FormField>
          </FormField>
          <FormField label="Feed Type">{setDataFeedId?.feedType}</FormField>
          <FormField label="Date Created">{setDataFeedId?.createdAt}</FormField>
          <FormField label="Article Summarization Prompt">
            {setDataFeedId?.summarizationPrompt ??  <span style={{ fontStyle: 'italic' }}>No Custom Prompt Provided</span>}
          </FormField>
        </SpaceBetween>
      )
      }
    </Container >
  )
}
