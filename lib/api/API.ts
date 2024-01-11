/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateNewsFeedSubscription = {
  url: string,
  discoverable: boolean,
};

export type NewsFeedSubscription = {
  __typename: "NewsFeedSubscription",
  subscriptionId: string,
  url: string,
  feedType: NewsFeedType,
  createdAt?: string | null,
  enabled?: boolean | null,
  articles?:  Array<NewsFeedArticle | null > | null,
};

export enum NewsFeedType {
  RSS = "RSS",
  ATOM = "ATOM",
}


export type NewsFeedArticle = {
  __typename: "NewsFeedArticle",
  subscriptionId: string,
  articleId: string,
  url: string,
  articleSummary: string,
  createdAt: string,
  title: string,
};

export type CreateNewsletter = {
  title: string,
  numberOfDaysToInclude: number,
  subscriptionIds: Array< string >,
  discoverable?: boolean | null,
  shared?: boolean | null,
};

export type Newsletter = {
  __typename: "Newsletter",
  newsletterId: string,
  title: string,
  numberOfDaysToInclude: number,
  subscriptionIds?: Array< string > | null,
  subscriptions?:  Array<NewsFeedSubscription | null > | null,
  discoverable?: boolean | null,
  shared?: boolean | null,
  scheduleId: string,
  createdAt: string,
};

export type SubscribeToNewsletterInput = {
  newsletterId: string,
};

export type UpdateNewsletterInput = {
  title?: string | null,
  numberOfDaysToInclude?: number | null,
  subscriptionIds?: Array< string | null > | null,
  discoverable?: boolean | null,
  shared?: boolean | null,
};

export type GetNewslettersInput = {
  nextToken?: string | null,
};

export type Newsletters = {
  __typename: "Newsletters",
  newsletters:  Array<Newsletter >,
  nextToken?: string | null,
};

export type GetNewsletterInput = {
  newsletterId: string,
};

export type NewsFeedSubscriptions = {
  __typename: "NewsFeedSubscriptions",
  subscriptions?:  Array<NewsFeedSubscription | null > | null,
  nextToken?: string | null,
  limit?: number | null,
};

export type GetNewsFeedSubscriptionInput = {
  subscriptionId: string,
};

export type NewsFeedArticlesInput = {
  subscriptionId?: string | null,
  nextToken?: string | null,
};

export type NewsFeedArticles = {
  __typename: "NewsFeedArticles",
  newsFeedArticles?:  Array<NewsFeedArticle | null > | null,
  nextToken?: string | null,
};

export type NewsletterEmailInput = {
  newsletterId: string,
  emailId: string,
};

export type NewsletterEmail = {
  __typename: "NewsletterEmail",
  newsletterId: string,
  emailId: string,
  campaignId: string,
  createdAt: string,
};

export type GetNewsletterEmailsInput = {
  newsletterId: string,
  nextToken?: string | null,
};

export type NewsletterEmails = {
  __typename: "NewsletterEmails",
  newsletterEmails?:  Array<NewsletterEmail | null > | null,
  nextToken?: string | null,
};

export type CreateNewsFeedSubscriptionMutationVariables = {
  input?: CreateNewsFeedSubscription | null,
};

export type CreateNewsFeedSubscriptionMutation = {
  createNewsFeedSubscription?:  {
    __typename: "NewsFeedSubscription",
    subscriptionId: string,
    url: string,
    feedType: NewsFeedType,
    createdAt?: string | null,
    enabled?: boolean | null,
    articles?:  Array< {
      __typename: "NewsFeedArticle",
      subscriptionId: string,
      articleId: string,
      url: string,
      articleSummary: string,
      createdAt: string,
      title: string,
    } | null > | null,
  } | null,
};

export type CreateNewsletterMutationVariables = {
  input?: CreateNewsletter | null,
};

export type CreateNewsletterMutation = {
  createNewsletter?:  {
    __typename: "Newsletter",
    newsletterId: string,
    title: string,
    numberOfDaysToInclude: number,
    subscriptionIds?: Array< string > | null,
    subscriptions?:  Array< {
      __typename: "NewsFeedSubscription",
      subscriptionId: string,
      url: string,
      feedType: NewsFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
    } | null > | null,
    discoverable?: boolean | null,
    shared?: boolean | null,
    scheduleId: string,
    createdAt: string,
  } | null,
};

export type SubscribeToNewsletterMutationVariables = {
  input?: SubscribeToNewsletterInput | null,
};

export type SubscribeToNewsletterMutation = {
  subscribeToNewsletter?: boolean | null,
};

export type UpdateNewsletterMutationVariables = {
  input: UpdateNewsletterInput,
  newsletterId: string,
};

export type UpdateNewsletterMutation = {
  updateNewsletter?: boolean | null,
};

export type GetNewslettersQueryVariables = {
  input?: GetNewslettersInput | null,
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
      __typename: "NewsFeedSubscription",
      subscriptionId: string,
      url: string,
      feedType: NewsFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
    } | null > | null,
    discoverable?: boolean | null,
    shared?: boolean | null,
    scheduleId: string,
    createdAt: string,
  },
};

export type GetNewsFeedSubscriptionsQueryVariables = {
  nextToken?: string | null,
  limit?: number | null,
};

export type GetNewsFeedSubscriptionsQuery = {
  getNewsFeedSubscriptions:  {
    __typename: "NewsFeedSubscriptions",
    subscriptions?:  Array< {
      __typename: "NewsFeedSubscription",
      subscriptionId: string,
      url: string,
      feedType: NewsFeedType,
      createdAt?: string | null,
      enabled?: boolean | null,
    } | null > | null,
    nextToken?: string | null,
    limit?: number | null,
  },
};

export type GetNewsFeedSubscriptionQueryVariables = {
  input?: GetNewsFeedSubscriptionInput | null,
};

export type GetNewsFeedSubscriptionQuery = {
  getNewsFeedSubscription?:  {
    __typename: "NewsFeedSubscription",
    subscriptionId: string,
    url: string,
    feedType: NewsFeedType,
    createdAt?: string | null,
    enabled?: boolean | null,
    articles?:  Array< {
      __typename: "NewsFeedArticle",
      subscriptionId: string,
      articleId: string,
      url: string,
      articleSummary: string,
      createdAt: string,
      title: string,
    } | null > | null,
  } | null,
};

export type GetNewsFeedArticlesQueryVariables = {
  input?: NewsFeedArticlesInput | null,
};

export type GetNewsFeedArticlesQuery = {
  getNewsFeedArticles:  {
    __typename: "NewsFeedArticles",
    newsFeedArticles?:  Array< {
      __typename: "NewsFeedArticle",
      subscriptionId: string,
      articleId: string,
      url: string,
      articleSummary: string,
      createdAt: string,
      title: string,
    } | null > | null,
    nextToken?: string | null,
  },
};

export type GetNewsletterEmailQueryVariables = {
  input?: NewsletterEmailInput | null,
};

export type GetNewsletterEmailQuery = {
  getNewsletterEmail:  {
    __typename: "NewsletterEmail",
    newsletterId: string,
    emailId: string,
    campaignId: string,
    createdAt: string,
  },
};

export type GetNewsletterEmailsQueryVariables = {
  input?: GetNewsletterEmailsInput | null,
};

export type GetNewsletterEmailsQuery = {
  getNewsletterEmails?:  {
    __typename: "NewsletterEmails",
    newsletterEmails?:  Array< {
      __typename: "NewsletterEmail",
      newsletterId: string,
      emailId: string,
      campaignId: string,
      createdAt: string,
    } | null > | null,
    nextToken?: string | null,
  } | null,
};
