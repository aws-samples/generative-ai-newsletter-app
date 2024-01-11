import { BreadcrumbGroup, ContentLayout, Header } from "@cloudscape-design/components";
import BaseAppLayout from "../../components/base-app-layout";
import useOnFollow from "../../common/hooks/use-on-follow";
import DataFeedsTable from "../../components/data-feeds/data-feeds-table";


export default function DataFeedsDashboard() {

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
                        }
                    ]}
                />
            }
            content={
                <ContentLayout
                    header={
                        <Header
                            description="Create new data feeds for Newsletters or browse/update existing feeds.">
                                <h1>Data Feeds</h1>
                                <h3>Automated Information Ingestion, Enhanced by Generative AI</h3>
                            </Header>
                    }>
                        <DataFeedsTable />
                </ContentLayout>
            }
        />
    )
}