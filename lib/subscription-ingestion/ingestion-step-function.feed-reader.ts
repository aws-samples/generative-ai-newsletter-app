import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import axios from 'axios'
import * as cheerio from 'cheerio'
import middy from '@middy/core'
import { type FeedArticle } from '../shared/common/newsletter-ingestion'

const SERVICE_NAME = 'feed-reader'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

interface FeedReaderInput {
  url: string
  id: string
  feedType: 'RSS' | 'ATOM'
}

const lambdaHandler = async (
  event: FeedReaderInput
): Promise<FeedArticle[]> => {
  const url = event.url
  const feed = await getFeed(url)
  metrics.addMetric('FeedReader', MetricUnits.Count, 1)
  const articles = await parseArticlesFromFeed(feed, event.id, event.feedType)
  console.debug(articles.length + ' articles parsed from feed')
  return articles
}

const getFeed = async (url: string): Promise<string> => {
  const response = await axios.get(url)
  return response.data
}

const parseArticlesFromFeed = async (
  feedContents: string,
  subscriptionId: string,
  feedType: 'ATOM' | 'RSS'
): Promise<FeedArticle[]> => {
  return feedType === 'RSS'
    ? await parseRssFeed(feedContents, subscriptionId)
    : await parseAtomFeed(feedContents, subscriptionId)
}

const parseRssFeed = async (
  feedContents: string,
  subscriptionId?: string
): Promise<FeedArticle[]> => {
  logger.debug('Parsing Articles from RSS Feed')
  const $ = cheerio.load(feedContents, { xmlMode: true })
  const articles: FeedArticle[] = []
  for (const article of $('item')) {
    try {
      logger.debug('Parsing RSS article: ' + $(article).html())
      const guid = $(article).find('guid').text()
      const link = $(article).find('link').html()
      const title = $(article).find('title').text()
      const description = $(article).find('description').text()
      const publishDate = $(article).find('pubDate').text()
      const categories = $(article).find('category').text()
      if (link !== null && link.length > 0) {
        articles.push({
          title,
          link,
          description,
          publishDate,
          categories,
          guid,
          subscriptionId
        })
        metrics.addMetric('FeedArticleParsed', MetricUnits.Count, 1)
        metrics.addMetric('RSSFeedArticleParsed', MetricUnits.Count, 1)
        logger.debug(
          `Article parsed from feed: title=${title}; link=${link}; description=${description}; publishDate=${publishDate}; categories=${categories}`
        )
      } else {
        throw Error('Link is empty')
      }
    } catch (error) {
      logger.error('Failed to parse article from feed')
      metrics.addMetric('FeedArticleParsingFailed', MetricUnits.Count, 1)
    }
  }
  return articles
}

const parseAtomFeed = async (
  feedContents: string,
  subscriptionId?: string
): Promise<FeedArticle[]> => {
  logger.debug('Parsing Articles from Atom Feed')
  const $ = cheerio.load(feedContents, { xmlMode: true })
  const articles: FeedArticle[] = []
  for (const article of $('entry')) {
    try {
      logger.debug('Parsing ATOM article: ' + $(article).html())
      const guid = $(article).find('id').text()
      const link = $(article).find('link').attr('href') ?? ''
      const title = $(article).find('title').text()
      const description = $(article).find('content').text()
      const publishDate = $(article).find('updated').text()
      if (link !== null && link.length > 0) {
        articles.push({
          title,
          link,
          description,
          publishDate,
          guid,
          subscriptionId
        })
        metrics.addMetric('FeedArticleParsed', MetricUnits.Count, 1)
        metrics.addMetric('ATOMFeedArticleParsed', MetricUnits.Count, 1)
        logger.debug(
          `Article parsed from feed: title=${title}; link=${link}; description=${description}; publishDate=${publishDate};`
        )
      } else {
        throw Error('Link is empty')
      }
    } catch (error) {
      logger.error('Failed to parse article from feed')
    }
  }
  return articles
}

export const handler = middy()
  .handler(lambdaHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
