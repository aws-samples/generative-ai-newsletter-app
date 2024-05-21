import {
  Box,
  Container,
  Header,
  Link,
  StatusIndicator
} from '@cloudscape-design/components'
import { NewsletterJSONData } from '../../../../../shared/email-generator/newsletter-json-data'
import { useCallback, useEffect, useState } from 'react'

export default function Newsletter(props: { filePath: string }) {
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<NewsletterJSONData>()
  const loadData = useCallback(async () => {
    try {
      console.log('loading newsletter')
      setLoading(true)
      const data = await fetch(`${props.filePath}.json`)
      const json = (await data.json()) as NewsletterJSONData
      setData(json)
    } catch (e) {
      console.log(e)
    }
    setLoading(false)
  }, [props.filePath])
  useEffect(() => {
    loadData()
  }, [loadData])
  return (
    <Container header={<Header>{data?.title}</Header>}>
      {loading ? (
        <StatusIndicator type="loading">Loading Newsletter</StatusIndicator>
      ) : (
        <div>
          <p>{data?.newsletterSummary}</p>
          {data?.articles.map((article) => {
            return (
              <Box key={`publication-article-${article.url}`}>
                <h3>{article.title}</h3>
                <p>{article.content}</p>
                <p>
                  <Link external target="_blank" href={article.url}>
                    Read Article
                  </Link>
                </p>
                {article.flagLink !== null ? (
                  <p>
                    <Link href={article.flagLink}>Flag Summary Content</Link>
                  </p>
                ) : (
                  <></>
                )}
              </Box>
            )
          })}
        </div>
      )}
    </Container>
  )
}
