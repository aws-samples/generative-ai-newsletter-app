import {
  Badge,
  Box,
  Button,
  Icon,
  Link,
  Popover,
  SpaceBetween
} from '@cloudscape-design/components'
import { Article, DataFeed } from '../../../../../shared/api/API'

export const NewsletterWizardDataFeedsTableColumnDefinition = () => {
  return [
    {
      id: 'dataFeedId',
      cell: (item: DataFeed) => item.dataFeedId,
      header: 'Data Feed ID',
      isHeaderRow: false
    },
    {
      id: 'title',
      cell: (item: DataFeed) => item.title,
      header: 'Title',
      isHeaderRow: true
    },
    {
      id: 'url',
      cell: (item: DataFeed) => item.url,
      header: 'Feed URL',
      isHeaderRow: true
    },
    {
      id: 'feedType',
      cell: (item: DataFeed) => item.feedType,
      header: 'Feed Type',
      isHeaderRow: true
    }
  ]
}

export const NewsletterWizardNewsFeedsTableColumnDisplay = () => {
  return [
    { id: 'dataFeedId', visible: false },
    { id: 'title', visible: true },
    { id: 'url', visible: true },
    { id: 'feedType', visible: true }
  ]
}

export const DataFeedsTableColumnDisplay = () => {
  return [
    { id: 'dataFeedId', visible: false },
    { id: 'title', visible: true },
    { id: 'url', visible: true },
    { id: 'feedType', visible: true },
    { id: 'enabled', visible: true },
    { id: 'createdAt', visible: true }
  ]
}

export const ArticlesTableColumnDefiniton = (
  flaggedContentHandler: (
    articleId: string,
    flaggedContent: boolean
  ) => Promise<void>
) => {
  return [
    {
      id: 'articleId',
      cell: (item: Article) => item.articleId,
      header: 'Article ID',
      isHeaderRow: false
    },
    {
      id: 'title',
      cell: (item: Article) => item.title,
      header: 'Article Title',
      isHeaderRow: true
    },
    {
      id: 'url',
      cell: (item: Article) => (
        <Link variant="primary" external href={item.url}>
          {item.url}
        </Link>
      ),
      header: 'Article URL',
      isHeaderRow: true
    },
    {
      id: 'summary',
      cell: (item: Article) =>
        item.shortSummary !== null ? (
          <Popover content={<Box>{item.longSummary}</Box>}>
            {item.shortSummary}
          </Popover>
        ) : (
          <Popover content={<Box>{item.articleSummary}</Box>}>
            {item.articleSummary !== undefined &&
              item.articleSummary &&
              item.articleSummary.length > 75
              ? item.articleSummary?.substring(0, 75) + '...'
              : item.articleSummary}
          </Popover>
        ),
      header: 'Article Summary',
      isHeaderRow: true
    },
    {
      id: 'keywords',
      cell: (item: Article) => (
        <SpaceBetween size="xs" direction="horizontal">
          {item.keywords?.split(',').map((keyword: string) => {
            return <Badge color="blue">{keyword}</Badge>
          })}
        </SpaceBetween>
      ),
      header: 'Article Keywords',
      isHeaderRow: true
    },
    {
      id: 'createdAt',
      cell: (item: Article) =>
        item.createdAt ? new Date(item.createdAt).toUTCString() : '',
      header: 'Created At',
      isHeaderRow: true
    },
    {
      id: 'flagged',
      cell: (item: Article) => (
        <Button
          variant="link"
          onClick={() => {
            flaggedContentHandler(
              item.articleId,
              item.flaggedContent !== undefined ? !item.flaggedContent : false
            )
          }}
        >
          <Icon
            name="flag"
            size="big"
            variant={item.flaggedContent ? 'error' : 'normal'}
          />
        </Button>
      ),
      header: 'Flagged Summary',
      isHeaderRow: true
    }
  ]
}

export const DataFeedArticlesTableColumnDisplay = () => {
  return [
    { id: 'articleId', visible: false },
    { id: 'title', visible: true },
    { id: 'url', visible: true },
    { id: 'summary', visible: true },
    { id: 'keywords', visible: true },
    { id: 'createdAt', visible: true },
    { id: 'flagged', visible: true }
  ]
}
