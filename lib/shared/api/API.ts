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
  dataFeedId: string,
  accountId?: string | null,
  url: string,
  feedType: DataFeedType,
  createdAt?: string | null,
  enabled?: boolean | null,
  articles?:  Array<Article | null > | null,
  title: string,
  description?: string | null,
  summarizationPrompt?: string | null,
  isPrivate: boolean,
};

export enum DataFeedType {
  RSS = "RSS",
  ATOM = "ATOM",
}


export type Article = {
  __typename: "Article",
  dataFeedId: string,
  articleId: string,
  accountId?: string | null,
  url: string,
  createdAt: string,
  title: string,
  providedDescription?: string | null,
  providedCategories?: string | null,
  publishDate?: string | null,
  summarizationPrompt?: string | null,
  flaggedContent?: boolean | null,
  articleSummary?: string | null,
  keywords?: string | null,
  shortSummary?: string | null,
  longSummary?: string | null,
};

export type CreateNewsletterInput = {
  title: string,
  numberOfDaysToInclude: number,
  dataFeedIds: Array< string >,
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
  newsletterId: string,
  accountId: string,
  title: string,
  numberOfDaysToInclude: number,
  dataFeedIds?: Array< string > | null,
  dataFeeds?:  Array<DataFeed | null > | null,
  isPrivate: boolean,
  scheduleId: string,
  createdAt: string,
  newsletterIntroPrompt?: string | null,
  articleSummaryType?: ArticleSummaryType | null,
  newsletterStyle?: string | null,
};

export type SubscribeToNewsletterInput = {
  newsletterId: string,
};

export type UnsubscribeFromNewsletterInput = {
  newsletterId: string,
};

export type ExternalUnsubscribeFromNewsletter = {
  newsletterId: string,
  userId: string,
};

export type UpdateNewsletterInput = {
  newsletterId: string,
  title?: string | null,
  numberOfDaysToInclude?: number | null,
  dataFeedIds?: Array< string | null > | null,
  isPrivate?: boolean | null,
  newsletterIntroPrompt?: string | null,
  articleSummaryType?: string | null,
  newsletterStyle?: string | null,
};

export type UpdateDataFeedInput = {
  dataFeedId: string,
  url?: string | null,
  enabled?: boolean | null,
  title: string,
  description?: string | null,
  summarizationPrompt?: string | null,
  isPrivate?: boolean | null,
};

export type FlagArticleInput = {
  dataFeedId: string,
  articleId: string,
  flaggedContent: boolean,
};

export type ListNewslettersInput = {
  includeDiscoverable?: boolean | null,
  includeOwned?: boolean | null,
  includeShared?: boolean | null,
};

export type Newsletters = {
  __typename: "Newsletters",
  newsletters:  Array<Newsletter >,
  nextToken?: string | null,
};

export type GetNewsletterInput = {
  newsletterId: string,
};

export type ListDataFeedsInput = {
  includeDiscoverable?: boolean | null,
  includeOwned?: boolean | null,
  includeShared?: boolean | null,
};

export type DataFeeds = {
  __typename: "DataFeeds",
  dataFeeds?:  Array<DataFeed | null > | null,
  nextToken?: string | null,
};

export type GetDataFeedInput = {
  dataFeedId: string,
};

export type ListArticlesInput = {
  dataFeedId: string,
};

export type Articles = {
  __typename: "Articles",
  articles?:  Array<Article | null > | null,
  nextToken?: string | null,
};

export type GetPublicationInput = {
  newsletterId: string,
  publicationId: string,
};

export type Publication = {
  __typename: "Publication",
  newsletterId?: string | null,
  publicationId: string,
  accountId?: string | null,
  campaignId?: string | null,
  createdAt: string,
  htmlPath?: string | null,
  textPath?: string | null,
};

export type ListPublicationsInput = {
  newsletterId: string,
};

export type Publications = {
  __typename: "Publications",
  items?:  Array<Publication | null > | null,
  nextToken?: string | null,
};

export type GetUserSubscriptionStatusInput = {
  newsletterId: string,
};

export type NewsletterSubscriptions = {
  __typename: "NewsletterSubscriptions",
  newsletters:  Array<Newsletter | null >,
  subscribedCount: number,
};

