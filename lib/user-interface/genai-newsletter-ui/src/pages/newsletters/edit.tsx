import { BreadcrumbGroup } from "@cloudscape-design/components";
import BaseAppLayout from "../../components/base-app-layout";
import useOnFollow from "../../common/hooks/use-on-follow";
import NewsletterWizard from "../../components/newsletters/forms/newsletter-wizard";
import { useParams } from "react-router-dom";



export default function EditNewsletter() {
    const { newsletterId } = useParams();
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
                            "text": "Edit Newsletter",
                            "href": `/newsletters/${newsletterId}/edit`
                        }
                    ]}
                />
            }
            content={
                <NewsletterWizard newsletterId={newsletterId} />
            }
        />
    )
}