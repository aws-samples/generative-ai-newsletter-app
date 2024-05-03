import { generateClient } from "aws-amplify/api"
import { fetchAuthSession } from "aws-amplify/auth"

export const generateAuthorizedClient = async () => {
    const session = await fetchAuthSession()
    if(session.tokens?.accessToken === undefined){
        throw new Error("No access token found")
    }
    return generateClient({
        authMode: 'lambda',
        authToken: `Bearer AUTH${session.tokens.accessToken.toString()}`
    })
}