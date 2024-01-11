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
export const getNewsFeedSubscriptions = /* GraphQL */ `query GetNewsFeedSubscriptions($nextToken: String, $limit: Int) {
  getNewsFeedSubscriptions(nextToken: $nextToken, limit: $limit) {
    subscriptions {
      subscriptionId
      url
      feedType
      createdAt
      enabled
      __typename
    }
    nextToken
    limit
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewsFeedSubscriptionsQueryVariables,
  APITypes.GetNewsFeedSubscriptionsQuery
>;
export const getNewsFeedSubscription = /* GraphQL */ `query GetNewsFeedSubscription($input: GetNewsFeedSubscriptionInput) {
  getNewsFeedSubscription(input: $input) {
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
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewsFeedSubscriptionQueryVariables,
  APITypes.GetNewsFeedSubscriptionQuery
>;
export const getNewsFeedArticles = /* GraphQL */ `query GetNewsFeedArticles($input: NewsFeedArticlesInput) {
  getNewsFeedArticles(input: $input) {
    newsFeedArticles {
      subscriptionId
      articleId
      url
      articleSummary
      createdAt
      title
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewsFeedArticlesQueryVariables,
  APITypes.GetNewsFeedArticlesQuery
>;
export const getNewsletterEmail = /* GraphQL */ `query GetNewsletterEmail($input: NewsletterEmailInput) {
  getNewsletterEmail(input: $input) {
    newsletterId
    emailId
    campaignId
    createdAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNewsletterEmailQueryVariables,
  APITypes.GetNewsletterEmailQuery
>;
export const getNewsletterEmails = /* GraphQL */ `query GetNewsletterEmails($input: GetNewsletterEmailsInput) {
  getNewsletterEmails(input: $input) {
    newsletterEmails {
      newsletterId
      emailId
      campaignId
      createdAt
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
