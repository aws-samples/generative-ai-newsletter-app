/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
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
import { Article } from '../../../../../shared/api/API'
import { ApiClient } from '../../common/api'
import {
  ArticlesTableColumnDefiniton,
  DataFeedArticlesTableColumnDisplay
} from '../newsletters/definitions'

export default function DataFeedArticleTable() {
  const { dataFeedId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const appContext = useContext(AppContext)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [tableAlertMessage, setTableAlertMessage] = useState('')
  const [tableAlertType, setTableAlertType] =
    useState<AlertProps.Type>('success')
  const getArticles = useCallback(async () => {
    if (!appContext) {
      return
    }
    if (!dataFeedId) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.dataFeeds.listArticles({ dataFeedId })
    if (result.errors) {
      console.log(result.errors)
      return
    }
    if (result.data.listArticles?.articles !== null) {
      setArticles(
        result.data.listArticles?.articles as Article[]
      )
    }

    setLoading(false)
  }, [appContext, dataFeedId])

  const flagDataFeedArticle = useCallback(
    async (articleId: string, flaggedContent: boolean) => {
      console.log('flagged Data Feed Article!')
      if (!appContext) {
        return
      }
      if (!dataFeedId) {
        return
      }
      const apiClient = new ApiClient(appContext)
      const result = await apiClient.dataFeeds.flagArticle(
        {
          dataFeedId,
          articleId,
          flaggedContent
        }
      )
      if (result.errors) {
        console.log(result.errors)
        return
      }
      const updatedFeedArticles = articles.map((article) => {
        if (article.articleId === articleId) {
          article.flaggedContent = flaggedContent
        }
        return article
      })
      setArticles(updatedFeedArticles)
    },
    [appContext, dataFeedId, articles]
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
      getArticles()
    }
  }, [flagDataFeedArticle, getArticles, searchParams, setSearchParams])

  useEffect(() => {
    if (dataFeedId) {
      getArticles()
    }
  }, [dataFeedId, getArticles])

  return (
    <Container>
      {tableAlertMessage !== undefined && tableAlertMessage.length > 0 ? (
        <Alert type={tableAlertType}>{tableAlertMessage}</Alert>
      ) : (
        <></>
      )}
      <Table
        columnDefinitions={ArticlesTableColumnDefiniton(
          flagDataFeedArticle
        )}
        columnDisplay={DataFeedArticlesTableColumnDisplay()}
        resizableColumns
        items={articles}
        loading={loading}
        trackBy="articleId"
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
