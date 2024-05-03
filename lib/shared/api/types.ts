/* eslint-disable */
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  AWSDate: { input: any; output: any }
  AWSDateTime: { input: any; output: any }
  AWSEmail: { input: any; output: any }
  AWSIPAddress: { input: any; output: any }
  AWSJSON: { input: any; output: any }
  AWSPhone: { input: any; output: any }
  AWSTime: { input: any; output: any }
  AWSTimestamp: { input: any; output: any }
  AWSURL: { input: any; output: any }
}

export type Account = {
  __typename?: 'Account'
  id: Scalars['ID']['output']
}

export type Article = {
  __typename?: 'Article'
  account?: Maybe<Account>
  authGranted?: Maybe<AuthGranted>
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>
  dataFeed?: Maybe<DataFeed>
  dataFeedId: Scalars['ID']['output']
  flaggedContent?: Maybe<Scalars['Boolean']['output']>
  id: Scalars['ID']['output']
  keywords?: Maybe<Scalars['String']['output']>
  longSummary?: Maybe<Scalars['String']['output']>
  providedCategories?: Maybe<Scalars['String']['output']>
  providedDescription?: Maybe<Scalars['String']['output']>
  publishDate?: Maybe<Scalars['AWSDateTime']['output']>
  shortSummary?: Maybe<Scalars['String']['output']>
  summarizationPrompt?: Maybe<Scalars['String']['output']>
  title: Scalars['String']['output']
  url?: Maybe<Scalars['String']['output']>
}

export enum ArticleSummaryType {
  Keywords = 'KEYWORDS',
  LongSummary = 'LONG_SUMMARY',
  ShortSummary = 'SHORT_SUMMARY'
}

export type Articles = {
  __typename?: 'Articles'
  items: Array<Maybe<Article>>
  nextToken?: Maybe<Scalars['String']['output']>
}

export enum AuthGranted {
  Manage = 'MANAGE',
  ReadOnly = 'READ_ONLY',
  Subscribe = 'SUBSCRIBE'
}

export type CheckSubscriptionToNewsletterInput = {
  id: Scalars['ID']['input']
}

export type CreateDataFeedInput = {
  description?: InputMaybe<Scalars['String']['input']>
  enabled: Scalars['Boolean']['input']
  isPrivate?: InputMaybe<Scalars['Boolean']['input']>
  summarizationPrompt?: InputMaybe<Scalars['String']['input']>
  title: Scalars['String']['input']
  url: Scalars['String']['input']
}

export type CreateNewsletterInput = {
  articleSummaryType?: InputMaybe<ArticleSummaryType>
  dataFeeds: Array<Scalars['ID']['input']>
  isPrivate?: InputMaybe<Scalars['Boolean']['input']>
  newsletterIntroPrompt?: InputMaybe<Scalars['String']['input']>
  newsletterStyle?: InputMaybe<Scalars['AWSJSON']['input']>
  numberOfDaysToInclude: Scalars['Int']['input']
  title: Scalars['String']['input']
}

export type DataFeed = {
  __typename?: 'DataFeed'
  account: Scalars['ID']['output']
  articles?: Maybe<Array<Maybe<Article>>>
  authGranted?: Maybe<AuthGranted>
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>
  description?: Maybe<Scalars['String']['output']>
  enabled?: Maybe<Scalars['Boolean']['output']>
  feedType: DataFeedType
  id: Scalars['ID']['output']
  isPrivate: Scalars['Boolean']['output']
  summarizationPrompt?: Maybe<Scalars['String']['output']>
  title: Scalars['String']['output']
  url?: Maybe<Scalars['String']['output']>
}

export enum DataFeedType {
  Atom = 'ATOM',
  Rss = 'RSS'
}

export type DataFeeds = {
  __typename?: 'DataFeeds'
  items?: Maybe<Array<Maybe<DataFeed>>>
  nextToken?: Maybe<Scalars['String']['output']>
}

