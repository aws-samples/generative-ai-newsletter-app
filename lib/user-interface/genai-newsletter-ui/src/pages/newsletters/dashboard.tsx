import { BreadcrumbGroup, Container, Header } from "@cloudscape-design/components";
import BaseAppLayout from "../../components/base-app-layout";
import useOnFollow from "../../common/hooks/use-on-follow";
import NewslettersTable from "../../components/newsletters/newsletters-table";
import BaseContentLayout from "../../components/base-content-layout";

export default function NewslettersDashboard() {
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
                            "text": "Newsletters",
                            "href": "/newsletters/"
                        },
                        {
                            "text": "Dashboard",
                            "href": "#"
                        }
                    ]}
                />
            }
            content={
                <BaseContentLayout
                    header={
                        <Header
                            description="Create Newsletters or find an existing newsletter to subscribe to or update."
                        ><h1>GenAI Powered Newsletters</h1>

                        </Header>
                    }>
                    <Container>
                        <NewslettersTable />
                    </Container>
                </BaseContentLayout>
            } />
    )
}