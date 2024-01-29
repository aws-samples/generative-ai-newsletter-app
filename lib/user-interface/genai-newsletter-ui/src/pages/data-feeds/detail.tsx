import { BreadcrumbGroup, Button, Header, SpaceBetween } from "@cloudscape-design/components";
import BaseAppLayout from "../../components/base-app-layout";
import useOnFollow from "../../common/hooks/use-on-follow";
import DataFeedDetail from "../../components/data-feeds/data-feed-detail";
import { useNavigate, useParams } from "react-router-dom";
import DataFeedArticleTable from "../../components/data-feeds/data-feed-article-table";
import BaseContentLayout from "../../components/base-content-layout";

export default function DataFeedDetails() {
    const navigate = useNavigate()
    const { subscriptionId } = useParams()
    const onFollow = useOnFollow()


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
                            "text": "Data Feeds",
                            "href": "/feeds"
                        },
                        {
                            "text": "Data Feed Details",
                            "href": `/feeds/${subscriptionId}`
                        }
                    ]}
                />
            }
            content={
                <BaseContentLayout
                    header={
                        <Header
                            variant="awsui-h1-sticky"
                            description="Browse the details of the Data Feed"
                            actions={
                                <SpaceBetween size="xs" direction="horizontal">
                                    <Button onClick={() => { navigate(`/feeds/${subscriptionId}/edit`) }}>Edit</Button>
                                    <Button disabled>Delete (Not Yet Implemented)</Button>
                                </SpaceBetween>
                            }

                        >Data Feed Details</Header>
                    }
                >
                    <SpaceBetween size="l" direction="vertical">
                        <DataFeedDetail />
                        <DataFeedArticleTable />
                    </SpaceBetween>

                </BaseContentLayout>
            }
        />
    )
}