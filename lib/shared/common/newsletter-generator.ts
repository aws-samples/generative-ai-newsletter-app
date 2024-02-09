import { type ArticleSummaryType } from '@shared/api/API'
import { type ArticleData, type MultiSizeFormattedResponse } from '@shared/prompts'
import { type NewsletterStyle } from './newsletter-style'

export enum SubscriberType {
  COGNITO_SUBSCRIBER = 'cognito_subscriber',
  EXTERNAL_SUBSCRIBER = 'external_subscriber'
}

export interface NewsletterEmailProps {
  title?: string
  articles?: ArticleData[]
  newsletterSummary?: MultiSizeFormattedResponse
  appHostName?: string
  footerOverride?: string
  articleSummaryType?: ArticleSummaryType
  styleProps?: NewsletterStyle
  previewMode?: boolean
}
