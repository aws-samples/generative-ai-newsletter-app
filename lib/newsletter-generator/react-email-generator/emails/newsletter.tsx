import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Section,
    Row,
    Text,
    Link,
    Hr,
    Img,
} from '@react-email/components'
import { Markdown } from '@react-email/markdown'

interface NewsArticle {
    title: string
    content: string
    url: string
    flagLink?: string
}

interface NewsletterEmailProps {
    title?: string;
    articles: NewsArticle[];
    newsletterSummary?: string
    appHostName?: string
    footerOverride?: string
}

export const NewsletterEmail = (props: NewsletterEmailProps) => {
    const detail: NewsletterEmailProps = {
        articles: [],
    }
    if (props === undefined || props.articles === undefined || props.articles.length === 0 || props.title === undefined) {
        detail.appHostName = "#"
        detail.title = 'Sample Newsletter'
        detail.newsletterSummary = "This is a sample newsletter. It is not a real newsletter. It is just a sample newsletter. It is not a real newsletter. It is just a sample newsletter. It is not a real newsletter. It is just a sample newsletter. It is not a real newsletter."
        detail.articles = [
            {
                content: "Filler Content! Filler Content",
                title: "Sample Article",
                url: "#",
                flagLink: "#"
            },
            {
                content: "Filler Content! Filler Content",
                title: "Sample Article",
                url: "#",
                flagLink: "#"
            },
            {
                content: "Filler Content! Filler Content",
                title: "Sample Article",
                url: "#",
                flagLink: "#"
            }
        ]
    } else {
        console.log(props)
        detail.title = props.title
        detail.articles = props.articles
        detail.newsletterSummary = props.newsletterSummary
        detail.appHostName = props.appHostName
        detail.footerOverride = props.footerOverride

    }
    return (
        <Html>
            <Head>
                <title>{detail.title}</title>
            </Head>
            <Preview>Your latest news update!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <h1>{detail.title ?? "Your GenAI Created Newsletter"}</h1>
                    <Markdown>
                        {detail.newsletterSummary ?? "Your customized newsletter, bringing the news you want in a summarized view!"}
                    </Markdown>

                    <Section key="ArticlesSection" style={articlesSection}>
                        {detail.articles.map((article) => {
                            return (
                                <Row key={`article-row-${article.url}`} style={articleRow}>
                                    <h2>{article.title}</h2>
                                    <p>{article.content}</p>
                                    <Link href={article.url}>Read the article</Link>
                                    {detail.appHostName !== undefined && detail.appHostName.length > 0 && article.flagLink !== undefined && article.flagLink.length > 0 ?
                                        <p>
                                            <Link href={`https://${detail.appHostName}${article.flagLink}`} target='_blank' style={flagLink}>Flag this summary</Link>
                                        </p>
                                        : <></>}
                                </Row>
                            )
                        })
                        }
                    </Section>
                    <Hr />
                    <Section key="FooterSection" style={footer}>
                        {detail.footerOverride !== undefined && detail.footerOverride.length > 0 ?
                            detail.footerOverride :
                            <Text>
                                <p>
                                    This newsletter was created automatically and content was summarized using Generative AI services powered by AWS.
                                </p>
                                {detail.appHostName !== undefined && detail.appHostName.length > 2 ?
                                    <Img
                                        src={`https://${detail.appHostName}/images/powered_by_aws.png`}
                                        height="50px" />
                                    : <></>}
                                <br />
                                <p>
                                    Some content may be inaccurate or misleading. If you feel content is incorrect, click the "Flag this summary" link to flag the generated content (*If "Flag this summary" link is available).
                                </p>
                            </Text>}
                    </Section>
                </Container>
            </Body>
        </Html>

    )
}

export default NewsletterEmail

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const footer = {
    bottom: "0",
    width: "100%",
    fontSize: "12px",
    fontStyle: "italic",
    align: "center"
}



const flagLink = {
    fontStyle: "italic",
    fontSize: '12px'
}

const container = {
    margin: "auto",
}

const text = {
    color: "#333",
    fontSize: "14px",
    margin: "24px 0",
};

const articlesSection = {
    margin: "auto",
    backgroundColor: "#f9f9f9",
    paddingLeft: "10px",
    paddingRight: "10px",
}

const articleRow = {
    margin: "0 auto",
    minHeight: "50px"
}