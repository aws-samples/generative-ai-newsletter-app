/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateDataFeedSubscriptionInput = {
  url: string,
  title: string,
  description?: string | null,
  enabled: boolean,
  summarizationPrompt?: string | null,
};

export type DataFeedSubscription = {
  __typename: "DataFeedSubscription",
  subscriptionId: string,
  url: string,
  feedType: DataFeedType,
  createdAt?: string | null,
  enabled?: boolean | null,
  articles?:  Array<DataFeedArticle | null > | null,
  title: string,
  description?: string | null,
  summarizationPrompt?: string | null,
};

export enum DataFeedType {
  RSS = "RSS",
  ATOM = "ATOM",
}


export type DataFeedArticle = {
  __typename: "DataFeedArticle",
  subscriptionId: string,
  articleId: string,
  url: string,
  createdAt: string,
  title: string,
  summarizationPrompt?: string | null,
  flaggedContent?: boolean | null,
  articleSummary?: string | null,
  keywords?: string | null,
  shortSummary?: string | null,
  longSummary?: string | null,
};

export type CreateNewsletter = {
  title: string,
  numberOfDaysToInclude: number,
  subscriptionIds: Array< string >,
  discoverable?: boolean | null,
  shared?: boolean | null,
  newsletterIntroPrompt?: string | null,
};

export type Newsletter = {
  __typename: "Newsletter",
  newsletterId: string,
  title: string,
  numberOfDaysToInclude: number,
  subscriptionIds?: Array< string > | null,
  subscriptions?:  Array<DataFeedSubscription | null > | null,
  discoverable?: boolean | null,
  shared?: boolean | null,
  scheduleId: string,
  createdAt: string,
  owner?: string | null,
  newsletterIntroPrompt?: string | null,
};

export type SubscribeToNewsletterInput = {
  newsletterId: string,
};

export type UnsubscribeFromNewsletterInput = {
  newsletterId: string,
};

export type UpdateNewsletterInput = {
  title?: string | null,
  numberOfDaysToInclude?: number | null,
  subscriptionIds?: Array< string | null > | null,
  discoverable?: boolean | null,
  shared?: boolean | null,
  newsletterIntroPrompt?: string | null,
};

export type UpdateDataFeedSubscriptionInput = {
  url?: string | null,
  enabled?: boolean | null,
  title: string,
  description?: string | null,
  summarizationPrompt?: string | null,
};

export type FlagDataFeedArticleInput = {
  subscriptionId: string,
  articleId: string,
  flaggedContent: boolean,
};

export type GetNewslettersInput = {
  lookupType: NewsletterLookupType,
};

export enum NewsletterLookupType {
  CURRENT_USER_OWNED = "CURRENT_USER_OWNED",
  DISCOVERABLE = "DISCOVERABLE",
  CURRENT_USER_SUBSCRIBED = "CURRENT_USER_SUBSCRIBED",
}


export type Newsletters = {
  __typename: "Newsletters",
  newsletters:  Array<Newsletter >,
  nextToken?: string | null,
};

export type GetNewsletterInput = {
  newsletterId: string,
};

