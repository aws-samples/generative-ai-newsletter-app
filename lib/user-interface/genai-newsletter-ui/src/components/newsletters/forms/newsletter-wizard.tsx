import {
  Wizard,
  Container,
  StatusIndicator,
  Alert,
  AlertProps,
  SpaceBetween,
  Header,
  Button
} from '@cloudscape-design/components'
import {
  useContext,
  useState,
  useCallback,
  useEffect,
  SetStateAction,
  Dispatch
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArticleSummaryType, DataFeed } from '../../../../../../shared/api/API'
import { ApiClient } from '../../../common/api'
import { AppContext } from '../../../common/app-context'
import NewsletterDataFeedsSelectionForm from './data-feeds-selection-table'
import NewsletterDetailsForm from './newsletter-details'
import NewsletterReviewForm from './newsletter-review'
import NewsletterIntroPrompt from './newsletter-intro-prompt'
import { NewsletterStyle } from '../../../../../../shared/common/newsletter-style'
import NewsletterDesignerForm from './newsletter-designer'

interface NewsletterWizardProps {
  newsletterId?: string
  previewPane?: {
    newsletterStyle?: NewsletterStyle
    setNewsletterStyle: Dispatch<SetStateAction<NewsletterStyle>>
    splitPanelOpen: boolean
    setSplitPanelOpen: (open: boolean) => void
  }
}

