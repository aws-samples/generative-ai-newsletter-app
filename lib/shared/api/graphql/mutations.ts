/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createDataFeed = /* GraphQL */ `mutation CreateDataFeed($input: CreateDataFeedInput!) {
  createDataFeed(input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateDataFeedMutationVariables,
  APITypes.CreateDataFeedMutation
>;
export const createNewsletter = /* GraphQL */ `mutation CreateNewsletter($input: CreateNewsletterInput!) {
  createNewsletter(input: $input) {
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
export const updateNewsletter = /* GraphQL */ `mutation UpdateNewsletter($input: UpdateNewsletterInput!) {
  updateNewsletter(input: $input)
}
` as GeneratedMutation<
  APITypes.UpdateNewsletterMutationVariables,
  APITypes.UpdateNewsletterMutation
>;
export const updateDataFeed = /* GraphQL */ `mutation UpdateDataFeed($input: UpdateDataFeedInput!) {
  updateDataFeed(input: $input)
}
` as GeneratedMutation<
  APITypes.UpdateDataFeedMutationVariables,
  APITypes.UpdateDataFeedMutation
>;
export const flagArticle = /* GraphQL */ `mutation FlagArticle($input: FlagArticleInput!) {
  flagArticle(input: $input)
}
` as GeneratedMutation<
  APITypes.FlagArticleMutationVariables,
  APITypes.FlagArticleMutation
>;
export const externalUnsubscribeFromNewsletter = /* GraphQL */ `mutation ExternalUnsubscribeFromNewsletter(
  $input: ExternalUnsubscribeFromNewsletter
) {
  externalUnsubscribeFromNewsletter(input: $input)
}
` as GeneratedMutation<
  APITypes.ExternalUnsubscribeFromNewsletterMutationVariables,
  APITypes.ExternalUnsubscribeFromNewsletterMutation
>;
