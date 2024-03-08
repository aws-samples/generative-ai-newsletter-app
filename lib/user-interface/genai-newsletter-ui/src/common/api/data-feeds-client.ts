import { GraphQLQuery, generateClient } from 'aws-amplify/api'
import { GraphQLResult } from '@aws-amplify/api'
import {
  CanManageDataFeedInput,
  CanManageDataFeedQuery,
  CreateDataFeedInput,
  CreateDataFeedMutation,
  FlagArticleInput,
  FlagArticleMutation,
  GetDataFeedInput,
  GetDataFeedQuery,
  ListArticlesInput,
  ListArticlesQuery,
  ListDataFeedsInput,
  ListDataFeedsQuery,
  UpdateDataFeedInput,
  UpdateDataFeedMutation,
} from 'genai-newsletter-shared/api'
import { canManageDataFeed, getDataFeed, listArticles, listDataFeeds } from 'genai-newsletter-shared/api/graphql/queries'
import {
  createDataFeed,
  flagArticle,
  updateDataFeed
} from 'genai-newsletter-shared/api/graphql/mutations'

const client = generateClient({
  authMode: 'userPool'
})

export class DataFeedsClient {
  async listDataFeeds(
  input: ListDataFeedsInput,
    nextToken?: string,
    limit?: number
  ): Promise<GraphQLResult<ListDataFeedsQuery>> {
    try {
      const result = await client.graphql({
        query: listDataFeeds,
        variables: { input, nextToken, limit }
      })
      if (
        result.data.listDataFeeds.dataFeeds !== undefined &&
        result.data.listDataFeeds.dataFeeds !== null &&
        result.data.listDataFeeds.dataFeeds.length > 1
      ) {
        result.data.listDataFeeds.dataFeeds.sort(
          (a: any, b: any) => {
            if (Date.parse(a.createdAt) > Date.parse(b.createdAt)) {
              return -1
            } else {
              return 1
            }
          }
        )
      }
      return result as GraphQLResult<
        GraphQLQuery<ListDataFeedsQuery>
      >
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async getDataFeed(
    input: GetDataFeedInput
  ): Promise<GraphQLResult<GetDataFeedQuery>> {
    try {
      const result = await client.graphql({
        query: getDataFeed,
        variables: { input }
      })
      return result as GraphQLResult<GraphQLQuery<GetDataFeedQuery>>
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async createDataFeed(
    input: CreateDataFeedInput
  ): Promise<GraphQLResult<GraphQLQuery<CreateDataFeedMutation>>> {
    try {
      const result = await client.graphql({
        query: createDataFeed,
        variables: { input }
      })
      return result as GraphQLResult<
        GraphQLQuery<CreateDataFeedMutation>
      >
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async updateDataFeed(
    input: UpdateDataFeedInput,
  ): Promise<GraphQLResult<UpdateDataFeedMutation>> {
    try {
      const result = await client.graphql({
        query: updateDataFeed,
        variables: { input }
      })
      return result as GraphQLResult<GraphQLQuery<UpdateDataFeedMutation>>
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async listArticles(
    input: ListArticlesInput,
    nextToken?: string,
    limit: number = 1000
  ): Promise<GraphQLResult<GraphQLQuery<ListArticlesQuery>>> {
    try {
      const result = await client.graphql({
        query: listArticles,
        variables: {input, nextToken, limit }
      })
      if (
        result.data.listArticles?.articles !== undefined &&
        result.data.listArticles.articles !== null &&
        result.data.listArticles.articles.length > 1
      ) {
        result.data.listArticles.articles.sort(
          (a: any, b: any) => {
            if (Date.parse(a.createdAt) > Date.parse(b.createdAt)) {
              return -1
            } else {
              return 1
            }
          }
        )
      }
      return result as GraphQLResult<GraphQLQuery<ListDataFeedsQuery>>
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async flagArticle(
    input: FlagArticleInput
  ): Promise<GraphQLResult<GraphQLQuery<FlagArticleMutation>>> {
    try {
      const { dataFeedId, articleId, flaggedContent } = input
      const result = await client.graphql({
        query: flagArticle,
        variables: {
          input: { dataFeedId, articleId, flaggedContent }
        }
      })
      return result as GraphQLResult<GraphQLQuery<FlagArticleMutation>>
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async canManageDataFeed(
    input: CanManageDataFeedInput
  ): Promise<GraphQLResult<GraphQLQuery<CanManageDataFeedQuery>>> {
    try {
      const result = await client.graphql({
        query: canManageDataFeed,
        variables: { input }
      })
      return result as GraphQLResult<GraphQLQuery<CanManageDataFeedQuery>>
    }catch(e){
      return {data: {canManageDataFeed: false}} as GraphQLResult<GraphQLQuery<CanManageDataFeedQuery>>;
    }
  }
}
