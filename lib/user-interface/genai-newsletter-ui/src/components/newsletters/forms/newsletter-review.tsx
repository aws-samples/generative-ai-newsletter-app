/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  Badge,
  Button,
  FormField,
  Header,
  Link,
  SpaceBetween,
  Toggle
} from '@cloudscape-design/components'
import { ArticleSummaryType, DataFeed } from '../../../../../../shared/api/API'
import { useNavigate, useParams } from 'react-router-dom'

interface NewsletterReviewForm {
  canManageNewsletter?: boolean
  title: string
  isPrivate: boolean
  numberOfDaysToInclude: number
  selectedDataFeeds: DataFeed[]
  formTitle?: string
  formDescription?: string
  formMode?: 'wizard' | 'detail'
  newsletterIntroPrompt?: string
  articleSummaryType: ArticleSummaryType
  templatePreview?: {
    splitPanelOpen: boolean
    setSplitPanelOpen: (open: boolean) => void
  }
}

export default function NewsletterReviewForm (props: NewsletterReviewForm) {
  const navigate = useNavigate()
  const { newsletterId } = useParams()
  const {
    title,
    isPrivate,
    numberOfDaysToInclude,
    selectedDataFeeds,
    formTitle,
    formDescription,
    formMode = 'wizard',
    newsletterIntroPrompt,
    articleSummaryType,
    templatePreview,
    canManageNewsletter = false
  } = props

  return (
    <SpaceBetween direction="vertical" size="l">
      <Header
        description={formDescription}
        actions={
          formMode === 'detail' && canManageNewsletter ? (
            <SpaceBetween size="s" direction="horizontal" alignItems="end">
              <Button
                iconName="edit"
                onClick={() => {
                  navigate(`/newsletters/${newsletterId}/edit`)
                }}
              >
                Edit Newsletter
              </Button>
              {templatePreview !== undefined ? (
                <Button
                  iconAlign="right"
                  variant="primary"
                  onClick={() => {
                    templatePreview.setSplitPanelOpen(
                      !templatePreview.splitPanelOpen
                    )
                  }}
                  iconName={
                    templatePreview.splitPanelOpen
                      ? 'angle-right'
                      : 'arrow-left'
                  }
                >
                  {templatePreview.splitPanelOpen
                    ? 'Hide Preview'
                    : 'Show Preview'}
                </Button>
              ) : (
                <></>
              )}
            </SpaceBetween>
          ) : null
        }
      >
        {formTitle}
      </Header>
      <FormField label="Newsletter Title">{title}</FormField>
      <FormField
        label="Private"
        description="A private newsletter isn't discoverable. Turning off private will make the newsletter discoverable by others."
      >
        <Toggle checked={isPrivate ?? true} disabled={true} />
      </FormField>
      <FormField
        label="Number of Days to Include"
        description="How many days will be included in the newsletter? This is also how often it is sent."
      >
        {numberOfDaysToInclude}
      </FormField>
      <FormField
        label="Content Summary Configuration"
        description="How will feed content be shown in the newsletter?"
      >
        <Badge>
          {articleSummaryType === ArticleSummaryType.SHORT_SUMMARY
            ? 'Short Summary'
            : articleSummaryType === ArticleSummaryType.LONG_SUMMARY
              ? 'Long Summary'
              : 'Keywords'}
        </Badge>
      </FormField>

      <FormField
        label="Data Feeds"
        description="The feeds that provide the content for the newsletter"
      >
        <ul>
          {selectedDataFeeds.map((dataFeed) => (
            <li key={`selected-datafeed-${dataFeed.id}`}>
              <Link href={`/feeds/${dataFeed.id}`} target="_blank">
                {dataFeed.title}
              </Link>
            </li>
          ))}
          {selectedDataFeeds.length === 0 && <li>No data feeds selected</li>}
        </ul>
      </FormField>
      <FormField
        label="Newsletter Intro Summary Prompt"
        description="This prompt helps influence how the Newsletter summary will be written."
      >
        {newsletterIntroPrompt && newsletterIntroPrompt.length > 0 ? (
          newsletterIntroPrompt
        ) : (
          <Badge color="grey">No custom prompt provided</Badge>
        )}
      </FormField>
    </SpaceBetween>
  )
}
