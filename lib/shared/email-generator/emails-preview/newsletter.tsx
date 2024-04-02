import type React from 'react'
import { ArticleSummaryType } from '../../api'
import { MultiSizeFormattedResponse } from '../../prompts/prompt-processing'
import NewsletterEmail from '../emails/newsletter'

export default function NewsletterEmailWrapper (): React.ReactElement {
  const content = new MultiSizeFormattedResponse({
    keywords: 'Apple, Banana, Smoothie',
    shortSummary:
      'This is a short summary about an article that could potentially be really interesting!',
    longSummary:
      "This is a long summary about an article that could potentially be really interesting! Typically the text here could span up to 2 paragraphs. But this one probably won't!"
  })
  return (
    <NewsletterEmail
      appHostName="XXXX"
      newsletterId='xxxxxx'
      title="The Sample Wrapper!"
      newsletterSummary={content}
      articleSummaryType={ArticleSummaryType.SHORT_SUMMARY}
      articles={[
        {
          content,
          title: 'Sample Article A',
          url: '#',
          flagLink: '#',
          createdAt: ''
        },
        {
          content,
          title: 'Sample Article',
          url: '#',
          flagLink: '#',
          createdAt: ''
        },
        {
          content,
          title: 'Sample Article',
          url: '#',
          flagLink: '#',
          createdAt: ''
        }
      ]}
    />
  )
}
