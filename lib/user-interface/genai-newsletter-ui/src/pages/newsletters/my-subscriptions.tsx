/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  BreadcrumbGroup,
  Container,
  Header
} from '@cloudscape-design/components'
import BaseAppLayout from '../../components/base-app-layout'
import useOnFollow from '../../common/hooks/use-on-follow'
import NewslettersTable from '../../components/newsletters/newsletters-table'
import BaseContentLayout from '../../components/base-content-layout'

export default function MyNewsletterSubscriptions() {
  const onFollow = useOnFollow()
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
              text: 'My Newsletter Subscriptions',
              href: '/newsletters/my-subscriptions'
            }
          ]}
        />
      }
      content={
        <BaseContentLayout
          header={
            <Header 
            variant='awsui-h1-sticky'
            description="View all the Newsletters that you are currently subscribed to that were created by you or others.">
              My Newsletter Subscriptions
            </Header>
          }
        >
          <Container>
            <NewslettersTable
              includeSubscriptions
            />
          </Container>
        </BaseContentLayout>
      }
    />
  )
}
