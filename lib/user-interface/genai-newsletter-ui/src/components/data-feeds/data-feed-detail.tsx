import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DataFeedSubscription } from "../../API";
import { AppContext } from "../../common/app-context";
import { ApiClient } from "../../common/api";
import { Button, Container, FormField, Header, SpaceBetween, Spinner, Toggle } from "@cloudscape-design/components";
import { UserContext } from "../../common/user-context";


export default function DataFeedDetail() {
    const { subscriptionId } = useParams()
    const navigate = useNavigate()
    const userContext = useContext(UserContext)
    const appContext = useContext(AppContext)
    const [feed, setFeed] = useState<DataFeedSubscription | null>(null)
    const [loading, setLoading] = useState(true)

    const getDataFeed = useCallback(
        async () => {
            if (!appContext) { return }
            if (!subscriptionId) { return }
            const apiClient = new ApiClient(appContext)
            const result = await apiClient.dataFeeds.getDataFeed({ subscriptionId })
            if (result.errors) {
                console.error(result.errors)
                return
            }
            setFeed(result.data.getDataFeedSubscription as DataFeedSubscription)
            setLoading(false)
        }, [appContext, subscriptionId]
    )

    useEffect(() => {
        getDataFeed()
    }, [getDataFeed, subscriptionId])

    return (
        <Container header={
            <Header actions={
                <SpaceBetween direction="horizontal" size="s">
                    <Button variant="primary" disabled={feed?.owner !== userContext?.userId} onClick={()=>{navigate(`/feeds/${subscriptionId}/edit`)}} >Edit Data Feed</Button>
                </SpaceBetween>
            }/>
        }>
            {loading ?
                <SpaceBetween size="l" alignItems="center" direction="vertical">
                    <Spinner size="big" />
                    <h4>Loading...</h4>
                </SpaceBetween> :
                <SpaceBetween direction="vertical" size="s">
                    <h2>{feed?.title}</h2>
                    <span><i>{feed?.description}</i></span>
                    <FormField label="Feed URL">
                        {feed?.url}
                    </FormField>
                    <FormField label="SubscriptionId">
                        {feed?.subscriptionId}
                    </FormField>
                    <FormField label="Enabled">
                        <Toggle checked={feed?.enabled ?? false} disabled>Data Feed {feed?.enabled ? "Enabled" : "Disabled"}</Toggle>
                    </FormField>
                    <FormField label="Feed Type">
                        {feed?.feedType}
                    </FormField>
                    <FormField label="Date Created">
                        {feed?.createdAt}
                    </FormField>
                    <FormField label="Article Summarization Prompt">
                        {feed?.summarizationPrompt}
                    </FormField>
                </SpaceBetween>
            }
        </Container>
    )
}