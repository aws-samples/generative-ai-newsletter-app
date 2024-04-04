/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../../common/app-context'
import { ApiClient } from '../../common/api'
import {
  ArticleSummaryType,
  DataFeed,
  Newsletter
} from '../../../../../shared/api/API'
import BaseAppLayout from '../../components/base-app-layout'
import {
  BreadcrumbGroup,
  Button,
  Container,
  Header,
  SpaceBetween,
  SplitPanel,
  StatusIndicator
} from '@cloudscape-design/components'
import useOnFollow from '../../common/hooks/use-on-follow'
import NewsletterReviewForm from '../../components/newsletters/forms/newsletter-review'
import PublicationsTable from '../../components/newsletters/publications-table'
import UserSubscriberData from '../../components/newsletters/user-subscriber-data'
import BaseContentLayout from '../../components/base-content-layout'
import NewsletterPreview from '../../components/newsletters/preview'
import { NewsletterStyle } from '../../../../../shared/common/newsletter-style'

export default function NewsletterDetail() {
  const { newsletterId } = useParams()
  const navigate = useNavigate()
  const onFollow = useOnFollow()
  const appContext = useContext(AppContext)
  const [canManageNewsletter, setCanManageNewsletter] = useState<boolean>(false)
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [newsletterStyle, setNewsletterStyle] = useState<NewsletterStyle>(
    new NewsletterStyle()
  )
  const [splitPanelOpen, setSplitPanelOpen] = useState<boolean>(false)



  const getNewsletter = useCallback(async () => {
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.newsletters.getNewsletter({ newsletterId })
    if (result.errors) {
      console.error(result.errors)
    } else {
      setNewsletter(result.data.getNewsletter)
      if (
        result.data.getNewsletter.newsletterStyle !== null &&
        result.data.getNewsletter.newsletterStyle !== undefined
      ) {
        setNewsletterStyle(
          JSON.parse(result.data.getNewsletter.newsletterStyle)
        )
      }
      let canManageNewsletterX = false
      try {
        const result = await apiClient.newsletters.canManageNewsletter({ newsletterId })
        if (result.errors) {
          canManageNewsletterX = false
          setCanManageNewsletter(canManageNewsletterX)
        } else {
          canManageNewsletterX = result.data.canManageNewsletter
          setCanManageNewsletter(canManageNewsletterX)
        }
      } catch (e) {
        canManageNewsletterX = false
        setCanManageNewsletter(canManageNewsletterX)
      }
      const feeds: DataFeed[] = []
      if (canManageNewsletterX && result.data?.getNewsletter?.dataFeedIds !== null && result.data.getNewsletter.dataFeedIds !== undefined && result.data.getNewsletter.dataFeedIds.length > 0) {
        for (const dataFeedId of result.data.getNewsletter.dataFeedIds) {
          const dataFeedResult = await apiClient.dataFeeds.getDataFeed({ dataFeedId })
          if (dataFeedResult.errors) {
            console.error(dataFeedResult.errors)
          }
          const feed = dataFeedResult.data.getDataFeed
          if (feed !== undefined && feed !== null) {
            feeds.push(feed)
          }

        }
        const fullNewsletter: Newsletter = {
          ...result.data.getNewsletter,
          dataFeeds: feeds
        }
        setNewsletter(fullNewsletter)
      }
    }
  }, [appContext, setCanManageNewsletter, newsletterId])

  useEffect(() => {
    getNewsletter()
  }, [newsletterId, getNewsletter])

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
              text: 'Newsletters',
              href: '/newsletters'
            },
            {
              text: 'Newsletter Details',
              href: `/newsletters/${newsletterId}`
            }
          ]}
        />
      }
      splitPanelPreferences={{ position: 'side' }}
      splitPanelOpen={splitPanelOpen}
      onSplitPanelToggle={({ detail }) => {
        setSplitPanelOpen(detail.open)
      }}
      splitPanel={
        <SplitPanel
          header="Preview Newsletter Style"
          hidePreferencesButton={true}
        >
          <NewsletterPreview previewMode={true} styleProps={newsletterStyle} />
        </SplitPanel>
      }
      content={
        <BaseContentLayout
          header={<Header
            variant="awsui-h1-sticky"
            description="Browse the details of the Data Feed"
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button
                  disabled={!canManageNewsletter}
                  onClick={() => {
                    navigate(`/newsletters/${newsletterId}/edit`)
                  }}
                >
                  Edit
                </Button>
                <Button disabled>Delete (Not Yet Implemented)</Button>
                <Button
                  iconAlign="right"
                  variant="primary"
                  onClick={() => {
                    setSplitPanelOpen(
                      !splitPanelOpen
                    )
                  }}
                >
                  {splitPanelOpen
                    ? 'Hide Preview'
                    : 'Show Preview'}
                </Button>
              </SpaceBetween>
            }
          >
            Newsletter Details
          </Header>}
        >
          <SpaceBetween direction="vertical" size="m">
            <Container>
              {newsletter != undefined ? (
                <NewsletterReviewForm
                  isPrivate={newsletter.isPrivate ?? true}
                  numberOfDaysToInclude={newsletter.numberOfDaysToInclude}
                  selectedDataFeeds={
                    newsletter.dataFeeds !== null ? newsletter.dataFeeds as DataFeed[] : []
                  }
                  title={newsletter.title}
                  formMode="detail"
                  newsletterIntroPrompt={
                    newsletter.newsletterIntroPrompt !== null &&
                      newsletter.newsletterIntroPrompt !== undefined &&
                      newsletter.newsletterIntroPrompt.length > 0
                      ? newsletter.newsletterIntroPrompt
                      : undefined
                  }
                  articleSummaryType={
                    newsletter.articleSummaryType !== undefined &&
                      newsletter.articleSummaryType !== null
                      ? newsletter.articleSummaryType
                      : ArticleSummaryType.SHORT_SUMMARY
                  }
                />
              ) : (
                <>
                  <StatusIndicator type="loading">Loading...</StatusIndicator>
                </>
              )}
            </Container>
            <Container>
              <UserSubscriberData />
            </Container>
            <Container>
              <PublicationsTable />
            </Container>
          </SpaceBetween>
        </BaseContentLayout>
      }
    />
  )
}
