import { Button, Container, Form, FormField, Input, SpaceBetween, Spinner, Toggle } from "@cloudscape-design/components";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../common/app-context";
import { ApiClient } from "../../../common/api";


export default function DataFeedDetailsForm() {
    const { subscriptionId } = useParams()
    const appContext = useContext(AppContext)
    const [loading, setLoading] = useState<boolean>(true)
    const navigate = useNavigate()
    const [url, setUrl] = useState<string>('')
    const [enabled, setEnabled] = useState<boolean>(true)
    const [urlError] = useState<string>('')

    const getDataFeed = useCallback(
        async () => {
            if (!appContext) { return }
            if (!subscriptionId) { return }
            const apiClient = new ApiClient(appContext)
            const result = await apiClient.dataFeeds.getDataFeed({ subscriptionId })
            if (result.errors) {
                console.log(result.errors)
                return
            }
            setUrl(result.data.getDataFeedSubscription?.url ?? '')
            setEnabled(result.data.getDataFeedSubscription?.enabled ?? true)
            setLoading(false)
        }, [appContext, subscriptionId]
    )

    const updateDataFeed = useCallback(
        async () => {
            setLoading(true)
            if (!appContext) { return }
            if (!subscriptionId) { return }
            const apiClient = new ApiClient(appContext)
            const result = await apiClient.dataFeeds.updateDataFeed({ url, enabled }, subscriptionId)
            if (result.errors) {
                console.log(result.errors)
                return
            }
            navigate(`/feeds/${subscriptionId}`)

        }, [appContext, enabled, navigate, subscriptionId, url]
    )

    const createDataFeed = useCallback(
        async () => {
            setLoading(true)
            if (!appContext) { return }
            const apiClient = new ApiClient(appContext)
            const result = await apiClient.dataFeeds.createDataFeed({ url, enabled })
            if (result.errors) {
                console.log(result.errors)
                return
            }
            navigate(`/feeds/${result.data.createDataFeedSubscription?.subscriptionId}`)
        }, [appContext, enabled, navigate, url]
    )



    useEffect(() => {
        if (subscriptionId) {
            getDataFeed()
        } else {
            setLoading(false)
        }
    }, [subscriptionId, getDataFeed])
    return (
        <Container>
            {loading ?
                <SpaceBetween size="l" alignItems="center" direction="vertical">
                    <Spinner size="big" />
                    <h4>Loading...</h4>
                </SpaceBetween> :
                <Form actions={
                    <SpaceBetween size="s" direction="horizontal">
                        <Button onClick={() => {
                            if (subscriptionId) {
                                navigate(`/feeds/${subscriptionId}`)
                            } else {
                                navigate(`/feeds`)
                            }
                        }}>Cancel</Button>
                        <Button variant="primary" onClick={subscriptionId ? updateDataFeed : createDataFeed}>{subscriptionId ? "Update" : "Add"}</Button>
                    </SpaceBetween>
                }>
                    <SpaceBetween size="l" direction="vertical">
                        <FormField label="Data Feed URL" errorText={urlError}>
                            <Input placeholder="https://aws.amazon.com/blogs/aws/feed/" value={url} onChange={e => setUrl(e.detail.value)} type="url" ariaRequired />
                        </FormField>
                        <FormField label="Enabled" description="Should the Data Feed be enabled to bring in new data?" >
                            <Toggle checked={enabled} onChange={e => setEnabled(e.detail.checked)}>Enabled</Toggle>
                        </FormField>
                    </SpaceBetween>
                </Form>
            }
        </Container>
    )
}