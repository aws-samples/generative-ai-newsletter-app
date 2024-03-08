/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const listNewsletters = /* GraphQL */ `query ListNewsletters(
  $input: ListNewslettersInput
  $nextToken: String
  $limit: Int
) {
  listNewsletters(input: $input, nextToken: $nextToken, limit: $limit) {
    newsletters {
      newsletterId
      accountId
      title
      numberOfDaysToInclude
      dataFeedIds
      isPrivate
      scheduleId
      createdAt
      newsletterIntroPrompt
      articleSummaryType
      newsletterStyle
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListNewslettersQueryVariables,
  APITypes.ListNewslettersQuery
>;
export const getNewsletter = /* GraphQL */ `query GetNewsletter($input: GetNewsletterInput) {
  getNewsletter(input: $input) {
    newsletterId
    accountId
    title
    numberOfDaysToInclude
    dataFeedIds
    dataFeeds {
      dataFeedId
      accountId
      url
      feedType
      createdAt
      enabled
      title
      description
      summarizationPrompt
      isPrivate
      __typename
    }
    isPrivate
    scheduleId
    createdAt
    newsletterIntroPrompt
    articleSummaryType
    newsletterStyle
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewsletterQueryVariables,
  APITypes.GetNewsletterQuery
>;
export const listDataFeeds = /* GraphQL */ `query ListDataFeeds(
  $input: ListDataFeedsInput
  $nextToken: String
  $limit: Int
) {
  listDataFeeds(input: $input, nextToken: $nextToken, limit: $limit) {
    dataFeeds {
      dataFeedId
      accountId
      url
      feedType
      createdAt
      enabled
      title
      description
      summarizationPrompt
      isPrivate
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDataFeedsQueryVariables,
  APITypes.ListDataFeedsQuery
>;
export const getDataFeed = /* GraphQL */ `query GetDataFeed($input: GetDataFeedInput) {
  getDataFeed(input: $input) {
    dataFeedId
    accountId
    url
    feedType
    createdAt
    enabled
    articles {
      dataFeedId
      articleId
      accountId
      url
      createdAt
      title
      providedDescription
      providedCategories
      publishDate
      summarizationPrompt
      flaggedContent
      articleSummary
      keywords
      shortSummary
      longSummary
      __typename
    }
    title
    description
    summarizationPrompt
    isPrivate
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDataFeedQueryVariables,
  APITypes.GetDataFeedQuery
>;
export const listArticles = /* GraphQL */ `query ListArticles($input: ListArticlesInput, $nextToken: String, $limit: Int) {
  listArticles(input: $input, nextToken: $nextToken, limit: $limit) {
    articles {
      dataFeedId
      articleId
      accountId
      url
      createdAt
      title
      providedDescription
      providedCategories
      publishDate
      summarizationPrompt
      flaggedContent
      articleSummary
      keywords
      shortSummary
      longSummary
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListArticlesQueryVariables,
  APITypes.ListArticlesQuery
>;
export const getPublication = /* GraphQL */ `query GetPublication($input: GetPublicationInput) {
  getPublication(input: $input) {
    newsletterId
    publicationId
    accountId
    campaignId
    createdAt
    htmlPath
    textPath
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPublicationQueryVariables,
  APITypes.GetPublicationQuery
>;
export const listPublications = /* GraphQL */ `query ListPublications(
  $input: ListPublicationsInput
  $nextToken: String
  $limit: Int
) {
  listPublications(input: $input, nextToken: $nextToken, limit: $limit) {
    items {
      newsletterId
      publicationId
      accountId
      campaignId
      createdAt
      htmlPath
      textPath
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListPublicationsQueryVariables,
  APITypes.ListPublicationsQuery
>;
export const getUserSubscriptionStatus = /* GraphQL */ `query GetUserSubscriptionStatus($input: GetUserSubscriptionStatusInput) {
  getUserSubscriptionStatus(input: $input)
}
` as GeneratedQuery<
  APITypes.GetUserSubscriptionStatusQueryVariables,
  APITypes.GetUserSubscriptionStatusQuery
>;
export const listUserSubscriptions = /* GraphQL */ `query ListUserSubscriptions($nextToken: String, $limit: Int) {
  listUserSubscriptions(nextToken: $nextToken, limit: $limit) {
    newsletters {
      newsletterId
      accountId
      title
      numberOfDaysToInclude
      dataFeedIds
      isPrivate
      scheduleId
      createdAt
      newsletterIntroPrompt
      articleSummaryType
      newsletterStyle
      __typename
    }
    subscribedCount
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserSubscriptionsQueryVariables,
  APITypes.ListUserSubscriptionsQuery
>;
export const getNewsletterSubscriberStats = /* GraphQL */ `query GetNewsletterSubscriberStats($input: GetNewsletterSubscriberStatsInput) {
  getNewsletterSubscriberStats(input: $input) {
    subscriberCount
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewsletterSubscriberStatsQueryVariables,
  APITypes.GetNewsletterSubscriberStatsQuery
>;
export const canManageNewsletter = /* GraphQL */ `query CanManageNewsletter($input: CanManageNewsletterInput) {
  canManageNewsletter(input: $input)
}
` as GeneratedQuery<
  APITypes.CanManageNewsletterQueryVariables,
  APITypes.CanManageNewsletterQuery
>;
export const canManageDataFeed = /* GraphQL */ `query CanManageDataFeed($input: CanManageDataFeedInput) {
  canManageDataFeed(input: $input)
}
` as GeneratedQuery<
  APITypes.CanManageDataFeedQueryVariables,
  APITypes.CanManageDataFeedQuery
>;
