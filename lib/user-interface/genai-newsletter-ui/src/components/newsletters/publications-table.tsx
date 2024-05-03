/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../common/app-context'
import { useParams } from 'react-router-dom'
import { Publication } from '../../../../../shared/api/API'
import {
  Button,
  Container,
  ExpandableSection,
  SpaceBetween,
  StatusIndicator
} from '@cloudscape-design/components'
import { listPublications } from '../../../../../shared/api/graphql/queries'
import { generateAuthorizedClient } from '../../common/helpers'

export default function PublicationsTable() {
  const appContext = useContext(AppContext)
  const { newsletterId } = useParams()
  const [publications, setPublications] = useState<Publication[]>(
    []
  )
  const [newsletterContent, setNewsletterContent] = useState<{
    [key: string]: string
  }>({})

  // const [loading, setLoading] = useState(false)

  const getPublicationContent = useCallback(
    async (path: string, publicationId: string) => {
      try {
        const response = await fetch(path, {
          method: 'GET',
          headers: {
            'Content-Type': 'text/html'
          }
        })
        if (response.ok) {
          const content = await response.text()
          const publicationsContent = newsletterContent
          publicationsContent[publicationId] = content
          setNewsletterContent(publicationsContent)
        }

      } catch (error) {
        console.error('Error getting publication content', error)
      }

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
    const apiClient = await generateAuthorizedClient()
    const result = await apiClient.graphql({
      query: listPublications,
      variables: {
        input: {
          id: newsletterId
        }
      }
    })

    if (result.errors) {
      console.error(result.errors)
    } else {
      setPublications([
        ...(result.data.listPublications
          ?.items as Publication[])
      ])

      for (const publication of result.data.listPublications?.items as Publication[]) {
        if (publication.textPath) {
          getPublicationContent(publication.textPath, publication.id)
        }
      }
    }
    // setLoading(false)
  }, [appContext, getPublicationContent, newsletterId])

  const renderHtml = (html: string): { __html: string } => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      return { __html: doc.body.innerHTML }
    } catch (error) {
      console.error(error)
      return { __html: '' }
    }

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
                key={'newsletterPublicationSection' + publication.id}
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
                  {newsletterContent[publication.id] ? (
                    <>
                      <div
                        dangerouslySetInnerHTML={renderHtml(
                          newsletterContent[publication.id]
                        )}
                      />
                    </>
                  ) : (
                    <StatusIndicator
                      key={'status-publication-' + publication.id}
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
