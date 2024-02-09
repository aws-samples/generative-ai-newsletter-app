import { type MultiSizeFormattedResponse } from './prompt-processing'

export interface ArticleData {
  title: string
  url: string
  content: MultiSizeFormattedResponse
  createdAt: string
  flagLink?: string
}
