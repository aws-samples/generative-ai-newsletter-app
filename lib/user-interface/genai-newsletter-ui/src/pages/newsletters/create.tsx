import { BreadcrumbGroup, SplitPanel } from '@cloudscape-design/components'
import BaseAppLayout from '../../components/base-app-layout'
import useOnFollow from '../../common/hooks/use-on-follow'
import NewsletterWizard from '../../components/newsletters/forms/newsletter-wizard'
import BaseContentLayout from '../../components/base-content-layout'
import { useState } from 'react'
import NewsletterPreview from '../../components/newsletters/preview'
import { NewsletterStyle } from '../../../../../shared/common'

export default function CreateNewsletter() {
  const [splitPanelOpen, setSplitPanelOpen] = useState<boolean>(false)
  const [newsletterStyle, setNewsletterStyle] = useState<NewsletterStyle>(
    new NewsletterStyle()
  )
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
              text: 'Create Newsletter',
              href: '/newsletters/create'
            }
          ]}
        />
      }
      splitPanelOpen={splitPanelOpen}
      onSplitPanelToggle={({ detail }) => {
        setSplitPanelOpen(detail.open)
      }}
      splitPanelPreferences={{ position: 'side' }}
      splitPanel={
        <SplitPanel
          header="Preview Newsletter Style"
          hidePreferencesButton={true}
        >
          <NewsletterPreview previewMode={true} styleProps={newsletterStyle} />
        </SplitPanel>
      }
      content={
        <BaseContentLayout>
          <NewsletterWizard
            previewPane={{
              newsletterStyle,
              setNewsletterStyle,
              setSplitPanelOpen,
              splitPanelOpen
            }}
          />
        </BaseContentLayout>

      }
    />
  )
}