export type GetNewsletterSubscriberStatsInput = {
  newsletterId: string,
};

export type NewsletterUserSubscriberStats = {
  __typename: "NewsletterUserSubscriberStats",
  subscriberCount: number,
};

export type CanManageNewsletterInput = {
  newsletterId: string,
};

export type CanManageDataFeedInput = {
  dataFeedId: string,
};

export type CreateDataFeedMutationVariables = {
  input: CreateDataFeedInput,
};

export type CreateDataFeedMutation = {
  createDataFeed?:  {
    __typename: "DataFeed",
    dataFeedId: string,
    accountId?: string | null,
    url: string,
    feedType: DataFeedType,
    createdAt?: string | null,
    enabled?: boolean | null,
    articles?:  Array< {
      __typename: "Article",
      dataFeedId: string,
      articleId: string,
      accountId?: string | null,
      url: string,
      createdAt: string,
      title: string,
      providedDescription?: string | null,
      providedCategories?: string | null,
      publishDate?: string | null,
      summarizationPrompt?: string | null,
      flaggedContent?: boolean | null,
      articleSummary?: string | null,
      keywords?: string | null,
      shortSummary?: string | null,
      longSummary?: string | null,
    } | null > | null,
    title: string,
    description?: string | null,
    summarizationPrompt?: string | null,
    isPrivate: boolean,
  } | null,
};

export type CreateNewsletterMutationVariables = {
  input: CreateNewsletterInput,
};

