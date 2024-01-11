import { Header, NonCancelableCustomEvent, Pagination, PaginationProps, Table } from "@cloudscape-design/components";
import { useCallback, useContext, useEffect, useState } from "react";
import { NewsFeedSubscription } from "../../../API";
import { AppContext } from "../../../common/app-context";
import { ApiClient } from "../../../common/api";
import { NewsletterWizardNewsFeedsTableColumnDefinition, NewsletterWizardNewsFeedsTableColumnDisplay } from "../definitions";

export interface NewsletterNewsFeedFormProps {
    selectedSubscriptions: NewsFeedSubscription[]
    setSelectedSubscriptions: (subscriptions: NewsFeedSubscription[]) => void
}

export default function NewsletterNewsFeedForm(props: NewsletterNewsFeedFormProps) {
    const { selectedSubscriptions, setSelectedSubscriptions } = props
    const appContext = useContext(AppContext)
    const [feedSubscriptions, setFeedSubscriptions] = useState<NewsFeedSubscription[]>([])
    const [allNewsFeedSubscriptionsLoaded, setAllNewsFeedSubscriptionsLoaded] = useState<NewsFeedSubscription[]>([])
    const [nextFeedToken, setNextFeedToken] = useState<string>()
    const [nextNextFeedToken, setNextNextFeedToken] = useState<string | null>()
    const [previousFeedTokens, setPreviousFeedTokens] = useState<string[]>([])
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(1)
    const [numberOfPages, setNumberOfPages] = useState<number>(1)
    const [loading, setLoading] = useState<boolean>(true)
    const [resultsLimit] = useState<number>(50)

    const fetch = useCallback(
        async () => {
            if (!appContext) { return }
            const apiClient = new ApiClient(appContext)
            const results = await apiClient.newsFeeds.listNewsFeeds({
                nextToken: nextFeedToken,
                limit: resultsLimit
            })
            setNextNextFeedToken(results.data.getNewsFeedSubscriptions.nextToken)
            if (results?.data?.getNewsFeedSubscriptions?.subscriptions !== null) {
                setFeedSubscriptions([...results.data.getNewsFeedSubscriptions.subscriptions as NewsFeedSubscription[]])
                setAllNewsFeedSubscriptionsLoaded([...allNewsFeedSubscriptionsLoaded, ...results.data.getNewsFeedSubscriptions.subscriptions as NewsFeedSubscription[]])
            }
            setLoading(false)
        }, [appContext, nextFeedToken, resultsLimit, allNewsFeedSubscriptionsLoaded, setAllNewsFeedSubscriptionsLoaded, setFeedSubscriptions, setNextNextFeedToken, setLoading])

    const next = ({ detail: { requestedPageIndex } }: NonCancelableCustomEvent<PaginationProps.PageClickDetail>) => {
        let numPages = numberOfPages
        if (nextNextFeedToken) {
            setLoading(true)
            setNumberOfPages(numPages++)
            if (nextFeedToken) {
                setPreviousFeedTokens([...previousFeedTokens, nextFeedToken])
            }

            setNextFeedToken(nextNextFeedToken)
            setNextNextFeedToken(null)
            if (nextFeedToken !== undefined && nextFeedToken !== null) {
                fetch().then(() => {
                    setCurrentPageIndex(requestedPageIndex)
                })
            }
        }
        if (requestedPageIndex <= numPages) {
            setCurrentPageIndex(requestedPageIndex)
            if(!nextNextFeedToken){
                setFeedSubscriptions(allNewsFeedSubscriptionsLoaded.slice((requestedPageIndex * resultsLimit) -1 , (((requestedPageIndex + 1) * resultsLimit - 1) < allNewsFeedSubscriptionsLoaded.length ? ((requestedPageIndex + 1) * resultsLimit) - 1 : allNewsFeedSubscriptionsLoaded.length)))
            }
            
        }


    }

    const previous = ({ detail: { requestedPageIndex } }: NonCancelableCustomEvent<PaginationProps.PageClickDetail>) => {
        setNextFeedToken(previousFeedTokens.pop())
        setPreviousFeedTokens([...previousFeedTokens])
        setNextNextFeedToken(null)
        setFeedSubscriptions(allNewsFeedSubscriptionsLoaded.slice((requestedPageIndex * resultsLimit) -1 , (((requestedPageIndex + 1) * resultsLimit - 1) < allNewsFeedSubscriptionsLoaded.length ? ((requestedPageIndex + 1) * resultsLimit) - 1 : allNewsFeedSubscriptionsLoaded.length)))
        setCurrentPageIndex(requestedPageIndex)

    }

    useEffect(() => {
        if (loading) {
            fetch()
        }

    }, [fetch, loading])
    return (
        <Table
            items={feedSubscriptions}
            selectedItems={selectedSubscriptions}
            onSelectionChange={({ detail }) => setSelectedSubscriptions(detail.selectedItems)}
            trackBy="subscriptionId"
            loading={loading}
            selectionType="multi"
            header={
                <Header
                    actions={<Pagination
                        currentPageIndex={currentPageIndex}
                        pagesCount={numberOfPages}
                        onNextPageClick={next}
                        openEnd
                        onPreviousPageClick={previous}
                    />}
                ></Header>
            }
            columnDefinitions={NewsletterWizardNewsFeedsTableColumnDefinition}
            columnDisplay={NewsletterWizardNewsFeedsTableColumnDisplay}
        />
    )
}