import { GraphQLQuery, generateClient } from 'aws-amplify/api'
import { GraphQLResult } from '@aws-amplify/api'

import {
  getNewsletter,
  listPublications,
  getNewsletterSubscriberStats,
  listNewsletters,
  getUserSubscriptionStatus,
  listUserSubscriptions,
  canManageNewsletter
} from '../../../../../shared/api/graphql/queries'
import {
  CreateNewsletterInput,
  CreateNewsletterMutation,
  ListPublicationsInput,
  GetNewsletterQuery,
  UpdateNewsletterInput,
  UpdateNewsletterMutation,
  GetNewsletterSubscriberStatsInput,
  GetNewsletterSubscriberStatsQuery,
  SubscribeToNewsletterInput,
  SubscribeToNewsletterMutation,
  UnsubscribeFromNewsletterInput,
  UnsubscribeFromNewsletterMutation,
  ListNewslettersQuery,
  ListPublicationsQuery,
  GetUserSubscriptionStatusQuery,
  ListUserSubscriptionsQuery,
  GetUserSubscriptionStatusInput,
  ListNewslettersInput,
  GetNewsletterInput,
  CanManageNewsletterInput,
  CanManageNewsletterQuery,
  ExternalUnsubscribeFromNewsletter,
  ExternalUnsubscribeFromNewsletterMutation
} from '../../../../../shared/api/API'
import {
  createNewsletter,
  externalUnsubscribeFromNewsletter,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateNewsletter
} from '../../../../../shared/api/graphql/mutations'

const client = generateClient({
  authMode: 'userPool'
})

export class NewslettersClient {
  async listNewsletters(
    input?: ListNewslettersInput,
    nextToken?: string,
    limit?: number
  ): Promise<GraphQLResult<ListNewslettersQuery>> {
    try {
      const result = await client.graphql({
        query: listNewsletters,
        variables: { input, nextToken, limit }
      })
      return result as GraphQLResult<GraphQLQuery<ListNewslettersQuery>>
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<ListNewslettersQuery>>
  }

  async getNewsletter(
    input: GetNewsletterInput
  ): Promise<GraphQLResult<GetNewsletterQuery>> {
    try {
      const result = await client.graphql({
        query: getNewsletter,
        variables: { input }
      })
      return result as GraphQLResult<GraphQLQuery<GetNewsletterQuery>>
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<GetNewsletterQuery>>
  }

  async createNewsletter(
    input: CreateNewsletterInput
  ): Promise<GraphQLResult<CreateNewsletterMutation>> {
    try {
      const result = await client.graphql({
        query: createNewsletter,
        variables: { input }
      })
      return result as GraphQLResult<GraphQLQuery<CreateNewsletterMutation>>
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<CreateNewsletterMutation>>
  }

  async updateNewsletter(
    input: UpdateNewsletterInput
  ): Promise<GraphQLResult<UpdateNewsletterMutation>> {
    try {
      const result = await client.graphql({
        query: updateNewsletter,
        variables: { input }
      })
      if (result.errors) {
        throw result.errors
      }
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<UpdateNewsletterMutation>>
  }

  async listPublications(
    input: ListPublicationsInput,
    nextToken?: string | undefined,
    limit?: number
  ): Promise<GraphQLResult<GraphQLQuery<ListPublicationsQuery>>> {
    try {
      const result = await client.graphql({
        query: listPublications,
        variables: { input, nextToken, limit }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<GraphQLQuery<ListPublicationsQuery>>
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<ListPublicationsQuery>>
  }

  async getUserSubscriptionStatus(input: GetUserSubscriptionStatusInput): Promise<
    GraphQLResult<GraphQLQuery<GetUserSubscriptionStatusQuery>>
  > {
    try {
      const result = await client.graphql({
        query: getUserSubscriptionStatus,
        variables: {input}
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<
        GraphQLQuery<GetUserSubscriptionStatusQuery>
      >
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<
      GraphQLQuery<GetUserSubscriptionStatusQuery>
    >
  }

  async getNewsletterSubscriberStats(
    input: GetNewsletterSubscriberStatsInput
  ): Promise<GraphQLResult<GraphQLQuery<GetNewsletterSubscriberStatsQuery>>> {
    try {
      const result = await client.graphql({
        query: getNewsletterSubscriberStats,
        variables: { input }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<
        GraphQLQuery<GetNewsletterSubscriberStatsQuery>
      >
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<GetNewsletterSubscriberStatsQuery>>
  }

  async subscribeToNewsletter(
    input: SubscribeToNewsletterInput
  ): Promise<GraphQLResult<GraphQLQuery<SubscribeToNewsletterMutation>>> {
    try {
      const result = await client.graphql({
        query: subscribeToNewsletter,
        variables: { input }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<
        GraphQLQuery<SubscribeToNewsletterMutation>
      >
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<SubscribeToNewsletterMutation>>
  }

  async unsubscribeFromNewsletter(
    input: UnsubscribeFromNewsletterInput
  ): Promise<GraphQLResult<GraphQLQuery<UnsubscribeFromNewsletterMutation>>> {
    try {
      const result = await client.graphql({
        query: unsubscribeFromNewsletter,
        variables: { input }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<
        GraphQLQuery<UnsubscribeFromNewsletterMutation>
      >
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<UnsubscribeFromNewsletterMutation>>
  }

  async listUserSubscriptions(
    nextToken?: string,
    limit?: number
  ): Promise<GraphQLResult<GraphQLQuery<ListUserSubscriptionsQuery>>> {
    try {
      const result = await client.graphql({
        query: listUserSubscriptions,
        variables: { nextToken, limit }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<
        GraphQLQuery<ListUserSubscriptionsQuery>
      >
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<
      GraphQLQuery<ListUserSubscriptionsQuery>
    >
  }

  async canManageNewsletter(
    input: CanManageNewsletterInput
  ): Promise<GraphQLResult<GraphQLQuery<CanManageNewsletterQuery>>> {
    try {
      const result = await client.graphql({
        query: canManageNewsletter,
        variables: { input }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<GraphQLQuery<CanManageNewsletterQuery>>
    } catch (e) {
      return {data:{canManageNewsletter:false}} as GraphQLResult<GraphQLQuery<CanManageNewsletterQuery>>
    }
    
  }

  async externalUnsubscribeFromNewsletter(
    input: ExternalUnsubscribeFromNewsletter
  ): Promise<GraphQLResult<GraphQLQuery<ExternalUnsubscribeFromNewsletterMutation>>> {
    try {
      const result = await client.graphql({
        query: externalUnsubscribeFromNewsletter,
        variables: { input }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<GraphQLQuery<ExternalUnsubscribeFromNewsletterMutation>>
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<ExternalUnsubscribeFromNewsletterMutation>>
  }
}
