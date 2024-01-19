import { Button, Container, Form, FormField, Input, SpaceBetween, Spinner, Textarea, Toggle } from "@cloudscape-design/components";
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
    const [title, setTitle] = useState<string>('')
    const [titleError] = useState<string>('')
    const [description, setDescription] = useState<string>('')

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
            setTitle(result.data.getDataFeedSubscription?.title ?? '')
            setDescription(result.data.getDataFeedSubscription?.description ?? '')
            setLoading(false)
        }, [appContext, subscriptionId]
    )

    const updateDataFeed = useCallback(
        async () => {
            setLoading(true)
            if (!appContext) { return }
            if (!subscriptionId) { return }
            const apiClient = new ApiClient(appContext)
            const result = await apiClient.dataFeeds.updateDataFeed({ url, enabled, title, description }, subscriptionId)
            if (result.errors) {
                console.log(result.errors)
                return
            }
            navigate(`/feeds/${subscriptionId}`)

        }, [appContext, description, enabled, navigate, subscriptionId, title, url]
    )

    const createDataFeed = useCallback(
        async () => {
            setLoading(true)
            if (!appContext) { return }
            const apiClient = new ApiClient(appContext)
            const result = await apiClient.dataFeeds.createDataFeed({ url, enabled, title, description })
            if (result.errors) {
                console.log(result.errors)
                return
            }
            navigate(`/feeds/${result.data.createDataFeedSubscription?.subscriptionId}`)
        }, [appContext, description, enabled, navigate, title, url]
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
                        <FormField label="Feed Title" description="Give your feed a recognizable title so users know what kind of data will be available." errorText={titleError} >
                            <Input placeholder="A Cool RSS Feed" value={title} onChange={e => setTitle(e.detail.value)} ariaRequired />
                        </FormField>
                        <FormField label={<span>         Feed Description <i>- optional</i>{" "}        </span>} description="Describe your feed in a few words." >
                            <Textarea placeholder="This is a cool RSS feed" value={description} onChange={e => setDescription(e.detail.value)} />
                        </FormField>
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