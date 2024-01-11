import { NewsFeedSubscription, Newsletter } from "../../API";



export const NewsFeedsTableColumnDefinition = [
{
    id: 'name',
    header: 'Newsletter Name',
    cell: (item:Newsletter) => item.title,
    isHeaderRow: true
},
{
    id: 'numberOfDays',
    header: 'Number of Days between Newsletters',
    cell: (item:Newsletter) => item.numberOfDaysToInclude,
    isHeaderRow: true
},
{
    id: 'discoverable',
    header: 'Discoverable',
    cell: (item:Newsletter) => item.discoverable !== undefined ? (item.discoverable ? "YES":"NO"):"NO",
    isHeaderRow: true
},
{
    id: 'shared',
    header: 'Shared',
    cell: (item:Newsletter) => item.shared !== undefined ? (item.shared ? "YES":"NO"):"NO",
    isHeaderRow: true
},
{
    id: 'Newsletter Created',
    header: 'Newsletter Created',
    cell: (item:Newsletter) => new Date(item.createdAt).toUTCString(),
}
]

export const NewsletterWizardNewsFeedsTableColumnDefinition = [
    {
        id: 'subscriptionId',
        cell: (item:NewsFeedSubscription) => item.subscriptionId,
        header: 'Subscription ID',
        isHeaderRow: false
    },
    {
        id: 'url',
        cell: (item:NewsFeedSubscription) => item.url,
        header: 'Feed URL',
        isHeaderRow: true
    },
    {
        id: 'feedType',
        cell: (item:NewsFeedSubscription) => item.feedType,
        header: 'Feed Type',
        isHeaderRow: true
    }
]

export const NewsletterWizardNewsFeedsTableColumnDisplay = [
    {id: 'subscriptionId', visible: false},
    {id: 'url', visible: true},
    {id: 'feedType', visible: true}
]