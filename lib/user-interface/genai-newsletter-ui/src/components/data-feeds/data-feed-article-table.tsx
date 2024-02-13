import {
  Alert,
  AlertProps,
  Container,
  Header,
  SpaceBetween,
  Table
} from '@cloudscape-design/components'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { AppContext } from '../../common/app-context'
import { DataFeedArticle } from '@shared/api/API'
import { ApiClient } from '../../common/api'
import {
  DataFeedArticlesTableColumnDefiniton,
  DataFeedArticlesTableColumnDisplay
} from '../newsletters/definitions'

export default function DataFeedArticleTable() {
  const { subscriptionId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const appContext = useContext(AppContext)
  const [feedArticles, setFeedArticles] = useState<DataFeedArticle[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [tableAlertMessage, setTableAlertMessage] = useState('')
  const [tableAlertType, setTableAlertType] =
    useState<AlertProps.Type>('success')
  const getDataFeedArticles = useCallback(async () => {
    if (!appContext) {
      return
    }
    if (!subscriptionId) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.dataFeeds.getDataFeedArticles(subscriptionId)
    if (result.errors) {
      console.log(result.errors)
      return
    }
    if (result.data.getDataFeedArticles?.dataFeedArticles !== null) {
      setFeedArticles(
        result.data.getDataFeedArticles?.dataFeedArticles as DataFeedArticle[]
      )
    }

    setLoading(false)
  }, [appContext, subscriptionId])

  const flagDataFeedArticle = useCallback(
    async (articleId: string, flaggedContent: boolean) => {
      console.log('flagged Data Feed Article!')
      if (!appContext) {
        return
      }
      if (!subscriptionId) {
        return
      }
      const apiClient = new ApiClient(appContext)
      const result = await apiClient.dataFeeds.flagDataFeedArticle(
        subscriptionId,
        articleId,
        flaggedContent
      )
      if (result.errors) {
        console.log(result.errors)
        return
      }
      const updatedFeedArticles = feedArticles.map((article) => {
        if (article.articleId === articleId) {
          article.flaggedContent = flaggedContent
        }
        return article
      })
      setFeedArticles(updatedFeedArticles)
    },
    [appContext, subscriptionId, feedArticles]
  )

  useEffect(() => {
    console.log('searchparams')
    const articleId = searchParams.get('articleId')
    const flagArticle = searchParams.get('flagArticle')
    if (flagArticle !== null && flagArticle == 'true' && articleId !== null) {
      setLoading(true)
      try {
        console.log('TRIGGER')
        flagDataFeedArticle(articleId, true)
      } catch (error) {
        console.log(error)
        setTableAlertMessage('There was an error flagging the article.')
        setTableAlertType('error')
      }
      const params = searchParams
      params.delete('articleId')
      params.delete('flagArticle')
      setSearchParams(params)
      getDataFeedArticles()
    }
  }, [flagDataFeedArticle, getDataFeedArticles, searchParams, setSearchParams])

  useEffect(() => {
    if (subscriptionId) {
      getDataFeedArticles()
    }
  }, [getDataFeedArticles, subscriptionId])

  return (
    <Container>
      {tableAlertMessage !== undefined && tableAlertMessage.length > 0 ? (
        <Alert type={tableAlertType}>{tableAlertMessage}</Alert>
      ) : (
        <></>
      )}
      <Table
        columnDefinitions={DataFeedArticlesTableColumnDefiniton(
          flagDataFeedArticle
        )}
        columnDisplay={DataFeedArticlesTableColumnDisplay()}
        resizableColumns
        items={feedArticles}
        loading={loading}
        loadingText="Loading data feed articles"
        empty={
          <SpaceBetween direction="vertical" size="s">
            <p>No data feed articles found</p>
          </SpaceBetween>
        }
        header={
          <Header
            variant="awsui-h1-sticky"
            description="Articles ingested and GenAI enhanced from the data feed subscription"
          >
            Data Feed Articles
          </Header>
        }
      />
    </Container>
  )
}
