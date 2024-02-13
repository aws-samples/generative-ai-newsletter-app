import { GraphQLQuery, generateClient } from 'aws-amplify/api'
import { GraphQLResult } from '@aws-amplify/api'

import {
  getNewsletter,
  getNewsletterEmails,
  getNewsletterSubscriberStats,
  getNewsletters,
  getUserNewsletterSubscriptionStatus,
  getUserNewsletterSubscriptions
} from '@shared/api/graphql/queries'
import {
  CreateNewsletter,
  CreateNewsletterMutation,
  GetNewsletterEmailsInput,
  GetNewsletterEmailsQuery,
  GetNewsletterQuery,
  GetNewslettersInput,
  GetNewslettersQuery,
  GetUserNewsletterSubscriptionStatusQuery,
  UpdateNewsletterInput,
  UpdateNewsletterMutation,
  UserNewsletterSubscriptionStatusInput,
  GetNewsletterSubscriberStatsInput,
  GetNewsletterSubscriberStatsQuery,
  SubscribeToNewsletterInput,
  SubscribeToNewsletterMutation,
  UnsubscribeFromNewsletterInput,
  UnsubscribeFromNewsletterMutation,
  GetUserNewsletterSubscriptionsQuery
} from '@shared/api/API'
import {
  createNewsletter,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateNewsletter
} from '@shared/api/graphql/mutations'

const client = generateClient({
  authMode: 'userPool'
})

export class NewslettersClient {
  async listNewsletters(
    input?: GetNewslettersInput,
    nextToken?: string,
    limit?: number
  ): Promise<GraphQLResult<GetNewslettersQuery>> {
    try {
      const result = await client.graphql({
        query: getNewsletters,
        variables: { input, nextToken, limit }
      })
      return result as GraphQLResult<GraphQLQuery<GetNewslettersQuery>>
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<GetNewslettersQuery>>
  }

  async getNewsletter(
    newsletterId: string
  ): Promise<GraphQLResult<GetNewsletterQuery>> {
    try {
      const result = await client.graphql({
        query: getNewsletter,
        variables: { input: { newsletterId } }
      })
      return result as GraphQLResult<GraphQLQuery<GetNewsletterQuery>>
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<GetNewsletterQuery>>
  }

  async createNewsletter(
    input: CreateNewsletter
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
    newsletterId: string,
    input: UpdateNewsletterInput
  ): Promise<GraphQLResult<UpdateNewsletterMutation>> {
    try {
      const result = await client.graphql({
        query: updateNewsletter,
        variables: { newsletterId, input }
      })
      if (result.errors) {
        throw result.errors
      }
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<UpdateNewsletterMutation>>
  }

  async getNewsletterEmails(
    input: GetNewsletterEmailsInput,
    nextToken?: string | undefined,
    limit?: number
  ): Promise<GraphQLResult<GraphQLQuery<GetNewsletterEmailsQuery>>> {
    try {
      const result = await client.graphql({
        query: getNewsletterEmails,
        variables: { input, nextToken, limit }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<GraphQLQuery<GetNewsletterEmailsQuery>>
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<GraphQLQuery<GetNewsletterEmailsQuery>>
  }

  async getUserNewsletterSubscriptionStatus(
    input: UserNewsletterSubscriptionStatusInput
  ): Promise<
    GraphQLResult<GraphQLQuery<GetUserNewsletterSubscriptionStatusQuery>>
  > {
    try {
      const result = await client.graphql({
        query: getUserNewsletterSubscriptionStatus,
        variables: { input }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<
        GraphQLQuery<GetUserNewsletterSubscriptionStatusQuery>
      >
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<
      GraphQLQuery<GetUserNewsletterSubscriptionStatusQuery>
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

  async getUserNewsletterSubscriptions(
    nextToken?: string,
    limit?: number
  ): Promise<GraphQLResult<GraphQLQuery<GetUserNewsletterSubscriptionsQuery>>> {
    try {
      const result = await client.graphql({
        query: getUserNewsletterSubscriptions,
        variables: { nextToken, limit }
      })
      if (result.errors) {
        throw result.errors
      }
      return result as GraphQLResult<
        GraphQLQuery<GetUserNewsletterSubscriptionsQuery>
      >
    } catch (e) {
      console.error(e)
    }
    return {} as GraphQLResult<
      GraphQLQuery<GetUserNewsletterSubscriptionsQuery>
    >
  }
}
