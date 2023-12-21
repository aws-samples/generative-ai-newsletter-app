import * as React from "react";
import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Section,
    Row,
    Text,
    Link
} from '@react-email/components'

interface NewsArticle {
    title: string
    content: string
    url: string
}

interface NewsletterEmailProps {
    title?: string;
    articles: NewsArticle[];
}

export const NewsletterEmail = (props: NewsletterEmailProps) => (
    <Html>
        <Head />
        <Preview>Your latest news update!</Preview>
        <Body style={main}>
            <Container style={container}>
                <h1>{props.title ?? "Your GenAI Created Newsletter"}</h1>
                <Text style={text}>
                    Your customized newsletter, bringing the news you want in a summarized view!
                </Text>
                <Section style={articlesSection}>
                    {props.articles.map((article) => {
                        return (
                            <Row style={articleRow}>
                                <h2>{article.title}</h2>
                                <p>{article.content}</p>
                                <Link href={article.url}>Read the article</Link>
                            </Row>
                        )
                    })
                    }
                </Section>
            </Container>
        </Body>
    </Html>

)

export default NewsletterEmail

const main = {
    backgroundColor: "#ffffff",
}

const container = {
    margin: "0 auto",
}

const text = {
    color: "#333",
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    margin: "24px 0",
};

const articlesSection = {
    margin: "0 auto",
}

const articleRow = {
    margin: "0 auto",
    minHeight: "50px"
}