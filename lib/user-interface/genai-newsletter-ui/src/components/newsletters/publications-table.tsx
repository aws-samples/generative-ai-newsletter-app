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
  SpaceBetween
} from '@cloudscape-design/components'
import { listPublications } from '../../../../../shared/api/graphql/queries'
import { generateAuthorizedClient } from '../../common/helpers'
import Newsletter from './newsletter'

export default function PublicationsTable() {
  const appContext = useContext(AppContext)
  const { newsletterId } = useParams()
  const [publications, setPublications] = useState<Publication[]>(
    []
  )
 
  const getPublications = useCallback(async () => {
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

    }
  }, [appContext, newsletterId])


  useEffect(() => {
    getPublications()
  }, [getPublications])
  return (
    <SpaceBetween direction="vertical" size="m">
      {publications.length > 0 ?
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
                            window.open(publication.filePath + '.html' as string, '_blank')
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

                    <Newsletter filePath={publication.filePath} key={`rendered-newsletter-${publication.id}`}/>
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
