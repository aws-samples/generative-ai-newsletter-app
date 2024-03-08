import {
  Button,
  Container,
  Form,
  FormField,
  Input,
  SpaceBetween,
  Spinner,
  Textarea,
  Toggle
} from '@cloudscape-design/components'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../../../common/app-context'
import { ApiClient } from '../../../common/api'

export default function DataFeedDetailsForm() {
  const { dataFeedId } = useParams()
  const appContext = useContext(AppContext)
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate()
  const [url, setUrl] = useState<string>('')
  const [enabled, setEnabled] = useState<boolean>(true)
  const [urlError] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [titleError] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [summarizationPrompt, setSummarizationPrompt] = useState<string>('')
  const [isPrivate, setIsPrivate] = useState<boolean>(true)

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
      console.log(result.errors)
      return
    }
    setUrl(result.data.getDataFeed?.url ?? '')
    setEnabled(result.data.getDataFeed?.enabled ?? true)
    setTitle(result.data.getDataFeed?.title ?? '')
    setDescription(result.data.getDataFeed?.description ?? '')
    setSummarizationPrompt(
      result.data.getDataFeed?.summarizationPrompt ?? ''
    )
    setIsPrivate(result.data.getDataFeed?.isPrivate ?? true)
    setLoading(false)
  }, [appContext, dataFeedId])

  const updateDataFeed = useCallback(async () => {
    setLoading(true)
    if (!appContext) {
      return
    }
    if (!dataFeedId) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.dataFeeds.updateDataFeed(
      { dataFeedId, url, enabled, title, description, summarizationPrompt, isPrivate },
    )
    if (result.errors) {
      console.log(result.errors)
      return
    }
    navigate(`/feeds/${dataFeedId}`)
  }, [
    appContext,
    description,
    enabled,
    navigate,
    dataFeedId,
    summarizationPrompt,
    title,
    url,
    isPrivate
  ])

  const createDataFeed = useCallback(async () => {
    setLoading(true)
    if (!appContext) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.dataFeeds.createDataFeed({
      url,
      enabled,
      title,
      description,
      summarizationPrompt,
      isPrivate
    })
    if (result.errors) {
      console.log(result.errors)
      return
    }
    navigate(`/feeds/${result.data.createDataFeed?.dataFeedId}`)
  }, [appContext, description, enabled, isPrivate, navigate, summarizationPrompt, title, url])

  useEffect(() => {
    if (dataFeedId) {
      getDataFeed()
    } else {
      setLoading(false)
    }
  }, [dataFeedId, getDataFeed])
  return (
    <Container>
      {loading ? (
        <SpaceBetween size="l" alignItems="center" direction="vertical">
          <Spinner size="big" />
          <h4>Loading...</h4>
        </SpaceBetween>
      ) :
        <Form
          actions={
            <SpaceBetween size="s" direction="horizontal">
              <Button
                onClick={() => {
                  if (dataFeedId) {
                    navigate(`/feeds/${dataFeedId}`)
                  } else {
                    navigate(`/feeds`)
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={dataFeedId ? updateDataFeed : createDataFeed}
              >
                {dataFeedId ? 'Update' : 'Add'}
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l" direction="vertical">
            <FormField
              label="Feed Title"
              description="Give your feed a recognizable title so users know what kind of data will be available."
              errorText={titleError}
            >
              <Input
                placeholder="A Cool RSS Feed"
                value={title}
                onChange={(e) => setTitle(e.detail.value)}
                ariaRequired
              />
            </FormField>
            <FormField
              label={
                <span>
                  {' '}
                  Feed Description <i>- optional</i>{' '}
                </span>
              }
              description="Describe your feed in a few words."
            >
              <Textarea
                placeholder="This is a cool RSS feed"
                value={description}
                onChange={(e) => setDescription(e.detail.value)}
              />
            </FormField>
            <FormField label="Data Feed URL" errorText={urlError}>
              <Input
                placeholder="https://aws.amazon.com/blogs/aws/feed/"
                value={url}
                onChange={(e) => setUrl(e.detail.value)}
                type="url"
                ariaRequired
              />
            </FormField>
            <FormField
              label="Enabled"
              description="Should the Data Feed be enabled to bring in new data?"
            >
              <Toggle
                key="DataFeedPrivateToggle"
                checked={enabled}
                onChange={(e) => setEnabled(e.detail.checked)}
              >
                Enabled
              </Toggle>
            </FormField>
            <FormField label="Private Data Feed"
              description="By default, Data Feeds are private to you. Disable Private Data Feed to allow others to discover your data feed and use in their own newsletters.">
              <Toggle
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.detail.checked)}
              >Data Feed Private
              </Toggle>

            </FormField>
            <FormField
              label="Summarization Prompt"
              description="A prompt to add guidance for how you'd like the summarization."
            >
              <Textarea
                placeholder="Example: The target auidence for reading the articles have little background knowledge on GenAI technology"
                value={summarizationPrompt}
                onChange={(e) => setSummarizationPrompt(e.detail.value)}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      }
    </Container>
  )
}
