import { useEffect, useState } from "react";
import { AppConfig } from "../common/types";
import { Amplify } from "aws-amplify";
import { AppContext } from "../common/app-context";
import App from "../app";
import { Authenticator } from "@aws-amplify/ui-react";
import { Alert } from "@cloudscape-design/components";
import { getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import { UserContext, userContextDefault } from "../common/user-context";


export default function AppConfigured() {
    const [config, setConfig] = useState<AppConfig | null>(null)
    const [error, setError] = useState<boolean | null>(null);
    const [userId, setUserId] = useState(userContextDefault.userId)
    const [userGroups, setUserGroups] = useState(userContextDefault.userGroups ?? [])
    useEffect(() => {
        (async () => {
            try {
                const result = await fetch('/aws-exports.json')
                const awsExports = await result.json() as AppConfig | null
                Amplify.configure({
                    ...awsExports,
                })
                setConfig(awsExports)
            } catch (e) {
                setError(true)
                console.error(e)
            }
        })()
    }, [])

    useEffect(() => {
        (async () => {
            try {
                const user = await getCurrentUser()
                setUserId(user.userId)
            } catch (error) {
                console.error(error)
                if (!config) { return }
                if (config.oauth?.customProvider !== undefined && config.oauth?.customProvider?.length > 0) {
                    signInWithRedirect({
                        provider: {
                            custom: config.oauth.customProvider,
                        }
                    })
                } else{
                    window.location.href = '/login'
                }
            }
        })
    }, [config])


    if (!config) {
        if (error) {
            return (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Alert header="Configuration error" type="error">
                        Error loading configuration from "
                        <a href="/aws-exports.json" style={{ fontWeight: "600" }}>
                            /aws-exports.json
                        </a>
                        "
                    </Alert>
                </div>
            );
        }
        return (
            <div>Loading</div>
        )
    }


    return (
        <AppContext.Provider value={config}>
            <UserContext.Provider value={{ setUserId, userId, setUserGroups, userGroups }}>
                <Authenticator>
                    <App />
                </Authenticator>
            </UserContext.Provider>
        </AppContext.Provider>
    )

}