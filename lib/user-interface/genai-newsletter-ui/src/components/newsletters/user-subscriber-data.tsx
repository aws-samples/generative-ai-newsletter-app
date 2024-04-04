/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../common/app-context'
import { useParams } from 'react-router-dom'
import { ApiClient } from '../../common/api'
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  SpaceBetween,
  StatusIndicator
} from '@cloudscape-design/components'

export default function UserSubscriberData() {
  const appContext = useContext(AppContext)
  const { newsletterId } = useParams()
  const [userSubscriberCount, setUserSubscriberCount] = useState<number>(0)
  const [isCurrentUserSubscribed, setIsCurrentUserSubscribed] =
    useState<boolean>(false)
  const [subscriberCountLoading, setSubscriberCountLoading] =
    useState<boolean>(true)
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
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.newsletters.getNewsletterSubscriberStats({
      newsletterId
    })
    if (result.errors) {
      return
    }
    setUserSubscriberCount(
      result.data.getNewsletterSubscriberStats?.subscriberCount ?? 0
    )
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
    const apiClient = new ApiClient(appContext)
    const result =
      await apiClient.newsletters.getUserSubscriptionStatus({ newsletterId })
    if (result.errors) {
      return
    }
    setIsCurrentUserSubscribed(
      result.data.getUserSubscriptionStatus ?? false
    )
    setSubscriptionStatusLoading(false)
  }, [appContext, newsletterId])

  const subscribeUserToNewsletter = useCallback(async () => {
    setSubscriberCountLoading(true)
    setSubscriptionStatusLoading(true)
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.newsletters.subscribeToNewsletter({
      newsletterId
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
    setSubscriberCountLoading(true)
    setSubscriptionStatusLoading(true)
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.newsletters.unsubscribeFromNewsletter({
      newsletterId
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
