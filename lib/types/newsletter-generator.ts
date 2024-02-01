export enum SubscriberType {
  COGNITO_SUBSCRIBER = 'cognito_subscriber',
  EXTERNAL_SUBSCRIBER = 'external_subscriber'
}

export interface ArticleData {
  title: string
  url: string
  content: string
  createdAt: string
  flagLink?: string
}
