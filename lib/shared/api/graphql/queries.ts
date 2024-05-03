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
    items {
      id
      title
      numberOfDaysToInclude
      subscriberCount
      dataFeedIds
      isPrivate
      createdAt
      newsletterIntroPrompt
      articleSummaryType
      newsletterStyle
      currentUserSubscribed
      authGranted
      scheduleId
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
    id
    account {
      id
      __typename
    }
    title
    numberOfDaysToInclude
    subscriberCount
    dataFeedIds
    dataFeeds {
      id
      url
      feedType
      createdAt
      enabled
      title
      description
      summarizationPrompt
      isPrivate
      authGranted
      __typename
    }
    isPrivate
    createdAt
    newsletterIntroPrompt
    articleSummaryType
    newsletterStyle
    subscribers {
      id
      __typename
    }
    currentUserSubscribed
    authGranted
    scheduleId
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
    items {
      id
      url
      feedType
      createdAt
      enabled
      title
      description
      summarizationPrompt
      isPrivate
      authGranted
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
    id
    account {
      id
      __typename
    }
    url
    feedType
    createdAt
    enabled
    articles {
      id
      dataFeedId
      url
      createdAt
      title
      providedDescription
      providedCategories
      publishDate
      summarizationPrompt
      flaggedContent
      keywords
      shortSummary
      longSummary
      authGranted
      __typename
    }
    title
    description
    summarizationPrompt
    isPrivate
    authGranted
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDataFeedQueryVariables,
  APITypes.GetDataFeedQuery
>;
export const listArticles = /* GraphQL */ `query ListArticles($input: ListArticlesInput, $nextToken: String, $limit: Int) {
  listArticles(input: $input, nextToken: $nextToken, limit: $limit) {
    items {
      id
      dataFeedId
      url
      createdAt
      title
      providedDescription
      providedCategories
      publishDate
      summarizationPrompt
      flaggedContent
      keywords
      shortSummary
      longSummary
      authGranted
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
    id
    newsletterId
    account {
      id
      __typename
    }
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
      id
      newsletterId
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
export const checkSubscriptionToNewsletter = /* GraphQL */ `query CheckSubscriptionToNewsletter(
  $input: CheckSubscriptionToNewsletterInput
) {
  checkSubscriptionToNewsletter(input: $input)
}
` as GeneratedQuery<
  APITypes.CheckSubscriptionToNewsletterQueryVariables,
  APITypes.CheckSubscriptionToNewsletterQuery
>;
export const listUserSubscriptions = /* GraphQL */ `query ListUserSubscriptions($nextToken: String, $limit: Int) {
  listUserSubscriptions(nextToken: $nextToken, limit: $limit) {
    items {
      id
      title
      numberOfDaysToInclude
      subscriberCount
      dataFeedIds
      isPrivate
      createdAt
      newsletterIntroPrompt
      articleSummaryType
      newsletterStyle
      currentUserSubscribed
      authGranted
      scheduleId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserSubscriptionsQueryVariables,
  APITypes.ListUserSubscriptionsQuery
>;
export const canUpdateNewsletter = /* GraphQL */ `query CanUpdateNewsletter($input: CanUpdateNewsletterInput) {
  canUpdateNewsletter(input: $input)
}
` as GeneratedQuery<
  APITypes.CanUpdateNewsletterQueryVariables,
  APITypes.CanUpdateNewsletterQuery
>;
export const canUpdateDataFeed = /* GraphQL */ `query CanUpdateDataFeed($input: CanUpdateDataFeedInput) {
  canUpdateDataFeed(input: $input)
}
` as GeneratedQuery<
  APITypes.CanUpdateDataFeedQueryVariables,
  APITypes.CanUpdateDataFeedQuery
>;
export const getNewsletterSubscriberStats = /* GraphQL */ `query GetNewsletterSubscriberStats($input: GetNewsletterSubscriberStatsInput) {
  getNewsletterSubscriberStats(input: $input) {
    id
    count
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewsletterSubscriberStatsQueryVariables,
  APITypes.GetNewsletterSubscriberStatsQuery
>;
