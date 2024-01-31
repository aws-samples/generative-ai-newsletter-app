import { GraphQLQuery, generateClient } from "aws-amplify/api";
import { GraphQLResult } from "@aws-amplify/api";
import { CreateDataFeedSubscriptionInput, CreateDataFeedSubscriptionMutation, FlagDataFeedArticleMutation, GetDataFeedArticlesQuery, GetDataFeedSubscriptionInput, GetDataFeedSubscriptionQuery, GetDataFeedSubscriptionsQuery, UpdateDataFeedMutation, UpdateDataFeedSubscriptionInput } from "../../API";
import { getDataFeedArticles, getDataFeedSubscription, getDataFeedSubscriptions } from "../../graphql/queries";
import { createDataFeedSubscription, flagDataFeedArticle, updateDataFeed } from "../../graphql/mutations";

const client = generateClient({
    authMode: "userPool",
})

export class DataFeedsClient {
    async listDataFeeds(args?: {nextToken?:string, limit?: number}): Promise<GraphQLResult<GetDataFeedSubscriptionsQuery>> {
        try {
            const { nextToken, limit } = args ?? {nextToken: null, limit: null}
            const result = await client.graphql({
                query: getDataFeedSubscriptions,
                variables: { nextToken, limit },
            })
            return result as GraphQLResult<GraphQLQuery<GetDataFeedSubscriptionsQuery>>
        }catch(e) {
            console.error(e)
            throw e
        }
    }

    async getDataFeed(input: GetDataFeedSubscriptionInput): Promise<GraphQLResult<GetDataFeedSubscriptionQuery>> {
        try {
            const result = await client.graphql({
                query: getDataFeedSubscription,
                variables: {input},
            })
            return result as GraphQLResult<GraphQLQuery<GetDataFeedSubscriptionQuery>>
        }catch(e) {
            console.error(e)
            throw e
        }
    }

    async createDataFeed(input: CreateDataFeedSubscriptionInput): Promise<GraphQLResult<GraphQLQuery<CreateDataFeedSubscriptionMutation>>> {
        try {
            const result = await client.graphql({
                query: createDataFeedSubscription,
                variables: {input},
            })
            return result as GraphQLResult<GraphQLQuery<CreateDataFeedSubscriptionMutation>>
        }catch(e){
            console.error(e)
            throw e
        }
    }

    async updateDataFeed(input: UpdateDataFeedSubscriptionInput, subscriptionId: string): Promise<GraphQLResult<UpdateDataFeedMutation>> {
        try {
            const result = await client.graphql({
                query: updateDataFeed,
                variables: {input, subscriptionId},
            })
            return result as GraphQLResult<GraphQLQuery<UpdateDataFeedMutation>>
        }catch(e){
            console.error(e)
            throw e
        }
    
    }

    async getDataFeedArticles(subscriptionId: string, nextToken?: string, limit: number = 1000): Promise<GraphQLResult<GraphQLQuery<GetDataFeedArticlesQuery>>> {
        try {
            const result = await client.graphql({
                query: getDataFeedArticles,
                variables: {input:{subscriptionId}, nextToken, limit},
            })
            return result as GraphQLResult<GraphQLQuery<GetDataFeedArticlesQuery>>
        }catch(e){
            console.error(e)
            throw e
        }
    }

    async flagDataFeedArticle(subscriptionId: string, articleId: string, flaggedContent: boolean): Promise<GraphQLResult<GraphQLQuery<FlagDataFeedArticleMutation>>> {
        try {
            const result = await client.graphql({
                query: flagDataFeedArticle,
                variables: {input:{subscriptionId, articleId, flaggedContent}},
            })
            return result as GraphQLResult<GraphQLQuery<FlagDataFeedArticleMutation>>
        }catch(e){
            console.error(e)
            throw e
        }
    }


}