export type CreateNewsletterMutation = {
  createNewsletter?:  {
    __typename: "Newsletter",
    newsletterId: string,
    accountId: string,
    title: string,
    numberOfDaysToInclude: number,
    dataFeedIds?: Array< string > | null,
    dataFeeds?:  Array< {
      __typename: "DataFeed",
      dataFeedId: string,
      accountId?: string | null,
      url: string,
      feedType: DataFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
      title: string,
      description?: string | null,
      summarizationPrompt?: string | null,
      isPrivate: boolean,
    } | null > | null,
    isPrivate: boolean,
    scheduleId: string,
    createdAt: string,
    newsletterIntroPrompt?: string | null,
    articleSummaryType?: ArticleSummaryType | null,
    newsletterStyle?: string | null,
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

export type ExternalUnsubscribeFromNewsletterMutationVariables = {
  input?: ExternalUnsubscribeFromNewsletter | null,
};

export type ExternalUnsubscribeFromNewsletterMutation = {
  externalUnsubscribeFromNewsletter: boolean,
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

export type ListNewslettersQueryVariables = {
  input?: ListNewslettersInput | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type ListNewslettersQuery = {
  listNewsletters:  {
    __typename: "Newsletters",
    newsletters:  Array< {
      __typename: "Newsletter",
      newsletterId: string,
      accountId: string,
      title: string,
      numberOfDaysToInclude: number,
      dataFeedIds?: Array< string > | null,
      isPrivate: boolean,
      scheduleId: string,
      createdAt: string,
      newsletterIntroPrompt?: string | null,
      articleSummaryType?: ArticleSummaryType | null,
      newsletterStyle?: string | null,
    } >,
    nextToken?: string | null,
  },
};

export type GetNewsletterQueryVariables = {
  input?: GetNewsletterInput | null,
};

export type GetNewsletterQuery = {
  getNewsletter:  {
    __typename: "Newsletter",
    newsletterId: string,
    accountId: string,
    title: string,
    numberOfDaysToInclude: number,
    dataFeedIds?: Array< string > | null,
    dataFeeds?:  Array< {
      __typename: "DataFeed",
      dataFeedId: string,
      accountId?: string | null,
      url: string,
      feedType: DataFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
      title: string,
      description?: string | null,
      summarizationPrompt?: string | null,
      isPrivate: boolean,
    } | null > | null,
    isPrivate: boolean,
    scheduleId: string,
    createdAt: string,
    newsletterIntroPrompt?: string | null,
    articleSummaryType?: ArticleSummaryType | null,
    newsletterStyle?: string | null,
  },
};

export type ListDataFeedsQueryVariables = {
  input?: ListDataFeedsInput | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type ListDataFeedsQuery = {
  listDataFeeds:  {
    __typename: "DataFeeds",
    dataFeeds?:  Array< {
      __typename: "DataFeed",
      dataFeedId: string,
      accountId?: string | null,
      url: string,
      feedType: DataFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
      title: string,
      description?: string | null,
      summarizationPrompt?: string | null,
      isPrivate: boolean,
    } | null > | null,
    nextToken?: string | null,
  },
};

export type GetDataFeedQueryVariables = {
  input?: GetDataFeedInput | null,
};

export type GetDataFeedQuery = {
  getDataFeed?:  {
    __typename: "DataFeed",
    dataFeedId: string,
    accountId?: string | null,
    url: string,
    feedType: DataFeedType,
    createdAt?: string | null,
    enabled?: boolean | null,
    articles?:  Array< {
      __typename: "Article",
      dataFeedId: string,
      articleId: string,
      accountId?: string | null,
      url: string,
      createdAt: string,
      title: string,
      providedDescription?: string | null,
      providedCategories?: string | null,
      publishDate?: string | null,
      summarizationPrompt?: string | null,
      flaggedContent?: boolean | null,
      articleSummary?: string | null,
      keywords?: string | null,
      shortSummary?: string | null,
      longSummary?: string | null,
    } | null > | null,
    title: string,
    description?: string | null,
    summarizationPrompt?: string | null,
    isPrivate: boolean,
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
    articles?:  Array< {
      __typename: "Article",
      dataFeedId: string,
      articleId: string,
      accountId?: string | null,
      url: string,
      createdAt: string,
      title: string,
      providedDescription?: string | null,
      providedCategories?: string | null,
      publishDate?: string | null,
      summarizationPrompt?: string | null,
      flaggedContent?: boolean | null,
      articleSummary?: string | null,
      keywords?: string | null,
      shortSummary?: string | null,
      longSummary?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetPublicationQueryVariables = {
  input?: GetPublicationInput | null,
};

export type GetPublicationQuery = {
  getPublication:  {
    __typename: "Publication",
    newsletterId?: string | null,
    publicationId: string,
    accountId?: string | null,
    campaignId?: string | null,
    createdAt: string,
    htmlPath?: string | null,
    textPath?: string | null,
  },
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
      newsletterId?: string | null,
      publicationId: string,
      accountId?: string | null,
      campaignId?: string | null,
      createdAt: string,
      htmlPath?: string | null,
      textPath?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetUserSubscriptionStatusQueryVariables = {
  input?: GetUserSubscriptionStatusInput | null,
};

export type GetUserSubscriptionStatusQuery = {
  getUserSubscriptionStatus?: boolean | null,
};

export type ListUserSubscriptionsQueryVariables = {
  nextToken?: string | null,
  limit?: number | null,
};

export type ListUserSubscriptionsQuery = {
  listUserSubscriptions:  {
    __typename: "NewsletterSubscriptions",
    newsletters:  Array< {
      __typename: "Newsletter",
      newsletterId: string,
      accountId: string,
      title: string,
      numberOfDaysToInclude: number,
      dataFeedIds?: Array< string > | null,
      isPrivate: boolean,
      scheduleId: string,
      createdAt: string,
      newsletterIntroPrompt?: string | null,
      articleSummaryType?: ArticleSummaryType | null,
      newsletterStyle?: string | null,
    } | null >,
    subscribedCount: number,
  },
};

export type GetNewsletterSubscriberStatsQueryVariables = {
  input?: GetNewsletterSubscriberStatsInput | null,
};

export type GetNewsletterSubscriberStatsQuery = {
  getNewsletterSubscriberStats?:  {
    __typename: "NewsletterUserSubscriberStats",
    subscriberCount: number,
  } | null,
};

export type CanManageNewsletterQueryVariables = {
  input?: CanManageNewsletterInput | null,
};

export type CanManageNewsletterQuery = {
  canManageNewsletter: boolean,
};

export type CanManageDataFeedQueryVariables = {
  input?: CanManageDataFeedInput | null,
};

export type CanManageDataFeedQuery = {
  canManageDataFeed: boolean,
};
