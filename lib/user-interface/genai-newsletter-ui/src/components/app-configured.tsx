import { useEffect, useState } from "react";
import { AppConfig } from "../common/types";
import { Amplify } from "aws-amplify";
import { AppContext } from "../common/app-context";
import { Authenticator } from "@aws-amplify/ui-react";
import App from "../app";
import { Alert } from "@cloudscape-design/components";


export default function AppConfigured() {
    const [config, setConfig] = useState<AppConfig | null>(null)
    const [error, setError] = useState<boolean | null>(null);
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
            <Authenticator
                hideSignUp={true}>
                <App />
            </Authenticator>
        </AppContext.Provider>
    )

}