/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../../common/app-context'
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
  StatusIndicator
} from '@cloudscape-design/components'
import useOnFollow from '../../common/hooks/use-on-follow'
import NewsletterReviewForm from '../../components/newsletters/forms/newsletter-review'
import PublicationsTable from '../../components/newsletters/publications-table'
import UserSubscriberData from '../../components/newsletters/user-subscriber-data'
import BaseContentLayout from '../../components/base-content-layout'
import {
  canUpdateNewsletter,
  getNewsletter
} from '../../../../../shared/api/graphql/queries'
import { generateAuthorizedClient } from '../../common/helpers'

export default function NewsletterDetail () {
  const { newsletterId } = useParams()
  const navigate = useNavigate()
  const onFollow = useOnFollow()
  const appContext = useContext(AppContext)
  const [canUpdateNewsletterVal, setCanUpdateNewsletterVal] =
    useState<boolean>(false)
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)

  const getNewsletterCall = useCallback(async () => {
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      return
    }
    const apiClient = await generateAuthorizedClient()
    const result = await apiClient.graphql({
      query: getNewsletter,
      variables: {
        input: {
          id: newsletterId
        }
      }
    })
    if (result.errors) {
      console.error(result.errors)
    } else {
      setNewsletter(result.data.getNewsletter as Newsletter)
    }
    try {
      const editResponse = await apiClient.graphql({
        query: canUpdateNewsletter,
        variables: {
          input: {
            id: newsletterId
          }
        }
      })
      if (editResponse.errors) {
        console.error(editResponse.errors)
      }
      if (editResponse.data.canUpdateNewsletter) {
        setCanUpdateNewsletterVal(true)
      }
    } catch (error) {
      console.error(error)
    }
  }, [appContext, newsletterId])

  useEffect(() => {
    getNewsletterCall()
  }, [newsletterId, getNewsletterCall])

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
      content={
        <BaseContentLayout
          header={
            <Header
              variant="awsui-h1-sticky"
              description="Browse the details of the Data Feed"
              actions={
                <SpaceBetween size="xs" direction="horizontal">
                  <Button
                    disabled={!canUpdateNewsletterVal}
                    onClick={() => {
                      navigate(`/newsletters/${newsletterId}/edit`)
                    }}
                  >
                    Edit
                  </Button>
                </SpaceBetween>
              }
            >
              Newsletter Details
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="m">
            <Container>
              {newsletter != undefined ? (
                <NewsletterReviewForm
                  isPrivate={newsletter.isPrivate ?? true}
                  numberOfDaysToInclude={newsletter.numberOfDaysToInclude ?? 0}
                  selectedDataFeeds={
                    newsletter.dataFeeds !== null
                      ? (newsletter.dataFeeds as DataFeed[])
                      : []
                  }
                  title={newsletter.title ?? ''}
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
