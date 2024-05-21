/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import {
  FormField,
  Input,
  Select,
  SpaceBetween,
  Toggle
} from '@cloudscape-design/components'
import { ArticleSummaryType } from '../../../../../../shared/api/API'
import { ArticleSummaryTypeLabel } from '../../../common/types'

interface NewsletterDetailsFormProps {
  title: string
  setTitle: (title: string) => void
  isPrivate: boolean
  setIsPrivate: (isPrivate: boolean) => void
  numberOfDaysToInclude: number
  setNumberOfDaysToInclude: (numberOfDaysToInclude: number) => void
  articleSummaryType: ArticleSummaryType
  setArticleSummaryType: (articleSummaryType: ArticleSummaryType) => void
  titleError: string
  numberOfDaysToIncludeError: string
}

export default function NewsletterDetailsForm(
  props: NewsletterDetailsFormProps
) {
  const {
    title,
    setTitle,
    isPrivate,
    setIsPrivate,
    numberOfDaysToInclude,
    setNumberOfDaysToInclude,
    articleSummaryType: contentSummaryConfiguration,
    setArticleSummaryType: setContentSummaryConfiguration,
    numberOfDaysToIncludeError,
    titleError
  } = props
  return (
    <SpaceBetween size="l" direction="vertical">
      <FormField label="Newsletter Title" errorText={titleError}>
        <Input value={title} onChange={(e) => setTitle(e.detail.value)} />
      </FormField>
      <FormField
        label="Private"
        description="Private newsletters are not discoverable. Turning off private makes the newsletter discoverable."
      >
        <Toggle
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.detail.checked)}
        >
          Private Newsletter
        </Toggle>
      </FormField>
      <FormField
        label="Number of days between Newsletter Publications"
        description="How many days between each newsletter publication sent?"
        errorText={numberOfDaysToIncludeError}
      >
        <Input
          value={numberOfDaysToInclude.toString()}
          onChange={(e) => {
            if (e.detail.value.length < 1) {
              setNumberOfDaysToInclude(0)
            } else {
              setNumberOfDaysToInclude(parseInt(e.detail.value))
            }
          }}
        />
      </FormField>
      <FormField
        label="Content Summary Configuration"
        description="Do you want to use just a few keywords,
                         a single sentence summary or a multi-paragraph summary for each item included in the newsletter?"
      >
        <Select
          selectedOption={{
            label: ArticleSummaryTypeLabel(contentSummaryConfiguration),
            value: contentSummaryConfiguration
          }}
          onChange={({ detail }) => {
            setContentSummaryConfiguration(
              (detail.selectedOption.value as ArticleSummaryType) ??
                ArticleSummaryType.KEYWORDS
            )
          }}
          options={[
            {
              label: ArticleSummaryTypeLabel(ArticleSummaryType.KEYWORDS),
              value: ArticleSummaryType.KEYWORDS
            },
            {
              label: ArticleSummaryTypeLabel(ArticleSummaryType.SHORT_SUMMARY),
              value: ArticleSummaryType.SHORT_SUMMARY
            },
            {
              label: ArticleSummaryTypeLabel(ArticleSummaryType.LONG_SUMMARY),
              value: ArticleSummaryType.LONG_SUMMARY
            }
          ]}
        />
      </FormField>
    </SpaceBetween>
  )
}
