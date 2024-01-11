import { BreadcrumbGroup } from "@cloudscape-design/components";
import BaseAppLayout from "../../components/base-app-layout";
import useOnFollow from "../../common/hooks/use-on-follow";
import NewsletterWizard from "../../components/newsletters/forms/newsletter-wizard";



export default function CreateNewsletter() {
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
                            "text": "Newsletters",
                            "href": "/newsletters"
                        },
                        {
                            "text": "Create Newsletter",
                            "href": "/newsletters/create"
                        }
                    ]}
                />
            }
            content={
                <NewsletterWizard />
            }
        />
    )
}