export type ExternalUnsubscribeFromNewsletter = {
  id: Scalars['ID']['input']
  userId: Scalars['ID']['input']
}

export type FlagArticleInput = {
  dataFeedId: Scalars['ID']['input']
  flaggedContent: Scalars['Boolean']['input']
  id: Scalars['ID']['input']
}

export type GetDataFeedInput = {
  id: Scalars['ID']['input']
}

export type GetNewsletterInput = {
  id: Scalars['ID']['input']
}

export type GetPublicationInput = {
  id: Scalars['ID']['input']
  newsletterId: Scalars['ID']['input']
}

export type ListArticlesInput = {
  id: Scalars['ID']['input']
}

export type ListDataFeedsInput = {
  includeDiscoverable?: InputMaybe<Scalars['Boolean']['input']>
  includeOwned?: InputMaybe<Scalars['Boolean']['input']>
  includeShared?: InputMaybe<Scalars['Boolean']['input']>
}

export type ListNewslettersInput = {
  includeDiscoverable?: InputMaybe<Scalars['Boolean']['input']>
  includeOwned?: InputMaybe<Scalars['Boolean']['input']>
  includeShared?: InputMaybe<Scalars['Boolean']['input']>
}

export type ListPublicationsInput = {
  id: Scalars['ID']['input']
}

export type Mutation = {
  __typename?: 'Mutation'
  createDataFeed?: Maybe<DataFeed>
  createNewsletter?: Maybe<Newsletter>
  externalUnsubscribeFromNewsletter?: Maybe<Scalars['Boolean']['output']>
  flagArticle?: Maybe<Scalars['Boolean']['output']>
  subscribeToNewsletter?: Maybe<Scalars['Boolean']['output']>
  unsubscribeFromNewsletter?: Maybe<Scalars['Boolean']['output']>
  updateDataFeed?: Maybe<Scalars['Boolean']['output']>
  updateNewsletter?: Maybe<Scalars['Boolean']['output']>
}

export type MutationCreateDataFeedArgs = {
  input: CreateDataFeedInput
}

export type MutationCreateNewsletterArgs = {
  input: CreateNewsletterInput
}

export type MutationExternalUnsubscribeFromNewsletterArgs = {
  input?: InputMaybe<ExternalUnsubscribeFromNewsletter>
}

export type MutationFlagArticleArgs = {
  input: FlagArticleInput
}

export type MutationSubscribeToNewsletterArgs = {
  input: SubscribeToNewsletterInput
}

export type MutationUnsubscribeFromNewsletterArgs = {
  input?: InputMaybe<UnsubscribeFromNewsletterInput>
}

export type MutationUpdateDataFeedArgs = {
  input: UpdateDataFeedInput
}

export type MutationUpdateNewsletterArgs = {
  input: UpdateNewsletterInput
}

export type Newsletter = {
  __typename?: 'Newsletter'
  account?: Maybe<Account>
  articleSummaryType?: Maybe<ArticleSummaryType>
  authGranted?: Maybe<AuthGranted>
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>
  currentUserSubscribed?: Maybe<Scalars['Boolean']['output']>
  dataFeedIds: Array<Scalars['ID']['output']>
  dataFeeds?: Maybe<Array<Maybe<DataFeed>>>
  id: Scalars['ID']['output']
  isPrivate?: Maybe<Scalars['Boolean']['output']>
  newsletterIntroPrompt?: Maybe<Scalars['String']['output']>
  newsletterStyle?: Maybe<Scalars['AWSJSON']['output']>
  numberOfDaysToInclude?: Maybe<Scalars['Int']['output']>
  scheduleId?: Maybe<Scalars['String']['output']>
  subscriberCount?: Maybe<Scalars['Int']['output']>
  subscribers?: Maybe<Array<Maybe<User>>>
  title?: Maybe<Scalars['String']['output']>
}

