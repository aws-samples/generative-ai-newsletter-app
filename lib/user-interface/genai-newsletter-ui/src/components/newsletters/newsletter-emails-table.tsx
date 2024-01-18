import { useCallback, useContext, useEffect, useState } from "react"
import { AppContext } from "../../common/app-context"
import { useParams } from "react-router-dom"
import { NewsletterEmail } from "../../API"
import { ApiClient } from "../../common/api"
import { Container, ExpandableSection, SpaceBetween, StatusIndicator } from "@cloudscape-design/components"



export default function NewsletterEmailsTable() {
    const appContext = useContext(AppContext)
    const { newsletterId } = useParams()
    const [newsletterEmails, setNewsletterEmails] = useState<NewsletterEmail[]>([])
    const [newsletterContent, setNewsletterContent] = useState<{ [key: string]: string }>({})
    const [nextToken, setNextToken] = useState<string | undefined>()
    // const [loading, setLoading] = useState(false)

    const getNewsletterEmailContent = useCallback(
        async (path: string, emailId: string) => {
            const content = await (await fetch(path)).text()
            const newsletterEmailsContent = newsletterContent
            newsletterEmailsContent[emailId] = content
            setNewsletterContent(newsletterEmailsContent)
        }, [newsletterContent]
    )

    const getNewsletterEmails = useCallback(
        async () => {
            // setLoading(true)
            if (!appContext) { return }
            if (!newsletterId) { return }
            const apiClient = new ApiClient(appContext)
            const result = await apiClient.newsletters.getNewsletterEmails({ newsletterId }, nextToken)
            if (result.errors) {
                console.error(result.errors)
            } else {
                setNewsletterEmails([...result.data.getNewsletterEmails?.newsletterEmails as NewsletterEmail[]])
                if (result.data.getNewsletterEmails?.nextToken) {
                    setNextToken(result.data.getNewsletterEmails?.nextToken)
                }
                for (const email of result.data.getNewsletterEmails?.newsletterEmails as NewsletterEmail[]) {
                    if (email.htmlPath) {
                        getNewsletterEmailContent(email.htmlPath, email.emailId)
                    }
                }
            }
            // setLoading(false)
        }, [appContext, getNewsletterEmailContent, newsletterId, nextToken]
    )

    const renderHtml = (html: string): { __html: string } => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return { __html: doc.body.innerHTML }
    }
 
    useEffect(() => {
        getNewsletterEmails()
    }, [getNewsletterEmails])
    return (
        <SpaceBetween direction="vertical" size="m">
            {newsletterEmails.map((email) => {
                if (email.htmlPath) {
                    return (<ExpandableSection
                        key={"newsletterEmailSection" + email.emailId}
                        headerText={email.createdAt}
                        variant="stacked"
                    >
                        <Container>
                            {newsletterContent[email.emailId] ? (
                                <>
                                <div dangerouslySetInnerHTML={renderHtml(newsletterContent[email.emailId])} />
                                </>
                            ) : (
                                <StatusIndicator key={"status-email-" + email.emailId} type="loading">
                                    Loading...
                                </StatusIndicator>
                            )}
                        </Container>
                    </ExpandableSection>)
                }

            })}

        </SpaceBetween>
    )
}