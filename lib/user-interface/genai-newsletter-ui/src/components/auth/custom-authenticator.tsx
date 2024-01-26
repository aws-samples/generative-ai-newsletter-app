import { Hub } from "aws-amplify/utils";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { AppContext } from "../../common/app-context";
import { getCurrentUser } from "aws-amplify/auth";
import { UserContext, userContextDefault } from "../../common/user-context";
import { CustomAuthenticator, DefaultAuthenticator } from "./authenticator-views";


export default function Authenticator(props: PropsWithChildren) {
    const appContext = useContext(AppContext)
    const [userId, setUserId] = useState(userContextDefault.userId)
    const [userGroups, setUserGroups] = useState(userContextDefault.userGroups ?? [])
    const { children } = props;
    useEffect(() => {
        if (!appContext) { return }
        const setUser = async () => {
            const user = await getCurrentUser()
            if (user.userId) {
                setUserId(user.userId)
            }

        }
        if (appContext.Auth.Cognito.loginWith?.oauth) {
            console.log('CUSTOM HUB IS SET TO LISTEN')
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
            console.log('DEFAULT HUB IS SET TO LISTEN')
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
        <UserContext.Provider value={{ userId, setUserId, userGroups, setUserGroups }}>
            {userId.length < 1 ? (
                appContext?.Auth.Cognito.loginWith?.oauth !== undefined ?
                    <CustomAuthenticator /> : <DefaultAuthenticator />
            ) : children
            }
        </UserContext.Provider>
    )

}