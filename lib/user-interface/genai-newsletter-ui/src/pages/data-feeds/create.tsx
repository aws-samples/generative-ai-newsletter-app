import { BreadcrumbGroup, ContentLayout, Header } from "@cloudscape-design/components";
import useOnFollow from "../../common/hooks/use-on-follow";
import BaseAppLayout from "../../components/base-app-layout";
import DataFeedDetailsForm from "../../components/data-feeds/forms/data-feed-details-form";

export default function CreateDataFeed() {
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
                            "text": "Data Feeds Dashboard",
                            "href": "/feeds"
                        },
                        {
                            "text": "Create Data Feed",
                            "href": "/feeds/create"
                        }
                    ]}
                />
            }
            content={
                <ContentLayout
                    header={
                        <Header
                            variant="awsui-h1-sticky"

                            description="Create a feed to bring in the data sources that matter to you. Data feeds automate ingestion and Generative AI enhancement so you can develop meaningful newsletters."
                        >
                            Create a Data Feed
                        </Header>
                    }
                >
                    <DataFeedDetailsForm />
                </ContentLayout>

            }
        />
    )
}