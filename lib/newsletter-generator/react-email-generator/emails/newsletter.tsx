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
import { type ArticleData } from '../../../prompts/types'
import { ArticleSummaryType } from '../../../api/API'
import { type MultiSizeFormattedResponse } from '../../../prompts/prompt-processing'

interface NewsletterEmailProps {
  title?: string
  articles: ArticleData[]
  newsletterSummary: MultiSizeFormattedResponse
  appHostName?: string
  footerOverride?: string
  articleSummaryType: ArticleSummaryType
}

export default function NewsletterEmail(props: NewsletterEmailProps): React.ReactElement {
  const { title, articles, appHostName, footerOverride, articleSummaryType, newsletterSummary } = props
  let newsletterSummaryContent = ''
  if (articleSummaryType === ArticleSummaryType.LONG_SUMMARY && newsletterSummary.longSummary.response != null) {
    newsletterSummaryContent = newsletterSummary.longSummary.response
  }
  if (articleSummaryType === ArticleSummaryType.SHORT_SUMMARY && newsletterSummary.shortSummary.response != null) {
    newsletterSummaryContent = newsletterSummary.shortSummary.response
  }

  // if (props?.articles === undefined || props.articles.length === 0 || props.title === undefined) {
  //   detail.appHostName = '#'
  //   detail.title = 'Sample Newsletter'
  //   detail.newsletterSummary = 'This is a sample newsletter. It is not a real newsletter. It is just a sample newsletter. It is not a real newsletter. It is just a sample newsletter. It is not a real newsletter. It is just a sample newsletter. It is not a real newsletter.'
  //   const response = new MultiSizeFormattedResponse({
  //     keywords: 'AAA, BBB, CCC',
  //     longSummary: 'This is a sample newsletter. It is not a real newsletter. It is just a sample newsletter. It is not a real newsletter. It is just a sample newsletter. It is not a real newsletter. It is just a sample newsletter. It is not a real newsletter.',
  //     shortSummary: 'This is a sample newsletter.'
  //   })
  //   detail.articles = [
  //     {
  //       content: response,
  //       title: 'Sample Article',
  //       url: '#',
  //       flagLink: '#',
  //       createdAt: ''
  //     },
  //     {
  //       content: response,
  //       title: 'Sample Article',
  //       url: '#',
  //       flagLink: '#',
  //       createdAt: ''
  //     },
  //     {
  //       content: response,
  //       title: 'Sample Article',
  //       url: '#',
  //       flagLink: '#',
  //       createdAt: ''
  //     }
  //   ]
  // } else {
  //   console.log(props)
  //   detail.title = props.title
  //   detail.articles = props.articles
  //   detail.newsletterSummary = props.newsletterSummary
  //   detail.appHostName = props.appHostName
  //   detail.footerOverride = props.footerOverride
  // }
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Preview>Your latest news update!</Preview>
      <Body style={main}>
        <Container style={container}>
          <h1>{title ?? 'Your GenAI Created Newsletter'}</h1>
          <Markdown>
            {newsletterSummaryContent}
          </Markdown>

          <Section key="ArticlesSection" style={articlesSection}>
            {articles.map((article) => {
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
                  click the "Flag this summary" link to flag the generated content
                  (*If "Flag this summary" link is available).
                </Text>
              </Text>}
          </Section>
        </Container>
      </Body>
    </Html>

  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
}

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

// const text = {
//   color: '#333',
//   fontSize: '14px',
//   margin: '24px 0'
// }

const articlesSection = {
  margin: 'auto',
  backgroundColor: '#f9f9f9',
  paddingLeft: '10px',
  paddingRight: '10px'
}

const articleRow = {
  margin: '0 auto',
  minHeight: '50px'
}
