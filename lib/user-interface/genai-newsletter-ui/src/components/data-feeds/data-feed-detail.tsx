import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DataFeed } from 'genai-newsletter-shared/api/API'
import { AppContext } from '../../common/app-context'
import { ApiClient } from '../../common/api'
import {
  Button,
  Container,
  FormField,
  Header,
  SpaceBetween,
  Spinner,
  Toggle
} from '@cloudscape-design/components'

export default function DataFeedDetail() {
  const { dataFeedId } = useParams()
  const navigate = useNavigate()
  const appContext = useContext(AppContext)
  const [setDataFeedId, setDataFeed] = useState<DataFeed | null>(null)
  const [canManageDataFeed, setCanManageDataFeed] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  const getDataFeed = useCallback(async () => {
    if (!appContext) {
      return
    }
    if (!dataFeedId) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.dataFeeds.getDataFeed({ dataFeedId })
    if (result.errors) {
      console.error(result.errors)
      return
    }
    setDataFeed(result.data.getDataFeed as DataFeed)
    try {
      const canManageDataFeed = await apiClient.dataFeeds.canManageDataFeed({ dataFeedId })
      setCanManageDataFeed(canManageDataFeed.data.canManageDataFeed)
    } catch (e) {
      setCanManageDataFeed(false)
    }
    setLoading(false)
  }, [appContext, dataFeedId])

  useEffect(() => {
    getDataFeed()
  }, [getDataFeed, dataFeedId])

  return (
    <Container
      header={
        <Header
          actions={
            <SpaceBetween direction="horizontal" size="s">
              <Button
                variant="primary"
                disabled={canManageDataFeed}
                onClick={() => {
                  navigate(`/feeds/${dataFeedId}/edit`)
                }}
              >
                Edit Data Feed
              </Button>
            </SpaceBetween>
          }
        />
      }
    >
      {loading ? (
        <SpaceBetween size="l" alignItems="center" direction="vertical">
          <Spinner size="big" />
          <h4>Loading...</h4>
        </SpaceBetween>
      ) : (
        <SpaceBetween direction="vertical" size="s">
          <h2>{setDataFeedId?.title}</h2>
          <span>
            <i>{setDataFeedId?.description}</i>
          </span>
          <FormField label="Feed URL">{setDataFeedId?.url}</FormField>
          <FormField label="DataFeedId">{setDataFeedId?.dataFeedId}</FormField>
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
            {setDataFeedId?.summarizationPrompt}
          </FormField>
        </SpaceBetween>
      )}
    </Container>
  )
}
