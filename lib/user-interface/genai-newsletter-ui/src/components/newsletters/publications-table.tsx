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
  Box,
  Button,
  Container,
  ExpandableSection,
  SpaceBetween,
} from '@cloudscape-design/components'
import { LoadingBar } from '@cloudscape-design/chat-components'
import { listPublications } from '../../../../../shared/api/graphql/queries'
import { generateAuthorizedClient } from '../../common/helpers'
import Newsletter from './newsletter'

export default function PublicationsTable() {
  const appContext = useContext(AppContext)
  const { newsletterId } = useParams()
  const [publications, setPublications] = useState<Publication[]>([])
  const [publicationsLoading, setPublicationsLoading] = useState<boolean>(true)

  const getPublications = useCallback(async () => {
    setPublicationsLoading(true)
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
    });

    if (result.errors) {
      console.error(result.errors);
    } else {
      const sortedPublications = [...(result.data.listPublications?.items as Publication[])]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt ?? 0);
          const dateB = new Date(b.createdAt ?? 0);
          return dateB.getTime() - dateA.getTime();
        });
      setPublications(sortedPublications);
      setPublicationsLoading(false)
    }

  }, [appContext, newsletterId])

  useEffect(() => {
    getPublications()
  }, [getPublications])
  return (
    <SpaceBetween direction="vertical" size="m">
      {publicationsLoading ? (
        <SpaceBetween direction='vertical' size='m'>
          <Box margin={{ bottom: "xs", left: "l"}}>
            Loading Newsletter Publications
          </Box>
          <LoadingBar variant='gen-ai' />
        </SpaceBetween>
      ) : (
        publications.length > 0 ? (
          publications.map((publication) => {
            if (publication.filePath) {
              return (
                <ExpandableSection
                  key={'newsletterPublicationSection' + publication.id}
                  headerText={publication.createdAt}
                  headerActions={
                    publication.filePath !== null &&
                      publication.filePath !== undefined &&
                      publication.filePath.length > 0 ? (
                      <SpaceBetween size="s" direction="horizontal">
                        <Button
                          onClick={() => {
                            window.open(
                              (publication.filePath + '.html') as string,
                              '_blank'
                            )
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
                    <Newsletter
                      filePath={publication.filePath}
                      key={`rendered-newsletter-${publication.id}`}
                    />
                  </Container>
                </ExpandableSection>
              )
            } else {
              return <></>
            }
          })
        ) : (
          <p>No Publications Available</p>
        )
      )}
    </SpaceBetween>
  )
}
