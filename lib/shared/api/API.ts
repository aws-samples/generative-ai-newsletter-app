/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateDataFeedInput = {
  url: string,
  title: string,
  description?: string | null,
  enabled: boolean,
  summarizationPrompt?: string | null,
  isPrivate?: boolean | null,
};

export type DataFeed = {
  __typename: "DataFeed",
  id: string,
  account: Account,
  url?: string | null,
  feedType: DataFeedType,
  createdAt?: string | null,
  enabled?: boolean | null,
  articles?:  Array<Article | null > | null,
  title: string,
  description?: string | null,
  summarizationPrompt?: string | null,
  isPrivate: boolean,
  authGranted?: AuthGranted | null,
};

export type Account = {
  __typename: "Account",
  id: string,
};

export enum DataFeedType {
  RSS = "RSS",
  ATOM = "ATOM",
}


export type Article = {
  __typename: "Article",
  id: string,
  dataFeedId: string,
  dataFeed?: DataFeed | null,
  account: Account,
  url?: string | null,
  createdAt?: string | null,
  title: string,
  providedDescription?: string | null,
  providedCategories?: string | null,
  publishDate?: string | null,
  summarizationPrompt?: string | null,
  flaggedContent?: boolean | null,
  keywords?: string | null,
  shortSummary?: string | null,
  longSummary?: string | null,
  authGranted?: AuthGranted | null,
};

export enum AuthGranted {
  READ_ONLY = "READ_ONLY",
  SUBSCRIBE = "SUBSCRIBE",
  MANAGE = "MANAGE",
}


export type CreateNewsletterInput = {
  title: string,
  numberOfDaysToInclude: number,
  dataFeeds: Array< string >,
  isPrivate?: boolean | null,
  newsletterIntroPrompt?: string | null,
  articleSummaryType?: ArticleSummaryType | null,
  newsletterStyle?: string | null,
};

export enum ArticleSummaryType {
  SHORT_SUMMARY = "SHORT_SUMMARY",
  LONG_SUMMARY = "LONG_SUMMARY",
  KEYWORDS = "KEYWORDS",
}


export type Newsletter = {
  __typename: "Newsletter",
  id: string,
  account?: Account | null,
  title?: string | null,
  numberOfDaysToInclude?: number | null,
  subscriberCount?: number | null,
  dataFeedIds?: Array< string > | null,
  dataFeeds?:  Array<DataFeed | null > | null,
  isPrivate?: boolean | null,
  createdAt?: string | null,
  newsletterIntroPrompt?: string | null,
  articleSummaryType?: ArticleSummaryType | null,
  newsletterStyle?: string | null,
  subscribers?:  Array<User | null > | null,
  currentUserSubscribed?: boolean | null,
  authGranted?: AuthGranted | null,
  scheduleId?: string | null,
};

export type User = {
  __typename: "User",
  id: string,
  account?: Account | null,
};

export type SubscribeToNewsletterInput = {
  id: string,
};

export type UnsubscribeFromNewsletterInput = {
  id: string,
};

export type UpdateNewsletterInput = {
  id: string,
  title?: string | null,
  numberOfDaysToInclude?: number | null,
  dataFeeds?: Array< string | null > | null,
  isPrivate?: boolean | null,
  newsletterIntroPrompt?: string | null,
  articleSummaryType?: string | null,
  newsletterStyle?: string | null,
};

export type UpdateDataFeedInput = {
  id: string,
  url?: string | null,
  enabled?: boolean | null,
  title?: string | null,
  description?: string | null,
  summarizationPrompt?: string | null,
  isPrivate?: boolean | null,
};

export type FlagArticleInput = {
  id: string,
  dataFeedId: string,
  flaggedContent: boolean,
};

export type ExternalUnsubscribeFromNewsletter = {
  id: string,
  userId: string,
};

export type ListNewslettersInput = {
  includeDiscoverable?: boolean | null,
  includeOwned?: boolean | null,
  includeShared?: boolean | null,
};