export default function NewsletterWizard({
  newsletterId,
  previewPane
}: NewsletterWizardProps) {
  const appContext = useContext(AppContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [loadedNewsletterId, setLoadedNewsletterId] = useState<string | null>(
    null
  )
  const navigate = useNavigate()
  const [title, setTitle] = useState<string>('')
  const [isPrivate, setIsPrivate] = useState<boolean>(true)
  const [numberOfDaysToInclude, setNumberOfDaysToInclude] = useState<number>(7)
  const [selectedDataFeeds, setSelectedDataFeeds] = useState<
    DataFeed[]
  >([])
  const [activeWizardStep, setActiveWizardStep] = useState<number>(0)
  const [articleSummaryType, setArticleSummaryType] = useState<ArticleSummaryType>(
    ArticleSummaryType.SHORT_SUMMARY)
  const [newsletterIntroPrompt, setNewsletterIntroPrompt] = useState<string>('')
  const [titleError, setTitleError] = useState<string>('')
  const [numberOfDaysToIncludeError, setNumberOfDaysToIncludeError] =
    useState<string>('')
  const [newsletterStyle, setNewsletterStyle] = useState<NewsletterStyle>(
    new NewsletterStyle()
  )

  const [saving, setSaving] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  const [wizardAlertMessage, setWizardAlertMessage] = useState<string | null>(
    null
  )
  const [wizardAlertHeader, setWizardAlertHeader] = useState<string | null>(
    null
  )
  const [wizardAlertType, setWizardAlertType] =
    useState<AlertProps.Type>('info')

  useEffect(() => {
    const step = searchParams.get('step')
    if (newsletterId !== undefined && step !== null) {
      setActiveWizardStep(parseInt(step))
      const params = searchParams
      params.delete('step')
      setSearchParams(params)
    }
  }, [newsletterId, searchParams, setSearchParams])

  const submitCreateNewsletter = useCallback(async () => {
    setSaving(true)
    if (!appContext) {
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.newsletters.createNewsletter({
      title,
      isPrivate,
      numberOfDaysToInclude,
      dataFeedIds: selectedDataFeeds.map((s) => s.dataFeedId),
      newsletterIntroPrompt,
      articleSummaryType,
      newsletterStyle: JSON.stringify(newsletterStyle)
    })
    if (result.errors) {
      console.error(result.errors)
      setWizardAlertHeader('There was an error creating your Newsletter.')
      setWizardAlertMessage(result.errors.toLocaleString())
      setWizardAlertType('error')
      setSaving(false)
    } else {
      navigate(`/newsletters/${result.data.createNewsletter?.newsletterId}`)
    }
  }, [
    appContext,
    title,
    isPrivate,
    numberOfDaysToInclude,
    selectedDataFeeds,
    newsletterIntroPrompt,
    articleSummaryType,
    newsletterStyle,
    navigate
  ])

  const loadNewsletterDetails = useCallback(async () => {
    console.debug('loadNewsletterDetails running')
    if (!appContext) {
      return
    }
    if (!newsletterId) {
      setLoading(false)
      return
    }
    const apiClient = new ApiClient(appContext)
    const result = await apiClient.newsletters.getNewsletter({ newsletterId })
    if (result.errors) {
      console.error(result.errors)
      setWizardAlertHeader('There was an error loading your Newsletter.')
      setWizardAlertMessage(result.errors.toLocaleString())
      setWizardAlertType('error')
      setLoading(false)
    } else {
      setTitle(result.data.getNewsletter?.title ?? '')
      setIsPrivate(result.data.getNewsletter.isPrivate ?? true)
      setNumberOfDaysToInclude(
        result.data.getNewsletter?.numberOfDaysToInclude ?? 7
      )
      const dataFeedIds = result.data?.getNewsletter?.dataFeedIds ?? []
      const selectedDataFeedItems: DataFeed[] = []
      for (const dataFeedId of dataFeedIds) {
        const dataFeedResult = await apiClient.dataFeeds.getDataFeed({ dataFeedId })
        if (dataFeedResult.data.getDataFeed !== undefined && dataFeedResult.data.getDataFeed !== null) {
          selectedDataFeedItems.push(dataFeedResult.data.getDataFeed)
        }
      }
      setSelectedDataFeeds(selectedDataFeedItems)
      setArticleSummaryType(
        result.data.getNewsletter?.articleSummaryType ?? ArticleSummaryType.SHORT_SUMMARY)
      setNewsletterIntroPrompt(
        result.data.getNewsletter?.newsletterIntroPrompt ?? ''
      )
      if (
        result.data.getNewsletter.newsletterStyle !== undefined &&
        result.data.getNewsletter.newsletterStyle !== null
      ) {
        setNewsletterStyle(
          JSON.parse(result.data.getNewsletter.newsletterStyle)
        )
        if (previewPane) {
          previewPane.setNewsletterStyle(
            JSON.parse(result.data.getNewsletter.newsletterStyle)
          )
        }
      }
      setLoadedNewsletterId(newsletterId)
      setLoading(false)
    }
  }, [appContext, newsletterId, previewPane, setNewsletterStyle])

  const updateNewsletter = useCallback(async () => {
    if (newsletterId !== undefined && newsletterId !== null) {
      setSaving(true)
      if (!appContext) {
        return
      }
      const apiClient = new ApiClient(appContext)
      const result = await apiClient.newsletters.updateNewsletter(
        {
          newsletterId,
          title,
          isPrivate,
          numberOfDaysToInclude,
          dataFeedIds: selectedDataFeeds.map((s) => s.dataFeedId),
          newsletterIntroPrompt,
          articleSummaryType,
          newsletterStyle: JSON.stringify(newsletterStyle)
        }
      )
      if (result.errors) {
        console.error(result.errors)
        setWizardAlertHeader('There was an error updating your Newsletter.')
        setWizardAlertMessage(result.errors.toLocaleString())
        setWizardAlertType('error')
        setSaving(false)
      } else {
        navigate(`/newsletters/${newsletterId}`)
      }
    }
  }, [newsletterId, appContext, title, isPrivate, numberOfDaysToInclude, selectedDataFeeds, newsletterIntroPrompt, articleSummaryType, newsletterStyle, navigate])

  const cancelWizard = useCallback(async () => {
    navigate(newsletterId ? `/newsletters/${newsletterId}` : '/newsletters')
  }, [navigate, newsletterId])

  useEffect(() => {
    if (loadedNewsletterId == null) {
      loadNewsletterDetails()
    }
    if (newsletterStyle !== undefined) {
      previewPane?.setNewsletterStyle(newsletterStyle)
    }
  }, [loadNewsletterDetails, loadedNewsletterId, newsletterStyle, previewPane])
  return (
    <Wizard
      i18nStrings={{
        stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
        collapsedStepsLabel: (stepNumber, stepsCount) =>
          `Step ${stepNumber} of ${stepsCount}`,
        skipToButtonLabel: (step) => `Skip to ${step.title}`,
        navigationAriaLabel: 'Steps',
        cancelButton: 'Cancel',
        previousButton: 'Previous',
        nextButton: 'Next',
        submitButton:
          newsletterId !== undefined
            ? 'Update Newsletter'
            : 'Create Newsletter',
        optional: 'optional'
      }}
      onNavigate={({ detail }) => {
        let noIssues = true
        if (detail.requestedStepIndex === 1) {
          if (title.trim().length < 1) {
            setTitleError(
              'Please provide a newsletter title. This field is required'
            )
            noIssues = false
          } else {
            setTitleError('')
          }
          if (
            numberOfDaysToInclude === undefined ||
            numberOfDaysToInclude < 1 ||
            isNaN(numberOfDaysToInclude)
          ) {
            setNumberOfDaysToIncludeError(
              'Please provide a valid number of days to include for your newsletter. The minimum number of days allowed is 1 day.'
            )
            noIssues = false
          } else {
            setNumberOfDaysToIncludeError('')
          }
        }
        if (noIssues) {
          setActiveWizardStep(detail.requestedStepIndex)
        }
      }}
      activeStepIndex={activeWizardStep}
      onSubmit={
        newsletterId !== undefined &&
          newsletterId !== null &&
          newsletterId.length > 0
          ? updateNewsletter
          : submitCreateNewsletter
      }
      isLoadingNextStep={saving}
      onCancel={cancelWizard}
      allowSkipTo={true}
      steps={[
        {
          title: 'Newsletter Details',
          description: 'Enter the details of your newsletter',
          content: (
            <Container>
              {wizardAlertHeader ? (
                <Alert type={wizardAlertType} header={wizardAlertHeader}>
                  {wizardAlertMessage}
                </Alert>
              ) : (
                <></>
              )}
              {loading ? (
                <StatusIndicator type="loading">
                  Loading Your Newsletter!
                </StatusIndicator>
              ) : (
                <NewsletterDetailsForm
                  title={title}
                  setTitle={setTitle}
                  setIsPrivate={setIsPrivate}
                  isPrivate={isPrivate}
                  numberOfDaysToInclude={numberOfDaysToInclude}
                  setNumberOfDaysToInclude={setNumberOfDaysToInclude}
                  titleError={titleError}
                  numberOfDaysToIncludeError={numberOfDaysToIncludeError}
                  articleSummaryType={articleSummaryType}
                  setArticleSummaryType={setArticleSummaryType}
                />
              )}
            </Container>
          )
        },
        {
          title: 'Add News Feeds',
          description:
            "Select the news feeds you want to include in your newsletter. If you don't see the feed you want, it means the news feed isn't subscribed yet. You'll need to head over to News Feeds to add it to your newsletter",
          content: (
            <Container>
              {wizardAlertHeader ? (
                <Alert type={wizardAlertType} header={wizardAlertHeader}>
                  {wizardAlertMessage}
                </Alert>
              ) : (
                <></>
              )}
              <NewsletterDataFeedsSelectionForm
                includeDiscoverable
                includeOwned
                includeShared
                selectedDataFeeds={selectedDataFeeds}
                setSelectedDataFeeds={setSelectedDataFeeds}
              />
            </Container>
          ),
          isOptional:
            newsletterId !== undefined
        },
        {
          title: 'Define your Newsletter Intro',
          description:
            'Create a prompt to provide guidance to the GenAI Model when it is generating a summary for a Newsletter.' +
            'The model will try to create a high-level newsletter summary from the article summaries included in the newsletter.' +
            "By adding a prompt here, the model's generated summary will be customized according to the prompt." +
            'The prompt does not impact any formatting or any articles included as is purely for the summary',
          content: (
            <Container>
              {wizardAlertHeader ? (
                <Alert type={wizardAlertType} header={wizardAlertHeader}>
                  {wizardAlertMessage}
                </Alert>
              ) : (
                <></>
              )}

              <NewsletterIntroPrompt
                newsletterIntroPrompt={newsletterIntroPrompt}
                setNewsletterIntroPrompt={setNewsletterIntroPrompt}
              />
            </Container>
          ),
          isOptional: true
        },
        {
          title: 'Design your Newsletter style (beta)',
          description:
            'Customize the style of your newsletter to make it yours.',
          isOptional: true,
          content: (
            <Container
              header={
                <Header
                  actions={
                    <SpaceBetween direction="horizontal" size="s">
                      {previewPane ? (
                        <Button
                          variant="primary"
                          iconAlign="right"
                          onClick={() => {
                            previewPane.setSplitPanelOpen(
                              !previewPane.splitPanelOpen
                            )
                          }}
                          iconName={
                            previewPane.splitPanelOpen
                              ? 'angle-right'
                              : 'arrow-left'
                          }
                        >
                          {previewPane.splitPanelOpen
                            ? 'Hide Preview'
                            : 'Show Preview'}
                        </Button>
                      ) : (
                        <></>
                      )}
                    </SpaceBetween>
                  }
                >
                  Customize the style of your Newsletter
                </Header>
              }
            >
              <NewsletterDesignerForm
                style={newsletterStyle}
                setStyle={setNewsletterStyle}
              />
            </Container>
          )
        },
        {
          title: 'Review Newsletter',
          description: 'Review your newsletter details before creating it.',
          content: (
            <SpaceBetween direction="vertical" size="s">
              <Container
                header={
                  <Header
                    actions={
                      <SpaceBetween direction="horizontal" size="s">
                        {previewPane ? (
                          <Button
                            variant="primary"
                            iconAlign="right"
                            onClick={() => {
                              previewPane.setSplitPanelOpen(
                                !previewPane.splitPanelOpen
                              )
                            }}
                            iconName={
                              previewPane.splitPanelOpen
                                ? 'angle-right'
                                : 'arrow-left'
                            }
                          >
                            {previewPane.splitPanelOpen
                              ? 'Hide Preview'
                              : 'Show Preview'}
                          </Button>
                        ) : (
                          <></>
                        )}
                      </SpaceBetween>
                    }
                  />
                }
              >
                {wizardAlertHeader ? (
                  <Alert type={wizardAlertType} header={wizardAlertHeader}>
                    {wizardAlertMessage}
                  </Alert>
                ) : (
                  <></>
                )}
                <NewsletterReviewForm
                  title={title}
                  isPrivate={isPrivate}
                  numberOfDaysToInclude={numberOfDaysToInclude}
                  selectedDataFeeds={selectedDataFeeds}
                  formTitle="Review and Finalize Details"
                  formDescription="Review and finalize the details of your newsletter before saving."
                  newsletterIntroPrompt={newsletterIntroPrompt}
                  articleSummaryType={
                    articleSummaryType
                  }
                />
              </Container>
            </SpaceBetween>
          )
        }
      ]}
    />
  )
}
