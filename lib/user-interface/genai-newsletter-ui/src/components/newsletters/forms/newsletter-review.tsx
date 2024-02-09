import { Badge, Button, FormField, Header, Link, SpaceBetween, Toggle } from "@cloudscape-design/components";
import { ArticleSummaryType, DataFeedSubscription } from "@shared/api/API";
import { useNavigate, useParams } from "react-router-dom";

interface NewsletterReviewForm {
    title: string
    discoverable: boolean
    shared: boolean
    numberOfDaysToInclude: number
    selectedSubscriptions: DataFeedSubscription[]
    formTitle?: string
    formDescription?: string
    formMode?: 'wizard' | 'detail'
    newsletterIntroPrompt?: string
    articleSummaryType: ArticleSummaryType
    templatePreview?: {
        splitPanelOpen: boolean
        setSplitPanelOpen: (open: boolean) => void
    }
}

export default function NewsletterReviewForm(props: NewsletterReviewForm) {
    const navigate = useNavigate()
    const { newsletterId } = useParams()
    const { title, discoverable, shared, numberOfDaysToInclude, selectedSubscriptions, formTitle, formDescription, formMode = 'wizard', newsletterIntroPrompt, articleSummaryType, templatePreview } = props

    return (
        <SpaceBetween direction="vertical" size="l">
            <Header description={formDescription}
                actions={formMode === 'detail' ?
                    <SpaceBetween size="s" direction="horizontal" alignItems="end">
                        <Button iconName="edit" onClick={() => { navigate(`/newsletters/${newsletterId}/edit`) }}>
                            Edit Newsletter
                        </Button>
                        {templatePreview !== undefined ?
                            <Button
                            iconAlign="right"
                            variant="primary" 
                            onClick={()=>{templatePreview.setSplitPanelOpen(!templatePreview.splitPanelOpen)}}
                            iconName={templatePreview.splitPanelOpen ? "angle-right" : "arrow-left"}>
                                {templatePreview.splitPanelOpen ? "Hide Preview" : "Show Preview"}
                            </Button>
                            : <></>}
                    </SpaceBetween> : null}
            >{formTitle}</Header>
            <FormField label="Newsletter Title">
                {title}
            </FormField>
            <FormField label="Discoverable">
                <Toggle checked={discoverable ?? false} disabled={true} />
            </FormField>
            <FormField label="Shared">
                <Toggle checked={shared ?? false} disabled={true} />
            </FormField>
            <FormField label="Number of Days to Include" description="How many days will be included in the newsletter? This is also how often it is sent.">
                {numberOfDaysToInclude}
            </FormField>
            <FormField label="Content Summary Configuration" description="How will feed content be shown in the newsletter?">
                <Badge>{articleSummaryType === ArticleSummaryType.SHORT_SUMMARY ? "Short Summary" :
                    articleSummaryType === ArticleSummaryType.LONG_SUMMARY ? "Long Summary" :
                        "Keywords"}</Badge>
            </FormField>
            <FormField label="Subscriptions" description="The feeds that provide the content for the newsletter">
                <ul>
                    {selectedSubscriptions.map(subscription => <li key={`selected-subscription-${subscription.subscriptionId}`}>
                        <Link href={`/feeds/${subscription.subscriptionId}`} target="_blank">{subscription.title}</Link>
                    </li>)}
                    {selectedSubscriptions.length === 0 && <li>No subscriptions selected</li>}
                </ul>
            </FormField>
            <FormField label="Newsletter Intro Summary Prompt" description="This prompt helps influence how the Newsletter summary will be written.">
                {newsletterIntroPrompt && newsletterIntroPrompt.length > 0 ? newsletterIntroPrompt : <Badge color="grey">No custom prompt provided</Badge>}
            </FormField>
        </SpaceBetween>
    )
}