/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../common/app-context'
import { useParams } from 'react-router-dom'
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  SpaceBetween,
  StatusIndicator
} from '@cloudscape-design/components'
import { checkSubscriptionToNewsletter, getNewsletterSubscriberStats } from '../../../../../shared/api/graphql/queries'
import { subscribeToNewsletter, unsubscribeFromNewsletter } from '../../../../../shared/api/graphql/mutations'
import { generateAuthorizedClient } from '../../common/helpers'

export default function UserSubscriberData () {
  const appContext = useContext(AppContext)
  const { newsletterId } = useParams()
  const [userSubscriberCount, setUserSubscriberCount] = useState<number>(0)
  const [isCurrentUserSubscribed, setIsCurrentUserSubscribed] =
    useState<boolean>(false)
  const [subscriberCountLoading, setSubscriberCountLoading] = useState<boolean>(true)
  const [subscriptionStatusLoading, setSubscriptionStatusLoading] =
    useState<boolean>(true)

  const getSubscriberStats = useCallback(async () => {
    setSubscriberCountLoading(true)
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      return
    }
    const client = await generateAuthorizedClient()
    const result = await client.graphql({
      query: getNewsletterSubscriberStats,
      variables: {
        input: {
          id: newsletterId
        }
      }
    })

    if (result.data.getNewsletterSubscriberStats?.count){
      setUserSubscriberCount(result.data.getNewsletterSubscriberStats?.count)
    }
    setSubscriberCountLoading(false)
  }, [appContext, newsletterId])

  const getCurrentUserSubscriptionStatus = useCallback(async () => {
    setSubscriptionStatusLoading(true)
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      return
    }
    const apiClient = await generateAuthorizedClient()
    const result = await apiClient.graphql({
      query: checkSubscriptionToNewsletter,
      variables: {
        input: {
          id: newsletterId
        }
      }
    })
    setIsCurrentUserSubscribed(result.data.checkSubscriptionToNewsletter ?? false)
    setSubscriptionStatusLoading(false)
  }, [appContext, newsletterId])

  const subscribeUserToNewsletter = useCallback(async () => {
    // setSubscriberCountLoading(true)
    setSubscriptionStatusLoading(true)
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      return
    }
    const apiClient = await generateAuthorizedClient()
    const result = await apiClient.graphql({
      query: subscribeToNewsletter,
      variables: {
        input: {
          id: newsletterId
        }
      }
    })
    if (result.errors) {
      return
    } else {
      setIsCurrentUserSubscribed(true)
    }
    setSubscriptionStatusLoading(false)
    getSubscriberStats()
  }, [appContext, getSubscriberStats, newsletterId])

  const unsubscribeUserFromNewsletter = useCallback(async () => {
    // setSubscriberCountLoading(true)
    setSubscriptionStatusLoading(true)
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      return
    }
    const apiClient = await generateAuthorizedClient()
    const result = await apiClient.graphql({
      query: unsubscribeFromNewsletter,
      variables: {
        input: {
          id: newsletterId
        }
      }
    })

    if (result.errors) {
      return
    } else {
      setIsCurrentUserSubscribed(false)
    }
    setSubscriptionStatusLoading(false)
    getSubscriberStats()
  }, [appContext, getSubscriberStats, newsletterId])

  useEffect(() => {
    getSubscriberStats()
    getCurrentUserSubscriptionStatus()
  }, [getCurrentUserSubscriptionStatus, getSubscriberStats])

  return (
    <Container>
      <ColumnLayout columns={2} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">Number of Subscribers</Box>
          <Box variant="awsui-value-large">
            {subscriberCountLoading ? (
              <StatusIndicator type="loading">Loading...</StatusIndicator>
            ) : (
              userSubscriberCount
            )}
          </Box>
        </div>
        <div>
          <Box variant="awsui-key-label">You are currently</Box>
          {subscriptionStatusLoading ? (
            <StatusIndicator type="loading">Loading...</StatusIndicator>
          ) : (
            <SpaceBetween direction="horizontal" size="xxl">
              <Box variant="h3">
                {isCurrentUserSubscribed ? 'Subscribed' : 'Not subscribed'}
              </Box>
              {isCurrentUserSubscribed ? (
                <Button onClick={unsubscribeUserFromNewsletter}>
                  Unsubscribe
                </Button>
              ) : (
                <Button onClick={subscribeUserToNewsletter}>Subscribe</Button>
              )}
            </SpaceBetween>
          )}
        </div>
      </ColumnLayout>
    </Container>
  )
}
