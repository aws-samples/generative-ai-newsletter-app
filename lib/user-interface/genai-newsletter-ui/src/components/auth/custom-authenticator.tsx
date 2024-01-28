import { Hub } from "aws-amplify/utils";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { AppContext } from "../../common/app-context";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { UserContext, userContextDefault } from "../../common/user-context";
import { CustomAuthenticator, DefaultAuthenticator } from "./authenticator-views";


export default function Authenticator(props: PropsWithChildren) {
    const appContext = useContext(AppContext)
    const [userId, setUserId] = useState(userContextDefault.userId)
    const [userGroups, setUserGroups] = useState(userContextDefault.userGroups ?? [])
    const [userGivenName, setUserGivenName] = useState(userContextDefault.userGivenName ?? '')
    const [userFamilyName, setUserFamilyName] = useState(userContextDefault.userFamilyName ?? '')
    const { children } = props;
    useEffect(() => {
        if (!appContext) { return }
        const setUser = async () => {
            try {
                const user = await getCurrentUser()
                if (user.userId) {
                    setUserId(user.userId)
                    try {
                        console.debug('fetching user attributes')
                        const attributes = await fetchUserAttributes()
                        console.debug('user attributes', attributes)
                        if (attributes.given_name) {
                            setUserGivenName(attributes.given_name)
                        }
                        if (attributes.family_name) {
                            setUserFamilyName(attributes.family_name)
                        }
                    } catch (error) { 
                        //Error is okay
                    }

                }
            } catch (error) {
                //Error is okay
            }


        }
        if (appContext.Auth.Cognito.loginWith?.oauth) {
            console.log('CUSTOM HUB IS SET TO LISTEN')
            setUser()
            Hub.listen("auth", ({ payload }) => {
                switch (payload.event) {
                    case "signInWithRedirect":
                        setUser()
                        break
                    case "signedOut":
                        setUserId('')
                        break
                }
            })
        } else {
            Hub.listen("auth", ({ payload }) => {
                if (payload.event === "signedOut") {
                    setUserId('')
                }
                if (payload.event === "signedIn") {
                    try {
                        console.log('SIGNED IN')
                        getCurrentUser().then((user) => {
                            if (user.userId) {
                                setUserId(user.userId)
                            }
                        })
                    } catch (error) {
                        console.log(error)
                    }
                }
            })
        }

    }, [appContext])

    return (
        <UserContext.Provider value={{ userId, setUserId, userGroups, setUserGroups, userGivenName, setUserGivenName, userFamilyName, setUserFamilyName, }}>
            {userId.length < 1 ? (
                appContext?.Auth.Cognito.loginWith?.oauth !== undefined ?
                    <CustomAuthenticator /> : <DefaultAuthenticator />
            ) : children
            }
        </UserContext.Provider>
    )

}