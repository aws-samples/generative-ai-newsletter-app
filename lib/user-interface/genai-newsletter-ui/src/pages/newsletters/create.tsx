import { BreadcrumbGroup } from '@cloudscape-design/components'
import BaseAppLayout from '../../components/base-app-layout'
import useOnFollow from '../../common/hooks/use-on-follow'
import NewsletterWizard from '../../components/newsletters/forms/newsletter-wizard'
import BaseContentLayout from '../../components/base-content-layout'

export default function CreateNewsletter() {
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
      content={
        <BaseContentLayout>
          <NewsletterWizard />
        </BaseContentLayout>
      }
    />
  )
}