export type Newsletters = {
  __typename: "Newsletters",
  items?:  Array<Newsletter | null > | null,
  nextToken?: string | null,
};

export type GetNewsletterInput = {
  id: string,
};

export type ListDataFeedsInput = {
  includeDiscoverable?: boolean | null,
  includeOwned?: boolean | null,
  includeShared?: boolean | null,
};

export type DataFeeds = {
  __typename: "DataFeeds",
  items?:  Array<DataFeed | null > | null,
  nextToken?: string | null,
};

export type GetDataFeedInput = {
  id: string,
};

export type ListArticlesInput = {
  id: string,
};

export type Articles = {
  __typename: "Articles",
  items:  Array<Article | null >,
  nextToken?: string | null,
};

export type GetPublicationInput = {
  id: string,
  newsletterId: string,
};

export type Publication = {
  __typename: "Publication",
  id: string,
  newsletterId?: string | null,
  account?: Account | null,
  createdAt?: string | null,
  filePath?: string | null,
};

export type ListPublicationsInput = {
  id: string,
};

export type Publications = {
  __typename: "Publications",
  items?:  Array<Publication | null > | null,
  nextToken?: string | null,
};

export type CheckSubscriptionToNewsletterInput = {
  id: string,
};

export type CanUpdateNewsletterInput = {
  id: string,
};

export type CanUpdateDataFeedInput = {
  id: string,
};

export type GetNewsletterSubscriberStatsInput = {
  id: string,
};

export type NewsletterSubscriberStats = {
  __typename: "NewsletterSubscriberStats",
  id: string,
  count?: number | null,
};

export type CreateDataFeedMutationVariables = {
  input: CreateDataFeedInput,
};

export type CreateDataFeedMutation = {
  createDataFeed?:  {
    __typename: "DataFeed",
    id: string,
    account:  {
      __typename: "Account",
      id: string,
    },
    url?: string | null,
    feedType: DataFeedType,
    createdAt?: string | null,
    enabled?: boolean | null,
    articles?:  Array< {
      __typename: "Article",
      id: string,
      dataFeedId: string,
      url?: string | null,
      createdAt?: string | null,
      title: string,
      providedDescription?: string | null,
      providedCategories?: string | null,
      publishDate?: string | null,
      summarizationPrompt?: string | null,
      flaggedContent?: boolean | null,
      keywords?: string | null,
      shortSummary?: string | null,
      longSummary?: string | null,
      authGranted?: AuthGranted | null,
    } | null > | null,
    title: string,
    description?: string | null,
    summarizationPrompt?: string | null,
    isPrivate: boolean,
    authGranted?: AuthGranted | null,
  } | null,
};

export type CreateNewsletterMutationVariables = {
  input: CreateNewsletterInput,
};

export type CreateNewsletterMutation = {
  createNewsletter?:  {
    __typename: "Newsletter",
    id: string,
    account?:  {
      __typename: "Account",
      id: string,
    } | null,
    title?: string | null,
    numberOfDaysToInclude?: number | null,
    subscriberCount?: number | null,
    dataFeedIds?: Array< string > | null,
    dataFeeds?:  Array< {
      __typename: "DataFeed",
      id: string,
      url?: string | null,
      feedType: DataFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
      title: string,
      description?: string | null,
      summarizationPrompt?: string | null,
      isPrivate: boolean,
      authGranted?: AuthGranted | null,
    } | null > | null,
    isPrivate?: boolean | null,
    createdAt?: string | null,
    newsletterIntroPrompt?: string | null,
    articleSummaryType?: ArticleSummaryType | null,
    newsletterStyle?: string | null,
    subscribers?:  Array< {
      __typename: "User",
      id: string,
    } | null > | null,
    currentUserSubscribed?: boolean | null,
    authGranted?: AuthGranted | null,
    scheduleId?: string | null,
  } | null,
};

