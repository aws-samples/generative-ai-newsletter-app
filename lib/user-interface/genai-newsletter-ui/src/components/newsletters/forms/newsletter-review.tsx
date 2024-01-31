import { Button, FormField, Header, Link, SpaceBetween, Toggle } from "@cloudscape-design/components";
import { DataFeedSubscription } from "../../../API";
import { useNavigate, useParams } from "react-router-dom";

interface NewsletterReviewForm {
    title: string
    discoverable: boolean
    shared: boolean
    numberOfDaysToInclude: number
    selectedSubscriptions: DataFeedSubscription[]
    formTitle: string
    formDescription?: string
    formMode?: 'wizard' | 'detail'
    newsletterIntroPrompt?: string
}

export default function NewsletterReviewForm(props: NewsletterReviewForm) {
    const navigate = useNavigate()
    const { newsletterId } = useParams()
    const { title, discoverable, shared, numberOfDaysToInclude, selectedSubscriptions, formTitle, formDescription, formMode = 'wizard', newsletterIntroPrompt } = props
    return (
        <SpaceBetween direction="vertical" size="l">
            <Header description={formDescription}
                actions={formMode === 'detail' ?
                    <SpaceBetween size="s" direction="horizontal" alignItems="end">
                        <Button iconName="edit" onClick={() => { navigate(`/newsletters/${newsletterId}/edit`) }}>
                            Edit Newsletter
                        </Button>
                    </SpaceBetween> : null}
            >
                {formTitle}
            </Header>
            <FormField label="Newsletter Title">
                {title}
            </FormField>
            <FormField label="Discoverable">
                <Toggle checked={discoverable ?? false} disabled={true} />
            </FormField>
            <FormField label="Shared">
                <Toggle checked={shared ?? false} disabled={true} />
            </FormField>
            <FormField label="Number of Days to Include">
                {numberOfDaysToInclude}
            </FormField>
            <FormField label="Subscriptions">
                <ul>
                    {selectedSubscriptions.map(subscription => <li key={`selected-subscription-${subscription.subscriptionId}`}>
                            <Link href={`/feeds/${subscription.subscriptionId}`} target="_blank">{subscription.title}</Link>
                        </li>)}
                    {selectedSubscriptions.length === 0 && <li>No subscriptions selected</li>}
                </ul>
            </FormField>
            <FormField label="Newsletter Intro Summary Prompt">
                {newsletterIntroPrompt ?? 'No Custom Prompt Provided'}
            </FormField>
        </SpaceBetween>
    )
}