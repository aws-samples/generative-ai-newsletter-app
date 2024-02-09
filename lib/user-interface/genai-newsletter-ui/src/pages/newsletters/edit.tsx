import { BreadcrumbGroup, SplitPanel } from "@cloudscape-design/components";
import BaseAppLayout from "../../components/base-app-layout";
import useOnFollow from "../../common/hooks/use-on-follow";
import NewsletterWizard from "../../components/newsletters/forms/newsletter-wizard";
import { useParams } from "react-router-dom";
import BaseContentLayout from "../../components/base-content-layout";
import NewsletterPreview from "../../components/newsletters/preview";
import { NewsletterStyle } from "@shared/common/newsletter-style";
import { useState } from "react";



export default function EditNewsletter() {
    const { newsletterId } = useParams();
    const onFollow = useOnFollow()
    const [newsletterStyle, setNewsletterStyle] = useState<NewsletterStyle | undefined>()
    const [splitPanelOpen, setSplitPanelOpen] = useState<boolean>(false)
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
                            "text": "Edit Newsletter",
                            "href": `/newsletters/${newsletterId}/edit`
                        }
                    ]}
                />
            }
            splitPanelOpen={splitPanelOpen}
            onSplitPanelToggle={({ detail }) => { setSplitPanelOpen(detail.open) }}
            splitPanelPreferences={{ position: 'side' }}
            splitPanel={
                <SplitPanel
                    header="Preview Newsletter Style"
                    hidePreferencesButton={true}>
                    <NewsletterPreview previewMode={true} styleProps={newsletterStyle} />
                </SplitPanel>
            }
            content={
                <BaseContentLayout>
                    <NewsletterWizard newsletterId={newsletterId} previewPane={{newsletterStyle,setNewsletterStyle,setSplitPanelOpen,splitPanelOpen}} />
                </BaseContentLayout>
            }
        />
    )
}