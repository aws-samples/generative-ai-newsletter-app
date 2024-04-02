import { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../common/app-context'
import { useParams } from 'react-router-dom'
import { Publication } from '../../../../../shared/api/API'
import { ApiClient } from '../../common/api'
import {
  Button,
  Container,
  ExpandableSection,
  SpaceBetween,
  StatusIndicator
} from '@cloudscape-design/components'

export default function PublicationsTable() {
  const appContext = useContext(AppContext)
  const { newsletterId } = useParams()
  const [publications, setPublications] = useState<Publication[]>(
    []
  )
  const [newsletterContent, setNewsletterContent] = useState<{
    [key: string]: string
  }>({})
  const [nextToken, setNextToken] = useState<string | undefined>()
  // const [loading, setLoading] = useState(false)

  const getPublicationContent = useCallback(
    async (path: string, publicationId: string) => {
      const content = await (await fetch(path)).text()
      const publicationsContent = newsletterContent
      publicationsContent[publicationId] = content
      setNewsletterContent(publicationsContent)
    },
    [newsletterContent]
  )

  const getPublications = useCallback(async () => {
    // setLoading(true)
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.newsletters.listPublications(
      { newsletterId },
      nextToken
    )
    if (result.errors) {
      console.error(result.errors)
    } else {
      setPublications([
        ...(result.data.listPublications
          ?.items as Publication[])
      ])
      if (result.data.listPublications?.nextToken) {
        setNextToken(result.data.listPublications?.nextToken)
      }
      for (const publication of result.data.listPublications
        ?.items as Publication[]) {
        if (publication.htmlPath) {
          getPublicationContent(publication.htmlPath, publication.publicationId)
        }
      }
    }
    // setLoading(false)
  }, [appContext, getPublicationContent, newsletterId, nextToken])

  const renderHtml = (html: string): { __html: string } => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    return { __html: doc.body.innerHTML }
  }

  useEffect(() => {
    getPublications()
  }, [getPublications])
  return (
    <SpaceBetween direction="vertical" size="m">
      {publications.length > 0 ?
        publications.map((publication) => {
          if (publication.htmlPath) {
            return (
              <ExpandableSection
                key={'newsletterPublicationSection' + publication.publicationId}
                headerText={publication.createdAt}
                headerActions={
                  publication.htmlPath !== null &&
                    publication.htmlPath !== undefined &&
                    publication.htmlPath.length > 0 ? (
                    <SpaceBetween size="s" direction="horizontal">
                      <Button
                        onClick={() => {
                          window.open(publication.htmlPath as string, '_blank')
                        }}
                      >
                        Open in a New Window
                      </Button>
                    </SpaceBetween>
                  ) : (
                    <></>
                  )
                }
                variant="stacked"
              >
                <Container>
                  {newsletterContent[publication.publicationId] ? (
                    <>
                      <div
                        dangerouslySetInnerHTML={renderHtml(
                          newsletterContent[publication.publicationId]
                        )}
                      />
                    </>
                  ) : (
                    <StatusIndicator
                      key={'status-publication-' + publication.publicationId}
                      type="loading"
                    >
                      Loading...
                    </StatusIndicator>
                  )}
                </Container>
              </ExpandableSection>
            )
          } else {
            return <></>
          }
        })
      : <p>No Publications Available</p>
    }
    </SpaceBetween>
  )
}