export type Newsletters = {
  __typename?: 'Newsletters'
  items: Array<Maybe<Newsletter>>
  nextToken?: Maybe<Scalars['String']['output']>
}

export type Publication = {
  __typename?: 'Publication'
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>
  htmlPath?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  newsletter: Newsletter
  textPath?: Maybe<Scalars['String']['output']>
}

export type Publications = {
  __typename?: 'Publications'
  items?: Maybe<Array<Maybe<Publication>>>
  nextToken?: Maybe<Scalars['String']['output']>
}

export type Query = {
  __typename?: 'Query'
  checkSubscriptionToNewsletter?: Maybe<Scalars['Boolean']['output']>
  getDataFeed?: Maybe<DataFeed>
  getNewsletter?: Maybe<Newsletter>
  getPublication?: Maybe<Publication>
  listArticles?: Maybe<Articles>
  listDataFeeds: DataFeeds
  listNewsletters: Newsletters
  listPublications: Publications
  listUserSubscriptions: Newsletters
}

export type QueryCheckSubscriptionToNewsletterArgs = {
  input?: InputMaybe<CheckSubscriptionToNewsletterInput>
}

export type QueryGetDataFeedArgs = {
  input?: InputMaybe<GetDataFeedInput>
}

export type QueryGetNewsletterArgs = {
  input?: InputMaybe<GetNewsletterInput>
}

export type QueryGetPublicationArgs = {
  input?: InputMaybe<GetPublicationInput>
}

export type QueryListArticlesArgs = {
  input?: InputMaybe<ListArticlesInput>
  limit?: InputMaybe<Scalars['Int']['input']>
  nextToken?: InputMaybe<Scalars['String']['input']>
}

export type QueryListDataFeedsArgs = {
  input?: InputMaybe<ListDataFeedsInput>
  limit?: InputMaybe<Scalars['Int']['input']>
  nextToken?: InputMaybe<Scalars['String']['input']>
}

export type QueryListNewslettersArgs = {
  input?: InputMaybe<ListNewslettersInput>
  limit?: InputMaybe<Scalars['Int']['input']>
  nextToken?: InputMaybe<Scalars['String']['input']>
}

export type QueryListPublicationsArgs = {
  input?: InputMaybe<ListPublicationsInput>
  limit?: InputMaybe<Scalars['Int']['input']>
  nextToken?: InputMaybe<Scalars['String']['input']>
}

export type QueryListUserSubscriptionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
  nextToken?: InputMaybe<Scalars['String']['input']>
}

export type SubscribeToNewsletterInput = {
  id: Scalars['ID']['input']
}

export type UnsubscribeFromNewsletterInput = {
  id: Scalars['ID']['input']
}

export type UpdateDataFeedInput = {
  description?: InputMaybe<Scalars['String']['input']>
  enabled?: InputMaybe<Scalars['Boolean']['input']>
  id: Scalars['ID']['input']
  isPrivate?: InputMaybe<Scalars['Boolean']['input']>
  summarizationPrompt?: InputMaybe<Scalars['String']['input']>
  title?: InputMaybe<Scalars['String']['input']>
  url?: InputMaybe<Scalars['String']['input']>
}

export type UpdateNewsletterInput = {
  articleSummaryType?: InputMaybe<Scalars['String']['input']>
  dataFeeds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>
  id: Scalars['ID']['input']
  isPrivate?: InputMaybe<Scalars['Boolean']['input']>
  newsletterIntroPrompt?: InputMaybe<Scalars['String']['input']>
  newsletterStyle?: InputMaybe<Scalars['AWSJSON']['input']>
  numberOfDaysToInclude?: InputMaybe<Scalars['Int']['input']>
  title?: InputMaybe<Scalars['String']['input']>
}

export type User = {
  __typename?: 'User'
  account?: Maybe<Account>
  id: Scalars['ID']['output']
}
