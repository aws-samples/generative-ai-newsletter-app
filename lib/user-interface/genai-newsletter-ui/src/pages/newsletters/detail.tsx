import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../common/app-context";
import { ApiClient } from "../../common/api";
import { DataFeedSubscription, Newsletter } from "../../API";
import BaseAppLayout from "../../components/base-app-layout";
import { BreadcrumbGroup, Container, ContentLayout, SpaceBetween, StatusIndicator } from "@cloudscape-design/components";
import useOnFollow from "../../common/hooks/use-on-follow";
import NewsletterReviewForm from "../../components/newsletters/forms/newsletter-review";
import NewsletterEmailsTable from "../../components/newsletters/newsletter-emails-table";
import UserSubscriberData from "../../components/newsletters/user-subscriber-data";


export default function NewsletterDetail() {
    const { newsletterId } = useParams();
    const onFollow = useOnFollow()
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
                    onFollow={onFollow}
                    items={[
                        {
                            text: "GenAI Newsletter",
                            href: "/"
                        },
                        {
                            "text": "Newsletters",
                            "href": "/newsletters"
                        },
                        {
                            text: "Newsletter Details",
                            href: `/newsletters/${newsletterId}`
                        }
                    ]}
                />
            }
            content={
                <ContentLayout>
                    <SpaceBetween direction="vertical" size="m">
                    <Container>
                    {(newsletter != undefined && newsletter.subscriptions !== null) ?
                        <NewsletterReviewForm
                            discoverable={newsletter?.discoverable ?? false}
                            numberOfDaysToInclude={newsletter.numberOfDaysToInclude}
                            selectedSubscriptions={newsletter.subscriptions as DataFeedSubscription[]}
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
                        <Container> 
                            <UserSubscriberData />
                        </Container>
                        <Container>
                            <NewsletterEmailsTable />
                        </Container>
                        </SpaceBetween>
                </ContentLayout>
            }
        />
    )
}