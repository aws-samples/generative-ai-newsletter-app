/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { FormField, Textarea } from '@cloudscape-design/components'

interface NewsletterIntroPromptProps {
  newsletterIntroPrompt: string
  setNewsletterIntroPrompt: (newsletterIntroPrompt: string) => void
}

export default function NewsletterIntroPrompt (
  props: NewsletterIntroPromptProps
) {
  const { newsletterIntroPrompt, setNewsletterIntroPrompt } = props
  return (
    <FormField
      label="Newsletter Introduction Prompt"
      description="The prompt used to influence your newsletter summary generation"
    >
      <Textarea
        value={newsletterIntroPrompt}
        onChange={(e) => setNewsletterIntroPrompt(e.detail.value)}
      />
    </FormField>
  )
}
