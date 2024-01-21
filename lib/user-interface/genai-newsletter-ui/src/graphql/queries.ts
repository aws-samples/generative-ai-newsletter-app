/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getNewsletters = /* GraphQL */ `query GetNewsletters($input: GetNewslettersInput) {
  getNewsletters(input: $input) {
    newsletters {
      newsletterId
      title
      numberOfDaysToInclude
      subscriptionIds
      discoverable
      shared
      scheduleId
      createdAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewslettersQueryVariables,
  APITypes.GetNewslettersQuery
>;
export const getNewsletter = /* GraphQL */ `query GetNewsletter($input: GetNewsletterInput) {
  getNewsletter(input: $input) {
    newsletterId
    title
    numberOfDaysToInclude
    subscriptionIds
    subscriptions {
      subscriptionId
      url
      feedType
      createdAt
      enabled
      title
      description
      summarizationPrompt
      __typename
    }
    discoverable
    shared
    scheduleId
    createdAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewsletterQueryVariables,
  APITypes.GetNewsletterQuery
>;
export const getDataFeedSubscriptions = /* GraphQL */ `query GetDataFeedSubscriptions($nextToken: String, $limit: Int) {
  getDataFeedSubscriptions(nextToken: $nextToken, limit: $limit) {
    subscriptions {
      subscriptionId
      url
      feedType
      createdAt
      enabled
      title
      description
      summarizationPrompt
      __typename
    }
    nextToken
    limit
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDataFeedSubscriptionsQueryVariables,
  APITypes.GetDataFeedSubscriptionsQuery
>;
export const getDataFeedSubscription = /* GraphQL */ `query GetDataFeedSubscription($input: GetDataFeedSubscriptionInput) {
  getDataFeedSubscription(input: $input) {
    subscriptionId
    url
    feedType
    createdAt
    enabled
    articles {
      subscriptionId
      articleId
      url
      articleSummary
      createdAt
      title
      summarizationPrompt
      __typename
    }
    title
    description
    summarizationPrompt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDataFeedSubscriptionQueryVariables,
  APITypes.GetDataFeedSubscriptionQuery
>;
export const getDataFeedArticles = /* GraphQL */ `query GetDataFeedArticles(
  $input: DataFeedArticlesInput
  $nextToken: String
  $limit: Int
) {
  getDataFeedArticles(input: $input, nextToken: $nextToken, limit: $limit) {
    dataFeedArticles {
      subscriptionId
      articleId
      url
      articleSummary
      createdAt
      title
      summarizationPrompt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDataFeedArticlesQueryVariables,
  APITypes.GetDataFeedArticlesQuery
>;
export const getNewsletterEmail = /* GraphQL */ `query GetNewsletterEmail($input: GetNewsletterEmailInput) {
  getNewsletterEmail(input: $input) {
    newsletterId
    emailId
    campaignId
    createdAt
    htmlPath
    textPath
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewsletterEmailQueryVariables,
  APITypes.GetNewsletterEmailQuery
>;
export const getNewsletterEmails = /* GraphQL */ `query GetNewsletterEmails(
  $input: GetNewsletterEmailsInput
  $nextToken: String
  $limit: Int
) {
  getNewsletterEmails(input: $input, nextToken: $nextToken, limit: $limit) {
    newsletterEmails {
      newsletterId
      emailId
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
  APITypes.GetNewsletterEmailsQueryVariables,
  APITypes.GetNewsletterEmailsQuery
>;
export const getUserNewsletterSubscriptionStatus = /* GraphQL */ `query GetUserNewsletterSubscriptionStatus(
  $input: UserNewsletterSubscriptionStatusInput
) {
  getUserNewsletterSubscriptionStatus(input: $input)
}
` as GeneratedQuery<
  APITypes.GetUserNewsletterSubscriptionStatusQueryVariables,
  APITypes.GetUserNewsletterSubscriptionStatusQuery
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
