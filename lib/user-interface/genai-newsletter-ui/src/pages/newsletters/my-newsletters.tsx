import { BreadcrumbGroup, Container, ContentLayout, Header } from "@cloudscape-design/components";
import BaseAppLayout from "../../components/base-app-layout";
import useOnFollow from "../../common/hooks/use-on-follow";
import NewslettersTable from "../../components/newsletters/newsletters-table";

export default function MyNewsletters() {
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
                            "href": "/newsletters"
                        },
                        {
                            "text": "My Newsletters",
                            "href": "/newsletters/my-newsletters"
                        }
                    ]}
                />
            }
            content={
                <ContentLayout
                    header={
                        <Header
                            description="Create Newsletters or find an existing newsletter to subscribe to or update."
                        ><h1>GenAI Powered Newsletters</h1>
                        
                        </Header>
                    }>
                    <Container>
                        <NewslettersTable title="My Newsletters" getCurrentUser={true} getDiscoverable={false} />
                    </Container>
                </ContentLayout>
            } />
    )
}