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
import { ArticleSummaryType } from 'genai-newsletter-shared/api/API'
import { type NewsletterEmailProps } from 'genai-newsletter-shared/common/types'
import { NewsletterStyle } from 'genai-newsletter-shared/common/newsletter-style'

export default function NewsletterEmail (
  props: NewsletterEmailProps
): React.ReactElement {
  const {
    title,
    articles,
    appHostName,
    footerOverride,
    articleSummaryType,
    newsletterSummary,
    previewMode = false,
    styleProps = new NewsletterStyle()
  } = props
  let newsletterSummaryContent = ''
  if (
    articleSummaryType === ArticleSummaryType.LONG_SUMMARY &&
    newsletterSummary?.longSummary.response !== undefined &&
    newsletterSummary?.longSummary.response !== null
  ) {
    newsletterSummaryContent = newsletterSummary.longSummary.response
  }
  if (
    articleSummaryType === ArticleSummaryType.SHORT_SUMMARY &&
    newsletterSummary?.shortSummary.response != null
  ) {
    newsletterSummaryContent = newsletterSummary.shortSummary.response
  }
  const body: React.ReactElement = (
    <Body style={styleProps.body}>
      <Container style={container}>
        <Text style={styleProps.introHeader}>
          {title ?? 'Your GenAI Created Newsletter'}
        </Text>
        <Text style={styleProps.introBody}>{newsletterSummaryContent}</Text>

        <Section key="ArticlesSection" style={styleProps.content}>
          {articles?.map((article) => {
            return (
              <Row key={`article-row-${article.url}`} style={articleRow}>
                <Text style={styleProps?.contentHeader}>{article.title}</Text>
                <Text style={styleProps?.contentBody}>
                  {articleSummaryType === ArticleSummaryType.LONG_SUMMARY
                    ? article.content.longSummary.response
                    : article.content.shortSummary.response}
                </Text>
                <Text>
                  <Link href={article.url}>Read the article</Link>
                </Text>
                {appHostName !== undefined &&
                  appHostName.length > 0 &&
                  article.flagLink !== undefined &&
                  article.flagLink.length > 0
                  ? (
                    <Text>
                      <Link
                        href={`https://${appHostName}${article.flagLink}`}
                        target="_blank"
                        style={flagLink}
                      >
                        Flag this summary
                      </Link>
                    </Text>
                  )
                  : (
                    <></>
                  )}
              </Row>
            )
          })}
        </Section>
        <Hr />
        <Section key="FooterSection" style={footer}>
          {footerOverride !== undefined && footerOverride.length > 0
            ? (
              footerOverride
            )
            : (
              <Text>
                <p>
                  This newsletter was created automatically and content was
                  summarized using Generative AI services powered by AWS.
                </p>
                {appHostName !== undefined && appHostName.length > 2
                  ? (
                    <Img
                      src={
                        appHostName === '/'
                          ? '/images/powered_by_aws.png'
                          : `https://${appHostName}/images/powered_by_aws.png`
                      }
                      height="50px"
                    />
                  )
                  : (
                    <></>
                  )}
                <br />
                <Text>
                  Some content may be inaccurate or misleading. If you feel
                  content is incorrect, click the Flag this summary link to flag
                  the generated content (*If Flag this summary link is available).
                </Text>
              </Text>
            )}
        </Section>
      </Container>
    </Body>
  )

  return !previewMode
    ? (
      <Html>
        <Head>
          <title>{title}</title>
        </Head>
        <Preview>Your latest news update!</Preview>
        {body}
      </Html>
    ) as React.ReactElement
    : (
      body
    )
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
const articleRow = {
  margin: '0 auto',
  paddingLeft: '10px',
  paddingRight: '10px',
  minHeight: '50px'
}
