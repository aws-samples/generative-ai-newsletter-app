import * as React from 'react'
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
  Img
} from '@react-email/components'
import { Markdown } from '@react-email/markdown'
import { ArticleSummaryType } from '@shared/api/API'
import { type NewsletterEmailProps } from '@shared/common/newsletter-generator'
import { NewsletterStyle } from '@shared/common/newsletter-style'

export default function NewsletterEmail (props: NewsletterEmailProps): React.ReactElement {
  const { title, articles, appHostName, footerOverride, articleSummaryType, newsletterSummary, previewMode = false } = props
  let { styleProps } = props
  if (styleProps === undefined) {
    styleProps = new NewsletterStyle()
  }
  console.log(styleProps)
  console.log(styleProps.body.backgroundColor)
  let newsletterSummaryContent = ''
  if (articleSummaryType === ArticleSummaryType.LONG_SUMMARY && newsletterSummary?.longSummary.response !== undefined && newsletterSummary?.longSummary.response !== null) {
    newsletterSummaryContent = newsletterSummary.longSummary.response
  }
  if (articleSummaryType === ArticleSummaryType.SHORT_SUMMARY && newsletterSummary?.shortSummary.response != null) {
    newsletterSummaryContent = newsletterSummary.shortSummary.response
  }

  const body = (<Body style={styleProps.body}>
    <Container style={container}>
      <h1>{title ?? 'Your GenAI Created Newsletter'}</h1>
      <Markdown>
        {newsletterSummaryContent}
      </Markdown>

      <Section key="ArticlesSection" style={styleProps.content}>
        {articles?.map((article) => {
          return (
            <Row key={`article-row-${article.url}`} style={articleRow}>
              <h2>{article.title}</h2>
              {articleSummaryType === ArticleSummaryType.LONG_SUMMARY
                ? article.content.longSummary.response
                : article.content.shortSummary.response
              }
              <Link href={article.url}>Read the article</Link>
              {appHostName !== undefined && appHostName.length > 0 && article.flagLink !== undefined && article.flagLink.length > 0
                ? <p>
                  <Link href={`https://${appHostName}${article.flagLink}`} target='_blank' style={flagLink}>Flag this summary</Link>
                </p>
                : <></>}
            </Row>
          )
        })
        }
      </Section>
      <Hr />
      <Section key="FooterSection" style={footer}>
        {footerOverride !== undefined && footerOverride.length > 0
          ? footerOverride
          : <Text>
            <p>
              This newsletter was created automatically and content was summarized using Generative AI services powered by AWS.
            </p>
            {appHostName !== undefined && appHostName.length > 2
              ? <Img
                src={`https://${appHostName}/images/powered_by_aws.png`}
                height="50px" />
              : <></>}
            <br />
            <Text>
              Some content may be inaccurate or misleading. If you feel content is incorrect,
              click the &quote;Flag this summary&quote; link to flag the generated content
              (*If &quote;Flag this summary&quote; link is available).
            </Text>
          </Text>}
      </Section>
    </Container>
  </Body>)

  return !previewMode
    ? (
      <Html>
        <Head>
          <title>{title}</title>
        </Head>
        <Preview>Your latest news update!</Preview>
        {body}
      </Html>
      )
    : (body)
}

// const main = {
//   backgroundColor: '#ffffff',
//   fontFamily:
//     "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
// }

const footer = {
  bottom: '0',
  width: '100%',
  fontSize: '12px',
  fontStyle: 'italic',
  align: 'center'
}

const flagLink = {
  fontStyle: 'italic',
  fontSize: '12px'
}

const container = {
  margin: 'auto'
}

// const articlesSection = {
//   margin: 'auto',
//   backgroundColor: '#f9f9f9',
//   paddingLeft: '10px',
//   paddingRight: '10px'
// }

const articleRow = {
  margin: '0 auto',
  minHeight: '50px'
}
