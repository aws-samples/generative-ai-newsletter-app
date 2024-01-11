import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../common/app-context";
import { ApiClient } from "../../common/api";
import { NewsFeedSubscription, Newsletter } from "../../API";
import BaseAppLayout from "../../components/base-app-layout";
import { BreadcrumbGroup, Container, ContentLayout, StatusIndicator } from "@cloudscape-design/components";
import useOnFollow from "../../common/hooks/use-on-follow";
import NewsletterReviewForm from "../../components/newsletters/forms/newsletter-review";


export default function NewsletterDetail() {
    const { newsletterId } = useParams();
    const appContext = useContext(AppContext)
    const [newsletter, setNewsletter] = useState<Newsletter | null>(null)

    const getNewsletter = useCallback(
        async () => {
            if (!appContext) { return }
            if (!newsletterId) { return }
            const apiClient = new ApiClient(appContext)
            const result = await apiClient.newsletters.getNewsletter(newsletterId)
            if (result.errors) {
                console.error(result.errors)
            } else {
                setNewsletter(result.data.getNewsletter)
            }
        }, [appContext, newsletterId]
    )

    useEffect(() => {
        getNewsletter()
    }, [newsletterId, getNewsletter])

    return (
        <BaseAppLayout
            breadcrumbs={
                <BreadcrumbGroup
                    onFollow={useOnFollow}
                    items={[
                        {
                            text: "GenAI Newsletter",
                            href: "/"
                        },
                        {
                            "text": "Newsletters Dashboard",
                            "href": "/newsletters"
                        }
                    ]}
                />
            }
            content={
                <ContentLayout>
                    <Container>
                    {(newsletter != undefined && newsletter.subscriptions !== null) ?
                        <NewsletterReviewForm
                            discoverable={newsletter?.discoverable ?? false}
                            numberOfDaysToInclude={newsletter.numberOfDaysToInclude}
                            selectedSubscriptions={newsletter.subscriptions as NewsFeedSubscription[]}
                            shared={newsletter.shared ?? false}
                            title={newsletter.title}
                            formTitle="Newsletter Details"
                            formDescription="Below are the details about the newsletter."
                            formMode="detail"
                        />
                        : <>
                            <StatusIndicator type="loading">
                                Loading...
                            </StatusIndicator>
                        </>}
                        </Container>
                </ContentLayout>
            }
        />
    )
}