export type SubscribeToNewsletterMutationVariables = {
  input: SubscribeToNewsletterInput,
};

export type SubscribeToNewsletterMutation = {
  subscribeToNewsletter?: boolean | null,
};

export type UnsubscribeFromNewsletterMutationVariables = {
  input?: UnsubscribeFromNewsletterInput | null,
};

export type UnsubscribeFromNewsletterMutation = {
  unsubscribeFromNewsletter?: boolean | null,
};

export type UpdateNewsletterMutationVariables = {
  input: UpdateNewsletterInput,
};

export type UpdateNewsletterMutation = {
  updateNewsletter?: boolean | null,
};

export type UpdateDataFeedMutationVariables = {
  input: UpdateDataFeedInput,
};

export type UpdateDataFeedMutation = {
  updateDataFeed?: boolean | null,
};

export type FlagArticleMutationVariables = {
  input: FlagArticleInput,
};

export type FlagArticleMutation = {
  flagArticle?: boolean | null,
};

export type ExternalUnsubscribeFromNewsletterMutationVariables = {
  input?: ExternalUnsubscribeFromNewsletter | null,
};

export type ExternalUnsubscribeFromNewsletterMutation = {
  externalUnsubscribeFromNewsletter?: boolean | null,
};

export type ListNewslettersQueryVariables = {
  input?: ListNewslettersInput | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type ListNewslettersQuery = {
  listNewsletters?:  {
    __typename: "Newsletters",
    items?:  Array< {
      __typename: "Newsletter",
      id: string,
      title?: string | null,
      numberOfDaysToInclude?: number | null,
      subscriberCount?: number | null,
      dataFeedIds?: Array< string > | null,
      isPrivate?: boolean | null,
      createdAt?: string | null,
      newsletterIntroPrompt?: string | null,
      articleSummaryType?: ArticleSummaryType | null,
      newsletterStyle?: string | null,
      currentUserSubscribed?: boolean | null,
      authGranted?: AuthGranted | null,
      scheduleId?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetNewsletterQueryVariables = {
  input?: GetNewsletterInput | null,
};

export type GetNewsletterQuery = {
  getNewsletter?:  {
    __typename: "Newsletter",
    id: string,
    account?:  {
      __typename: "Account",
      id: string,
    } | null,
    title?: string | null,
    numberOfDaysToInclude?: number | null,
    subscriberCount?: number | null,
    dataFeedIds?: Array< string > | null,
    dataFeeds?:  Array< {
      __typename: "DataFeed",
      id: string,
      url?: string | null,
      feedType: DataFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
      title: string,
      description?: string | null,
      summarizationPrompt?: string | null,
      isPrivate: boolean,
      authGranted?: AuthGranted | null,
    } | null > | null,
    isPrivate?: boolean | null,
    createdAt?: string | null,
    newsletterIntroPrompt?: string | null,
    articleSummaryType?: ArticleSummaryType | null,
    newsletterStyle?: string | null,
    subscribers?:  Array< {
      __typename: "User",
      id: string,
    } | null > | null,
    currentUserSubscribed?: boolean | null,
    authGranted?: AuthGranted | null,
    scheduleId?: string | null,
  } | null,
};

export type ListDataFeedsQueryVariables = {
  input?: ListDataFeedsInput | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type ListDataFeedsQuery = {
  listDataFeeds?:  {
    __typename: "DataFeeds",
    items?:  Array< {
      __typename: "DataFeed",
      id: string,
      url?: string | null,
      feedType: DataFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
      title: string,
      description?: string | null,
      summarizationPrompt?: string | null,
      isPrivate: boolean,
      authGranted?: AuthGranted | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetDataFeedQueryVariables = {
  input?: GetDataFeedInput | null,
};

export type GetDataFeedQuery = {
  getDataFeed?:  {
    __typename: "DataFeed",
    id: string,
    account:  {
      __typename: "Account",
      id: string,
    },
    url?: string | null,
    feedType: DataFeedType,
    createdAt?: string | null,
    enabled?: boolean | null,
    articles?:  Array< {
      __typename: "Article",
      id: string,
      dataFeedId: string,
      url?: string | null,
      createdAt?: string | null,
      title: string,
      providedDescription?: string | null,
      providedCategories?: string | null,
      publishDate?: string | null,
      summarizationPrompt?: string | null,
      flaggedContent?: boolean | null,
      keywords?: string | null,
      shortSummary?: string | null,
      longSummary?: string | null,
      authGranted?: AuthGranted | null,
    } | null > | null,
    title: string,
    description?: string | null,
    summarizationPrompt?: string | null,
    isPrivate: boolean,
    authGranted?: AuthGranted | null,
  } | null,
};

export type ListArticlesQueryVariables = {
  input?: ListArticlesInput | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type ListArticlesQuery = {
  listArticles?:  {
    __typename: "Articles",
    items:  Array< {
      __typename: "Article",
      id: string,
      dataFeedId: string,
      url?: string | null,
      createdAt?: string | null,
      title: string,
      providedDescription?: string | null,
      providedCategories?: string | null,
      publishDate?: string | null,
      summarizationPrompt?: string | null,
      flaggedContent?: boolean | null,
      keywords?: string | null,
      shortSummary?: string | null,
      longSummary?: string | null,
      authGranted?: AuthGranted | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetPublicationQueryVariables = {
  input?: GetPublicationInput | null,
};

export type GetPublicationQuery = {
  getPublication?:  {
    __typename: "Publication",
    id: string,
    newsletterId?: string | null,
    account?:  {
      __typename: "Account",
      id: string,
    } | null,
    createdAt?: string | null,
    filePath?: string | null,
  } | null,
};

export type ListPublicationsQueryVariables = {
  input?: ListPublicationsInput | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type ListPublicationsQuery = {
  listPublications?:  {
    __typename: "Publications",
    items?:  Array< {
      __typename: "Publication",
      id: string,
      newsletterId?: string | null,
      createdAt?: string | null,
      filePath?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type CheckSubscriptionToNewsletterQueryVariables = {
  input?: CheckSubscriptionToNewsletterInput | null,
};

export type CheckSubscriptionToNewsletterQuery = {
  checkSubscriptionToNewsletter?: boolean | null,
};

export type ListUserSubscriptionsQueryVariables = {
  nextToken?: string | null,
  limit?: number | null,
};

export type ListUserSubscriptionsQuery = {
  listUserSubscriptions?:  {
    __typename: "Newsletters",
    items?:  Array< {
      __typename: "Newsletter",
      id: string,
      title?: string | null,
      numberOfDaysToInclude?: number | null,
      subscriberCount?: number | null,
      dataFeedIds?: Array< string > | null,
      isPrivate?: boolean | null,
      createdAt?: string | null,
      newsletterIntroPrompt?: string | null,
      articleSummaryType?: ArticleSummaryType | null,
      newsletterStyle?: string | null,
      currentUserSubscribed?: boolean | null,
      authGranted?: AuthGranted | null,
      scheduleId?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type CanUpdateNewsletterQueryVariables = {
  input?: CanUpdateNewsletterInput | null,
};

export type CanUpdateNewsletterQuery = {
  canUpdateNewsletter?: boolean | null,
};

export type CanUpdateDataFeedQueryVariables = {
  input?: CanUpdateDataFeedInput | null,
};

export type CanUpdateDataFeedQuery = {
  canUpdateDataFeed?: boolean | null,
};

export type GetNewsletterSubscriberStatsQueryVariables = {
  input?: GetNewsletterSubscriberStatsInput | null,
};

export type GetNewsletterSubscriberStatsQuery = {
  getNewsletterSubscriberStats?:  {
    __typename: "NewsletterSubscriberStats",
    id: string,
    count?: number | null,
  } | null,
};