export type DataFeedSubscriptions = {
  __typename: "DataFeedSubscriptions",
  subscriptions?:  Array<DataFeedSubscription | null > | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type GetDataFeedSubscriptionInput = {
  subscriptionId: string,
};

export type DataFeedArticlesInput = {
  subscriptionId?: string | null,
};

export type DataFeedArticles = {
  __typename: "DataFeedArticles",
  dataFeedArticles?:  Array<DataFeedArticle | null > | null,
  nextToken?: string | null,
};

export type GetNewsletterEmailInput = {
  newsletterId: string,
  emailId: string,
};

export type NewsletterEmail = {
  __typename: "NewsletterEmail",
  newsletterId?: string | null,
  emailId: string,
  campaignId?: string | null,
  createdAt: string,
  htmlPath?: string | null,
  textPath?: string | null,
};

export type GetNewsletterEmailsInput = {
  newsletterId: string,
};

export type NewsletterEmails = {
  __typename: "NewsletterEmails",
  newsletterEmails?:  Array<NewsletterEmail | null > | null,
  nextToken?: string | null,
};

export type UserNewsletterSubscriptionStatusInput = {
  newsletterId: string,
};

export type GetNewsletterSubscriberStatsInput = {
  newsletterId: string,
};

export type NewsletterUserSubscriberStats = {
  __typename: "NewsletterUserSubscriberStats",
  subscriberCount: number,
};

export type CreateDataFeedSubscriptionMutationVariables = {
  input: CreateDataFeedSubscriptionInput,
};

export type CreateDataFeedSubscriptionMutation = {
  createDataFeedSubscription?:  {
    __typename: "DataFeedSubscription",
    subscriptionId: string,
    url: string,
    feedType: DataFeedType,
    createdAt?: string | null,
    enabled?: boolean | null,
    articles?:  Array< {
      __typename: "DataFeedArticle",
      subscriptionId: string,
      articleId: string,
      url: string,
      createdAt: string,
      title: string,
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
  } | null,
};

export type CreateNewsletterMutationVariables = {
  input: CreateNewsletter,
};

export type CreateNewsletterMutation = {
  createNewsletter?:  {
    __typename: "Newsletter",
    newsletterId: string,
    title: string,
    numberOfDaysToInclude: number,
    subscriptionIds?: Array< string > | null,
    subscriptions?:  Array< {
      __typename: "DataFeedSubscription",
      subscriptionId: string,
      url: string,
      feedType: DataFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
      title: string,
      description?: string | null,
      summarizationPrompt?: string | null,
    } | null > | null,
    discoverable?: boolean | null,
    shared?: boolean | null,
    scheduleId: string,
    createdAt: string,
    owner?: string | null,
    newsletterIntroPrompt?: string | null,
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
  newsletterId: string,
};

export type UpdateNewsletterMutation = {
  updateNewsletter?: boolean | null,
};

export type UpdateDataFeedMutationVariables = {
  input: UpdateDataFeedSubscriptionInput,
  subscriptionId: string,
};

export type UpdateDataFeedMutation = {
  updateDataFeed?: boolean | null,
};

export type FlagDataFeedArticleMutationVariables = {
  input: FlagDataFeedArticleInput,
};

export type FlagDataFeedArticleMutation = {
  flagDataFeedArticle?: boolean | null,
};

export type GetNewslettersQueryVariables = {
  input?: GetNewslettersInput | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type GetNewslettersQuery = {
  getNewsletters:  {
    __typename: "Newsletters",
    newsletters:  Array< {
      __typename: "Newsletter",
      newsletterId: string,
      title: string,
      numberOfDaysToInclude: number,
      subscriptionIds?: Array< string > | null,
      discoverable?: boolean | null,
      shared?: boolean | null,
      scheduleId: string,
      createdAt: string,
      owner?: string | null,
      newsletterIntroPrompt?: string | null,
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
    title: string,
    numberOfDaysToInclude: number,
    subscriptionIds?: Array< string > | null,
    subscriptions?:  Array< {
      __typename: "DataFeedSubscription",
      subscriptionId: string,
      url: string,
      feedType: DataFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
      title: string,
      description?: string | null,
      summarizationPrompt?: string | null,
    } | null > | null,
    discoverable?: boolean | null,
    shared?: boolean | null,
    scheduleId: string,
    createdAt: string,
    owner?: string | null,
    newsletterIntroPrompt?: string | null,
  },
};

export type GetDataFeedSubscriptionsQueryVariables = {
  nextToken?: string | null,
  limit?: number | null,
};

export type GetDataFeedSubscriptionsQuery = {
  getDataFeedSubscriptions:  {
    __typename: "DataFeedSubscriptions",
    subscriptions?:  Array< {
      __typename: "DataFeedSubscription",
      subscriptionId: string,
      url: string,
      feedType: DataFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
      title: string,
      description?: string | null,
      summarizationPrompt?: string | null,
    } | null > | null,
    nextToken?: string | null,
    limit?: number | null,
  },
};

export type GetDataFeedSubscriptionQueryVariables = {
  input?: GetDataFeedSubscriptionInput | null,
};

export type GetDataFeedSubscriptionQuery = {
  getDataFeedSubscription?:  {
    __typename: "DataFeedSubscription",
    subscriptionId: string,
    url: string,
    feedType: DataFeedType,
    createdAt?: string | null,
    enabled?: boolean | null,
    articles?:  Array< {
      __typename: "DataFeedArticle",
      subscriptionId: string,
      articleId: string,
      url: string,
      createdAt: string,
      title: string,
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
  } | null,
};

export type GetDataFeedArticlesQueryVariables = {
  input?: DataFeedArticlesInput | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type GetDataFeedArticlesQuery = {
  getDataFeedArticles?:  {
    __typename: "DataFeedArticles",
    dataFeedArticles?:  Array< {
      __typename: "DataFeedArticle",
      subscriptionId: string,
      articleId: string,
      url: string,
      createdAt: string,
      title: string,
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

export type GetNewsletterEmailQueryVariables = {
  input?: GetNewsletterEmailInput | null,
};

export type GetNewsletterEmailQuery = {
  getNewsletterEmail:  {
    __typename: "NewsletterEmail",
    newsletterId?: string | null,
    emailId: string,
    campaignId?: string | null,
    createdAt: string,
    htmlPath?: string | null,
    textPath?: string | null,
  },
};

export type GetNewsletterEmailsQueryVariables = {
  input?: GetNewsletterEmailsInput | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type GetNewsletterEmailsQuery = {
  getNewsletterEmails?:  {
    __typename: "NewsletterEmails",
    newsletterEmails?:  Array< {
      __typename: "NewsletterEmail",
      newsletterId?: string | null,
      emailId: string,
      campaignId?: string | null,
      createdAt: string,
      htmlPath?: string | null,
      textPath?: string | null,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};

export type GetUserNewsletterSubscriptionStatusQueryVariables = {
  input?: UserNewsletterSubscriptionStatusInput | null,
};

export type GetUserNewsletterSubscriptionStatusQuery = {
  getUserNewsletterSubscriptionStatus?: boolean | null,
};

export type GetUserNewsletterSubscriptionsQueryVariables = {
  nextToken?: string | null,
  limit?: number | null,
};

export type GetUserNewsletterSubscriptionsQuery = {
  getUserNewsletterSubscriptions?:  {
    __typename: "Newsletters",
    newsletters:  Array< {
      __typename: "Newsletter",
      newsletterId: string,
      title: string,
      numberOfDaysToInclude: number,
      subscriptionIds?: Array< string > | null,
      discoverable?: boolean | null,
      shared?: boolean | null,
      scheduleId: string,
      createdAt: string,
      owner?: string | null,
      newsletterIntroPrompt?: string | null,
    } >,
    nextToken?: string | null,
  } | null,
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
