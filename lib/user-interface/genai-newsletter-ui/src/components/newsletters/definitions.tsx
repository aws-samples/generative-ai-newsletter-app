import { Box, Link, Popover } from "@cloudscape-design/components";
import { DataFeedArticle, DataFeedSubscription } from "../../API";





export const NewsletterWizardDataFeedsTableColumnDefinition = [
    {
        id: 'subscriptionId',
        cell: (item: DataFeedSubscription) => item.subscriptionId,
        header: 'Subscription ID',
        isHeaderRow: false
    },
    {
        id: 'url',
        cell: (item: DataFeedSubscription) => item.url,
        header: 'Feed URL',
        isHeaderRow: true
    },
    {
        id: 'feedType',
        cell: (item: DataFeedSubscription) => item.feedType,
        header: 'Feed Type',
        isHeaderRow: true
    }
]

export const NewsletterWizardNewsFeedsTableColumnDisplay = [
    { id: 'subscriptionId', visible: false },
    { id: 'url', visible: true },
    { id: 'feedType', visible: true }
]




export const DataFeedsTableColumnDisplay = [
    { id: 'subscriptionId', visible: false },
    { id: 'url', visible: true },
    { id: 'feedType', visible: true },
    { id: 'enabled', visible: true },
    { id: 'createdAt', visible: true }
]

export const DataFeedArticlesTableColumnDefiniton = [
    {
        id: 'articleId',
        cell: (item: DataFeedArticle) => item.articleId,
        header: 'Article ID',
        isHeaderRow: false
    },
    {
        id: 'title',
        cell: (item: DataFeedArticle) => item.title,
        header: 'Article Title',
        isHeaderRow: true
    },
    {
        id: 'url',
        cell: (item: DataFeedArticle) => (
            <Link variant="primary" external href={item.url}>{item.url}</Link>
        ),
        header: 'Article URL',
        isHeaderRow: true
    },
    {
        id: 'summary',
        cell: (item: DataFeedArticle) => (
            <Popover
                content={
                    <Box>
                        {item.articleSummary}
                    </Box>
                }
            >
                {item.articleSummary.length < 75 ? item.articleSummary : item.articleSummary.substring(0, 75) + "..."}
            </Popover>
        ),
        header: 'Article Summary',
        isHeaderRow: true,
    },
    {
        id: 'createdAt',
        cell: (item: DataFeedArticle) => item.createdAt ? new Date(item.createdAt).toUTCString() : '',
        header: 'Created At',
        isHeaderRow: true,
    }
]



export const DataFeedArticlesTableColumnDisplay = [
    { id: 'articleId', visible: false },
    { id: 'title', visible: true },
    { id: 'url', visible: true },
    { id: 'summary', visible: true },
    { id: 'createdAt', visible: true }
]