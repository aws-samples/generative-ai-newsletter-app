import { GraphQLQuery, generateClient } from "aws-amplify/api";
import { GraphQLResult } from "@aws-amplify/api";

import { getNewsletter, getNewsletterEmails, getNewsletters } from "../../graphql/queries";
import { CreateNewsletter, CreateNewsletterMutation, GetNewsletterEmailsInput, GetNewsletterEmailsQuery, GetNewsletterQuery, GetNewslettersInput, GetNewslettersQuery, UpdateNewsletterInput, UpdateNewsletterMutation } from "../../API";
import { createNewsletter, updateNewsletter } from "../../graphql/mutations";

const client = generateClient({
    authMode: "userPool",
})

export class NewslettersClient {
    async listNewsletters(input?: GetNewslettersInput): Promise<GraphQLResult<GetNewslettersQuery>> {
        try {
            const result = await client.graphql({
                query: getNewsletters,
                variables: { input },
            })
            return result as GraphQLResult<GraphQLQuery<GetNewslettersQuery>>
        }catch(e){
            console.error(e)
        }
        return {} as GraphQLResult<GraphQLQuery<GetNewslettersQuery>>;        
    }

    async getNewsletter(newsletterId: string): Promise<GraphQLResult<GetNewsletterQuery>> {
        try{
            const result = await client.graphql({
                query: getNewsletter,
                variables: { input: { newsletterId } },
            })
            return result as GraphQLResult<GraphQLQuery<GetNewsletterQuery>>
        }catch(e){
            console.error(e)
        }
        return {} as GraphQLResult<GraphQLQuery<GetNewsletterQuery>>;
    }

    async createNewsletter(input: CreateNewsletter): Promise<GraphQLResult<CreateNewsletterMutation>> {
        try {
            const result = await client.graphql({
                query: createNewsletter,
                variables: { input },
            })
            return result as GraphQLResult<GraphQLQuery<CreateNewsletterMutation>>
        }catch(e){
            console.error(e)
        }
        return {} as GraphQLResult<GraphQLQuery<CreateNewsletterMutation>>;
    }

    async updateNewsletter(newsletterId: string, input: UpdateNewsletterInput): Promise<GraphQLResult<UpdateNewsletterMutation>> {
        try {
            const result = await client.graphql({
                query: updateNewsletter,
                variables: { newsletterId, input}
            })
            if(result.errors){
                throw result.errors
            }
        }catch(e){
            console.error(e)
        }
        return {} as GraphQLResult<GraphQLQuery<UpdateNewsletterMutation>>
    }

    async getNewsletterEmails(input: GetNewsletterEmailsInput, nextToken?: string | undefined, limit?: number): Promise<GraphQLResult<GetNewsletterEmailsQuery>> {
        try {
            const result = await client.graphql({
                query: getNewsletterEmails,
                variables: { input, nextToken, limit },
            })
            if(result.errors){
                throw result.errors
            }
            return result as GraphQLResult<GraphQLQuery<GetNewsletterEmailsQuery>>;
        }catch(e){
            console.error(e)
        }
        return {} as GraphQLResult<GraphQLQuery<GetNewsletterEmailsQuery>>;
    }
}