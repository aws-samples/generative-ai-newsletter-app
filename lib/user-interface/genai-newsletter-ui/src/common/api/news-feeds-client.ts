import { GraphQLQuery, generateClient } from "aws-amplify/api";
import { GraphQLResult } from "@aws-amplify/api";
import { GetNewsFeedSubscriptionsQuery } from "../../API";
import { getNewsFeedSubscriptions } from "../../graphql/queries";

const client = generateClient({
    authMode: "userPool",
})

export class NewsFeedsClient {
    async listNewsFeeds(args?: {nextToken?:string, limit?: number}): Promise<GraphQLResult<GetNewsFeedSubscriptionsQuery>> {
        try {
            const { nextToken, limit } = args ?? {nextToken: null, limit: null}
            const result = await client.graphql({
                query: getNewsFeedSubscriptions,
                variables: { nextToken, limit },
            })
            return result as GraphQLResult<GraphQLQuery<GetNewsFeedSubscriptionsQuery>>
        }catch(e) {
            console.error(e)
            throw e
        }
    }
}