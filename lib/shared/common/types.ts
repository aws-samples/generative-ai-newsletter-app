import { type ArticleSummaryType } from '../../shared/api/API'
import {
  type ArticleData,
  type MultiSizeFormattedResponse
} from '../prompts'
import { type NewsletterStyle } from './newsletter-style'

export interface ReadAuthCheckInput {
  resolverName: string
  user: {
    userId: string
    accountId: string
  }
  data: Record<string, any>
}

export interface ListFilterAuthInput {
  resolverName: string
  user: {
    userId: string
    accountId: string
  }
  data: Record<string, any>
  dataKey: string
}

export interface CreateAuthCheckInput {
  resolverName: string
  user: {
    userId: string
    accountId: string
  }
}
export interface FeedArticle {
  link: string
  title: string
  guid: string
  subscriptionId?: string
  description: string
  publishDate: string
  categories?: string
}

export enum SubscriberType {
  COGNITO_SUBSCRIBER = 'cognito_subscriber',
  EXTERNAL_SUBSCRIBER = 'external_subscriber'
}

export interface PinpointEmailConfig {
  verifiedIdentity: string
  senderAddress: string
  senderName: string
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
