/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createDataFeedSubscription = /* GraphQL */ `mutation CreateDataFeedSubscription($input: CreateDataFeedSubscriptionInput!) {
  createDataFeedSubscription(input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateDataFeedSubscriptionMutationVariables,
  APITypes.CreateDataFeedSubscriptionMutation
>;
export const createNewsletter = /* GraphQL */ `mutation CreateNewsletter($input: CreateNewsletter!) {
  createNewsletter(input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateNewsletterMutationVariables,
  APITypes.CreateNewsletterMutation
>;
export const subscribeToNewsletter = /* GraphQL */ `mutation SubscribeToNewsletter($input: SubscribeToNewsletterInput!) {
  subscribeToNewsletter(input: $input)
}
` as GeneratedMutation<
  APITypes.SubscribeToNewsletterMutationVariables,
  APITypes.SubscribeToNewsletterMutation
>;
export const unsubscribeFromNewsletter = /* GraphQL */ `mutation UnsubscribeFromNewsletter($input: UnsubscribeFromNewsletterInput) {
  unsubscribeFromNewsletter(input: $input)
}
` as GeneratedMutation<
  APITypes.UnsubscribeFromNewsletterMutationVariables,
  APITypes.UnsubscribeFromNewsletterMutation
>;
export const updateNewsletter = /* GraphQL */ `mutation UpdateNewsletter(
  $input: UpdateNewsletterInput!
  $newsletterId: String!
) {
  updateNewsletter(input: $input, newsletterId: $newsletterId)
}
` as GeneratedMutation<
  APITypes.UpdateNewsletterMutationVariables,
  APITypes.UpdateNewsletterMutation
>;
export const updateDataFeed = /* GraphQL */ `mutation UpdateDataFeed(
  $input: UpdateDataFeedSubscriptionInput!
  $subscriptionId: String!
) {
  updateDataFeed(input: $input, subscriptionId: $subscriptionId)
}
` as GeneratedMutation<
  APITypes.UpdateDataFeedMutationVariables,
  APITypes.UpdateDataFeedMutation
>;
