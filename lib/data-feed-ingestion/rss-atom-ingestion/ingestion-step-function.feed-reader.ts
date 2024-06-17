/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { Logger } from '@aws-lambda-powertools/logger'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import axios from 'axios'
import * as cheerio from 'cheerio'
import middy from '@middy/core'
import { type Article } from '../../shared/api/API'

const SERVICE_NAME = 'feed-reader'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

interface FeedReaderInput {
  url: string
  id: string
  feedType: 'RSS' | 'ATOM'
  accountId: string
}

const lambdaHandler = async (event: FeedReaderInput): Promise<Article[]> => {
  const { url, id, feedType, accountId } = event
  const feed = await getFeed(url)
  metrics.addMetric('FeedReader', MetricUnits.Count, 1)
  const articles = await parseArticlesFromFeed(feed, id, feedType, accountId)
  console.debug(articles.length + ' articles parsed from feed')
  return articles
}

const getFeed = async (url: string): Promise<string> => {
  const response = await axios.get(url)
  return response.data
}

const parseArticlesFromFeed = async (
  feedContents: string,
  dataFeedId: string,
  feedType: 'ATOM' | 'RSS',
  accountId: string
): Promise<Article[]> => {
  return feedType === 'RSS'
    ? await parseRssFeed(feedContents, dataFeedId, accountId)
    : await parseAtomFeed(feedContents, dataFeedId, accountId)
}

const parseRssFeed = async (
  feedContents: string,
  dataFeedId: string,
  accountId: string
): Promise<any[]> => {
  logger.debug('Parsing Articles from RSS Feed')
  const $ = cheerio.load(feedContents, { xmlMode: true })
  const articles: Array<any> = []
  for (const article of $('item')) {
    try {
      logger.debug('Parsing RSS article: ' + $(article).html())
      const articleId = $(article).find('guid').text()
      const url = $(article).find('link').html()
      const title = $(article).find('title').text()
      const providedDescription = $(article).find('description').text()
      const publishDate = $(article).find('pubDate').text()
      const providedCategories = $(article).find('category').text()
      if (url !== null && url.length > 0) {
        articles.push({
          id: articleId,
          account: {
            id: accountId,
            __typename: 'Account'
          },
          title,
          url,
          providedDescription,
          publishDate,
          providedCategories,
          dataFeed: { id: dataFeedId },
          createdAt: new Date().toISOString(),
          __typename: 'Article'
        })
        metrics.addMetric('FeedArticleParsed', MetricUnits.Count, 1)
        metrics.addMetric('RSSFeedArticleParsed', MetricUnits.Count, 1)
        logger.debug(
          `Article parsed from feed: title=${title}; link=${url}; description=${providedDescription}; publishDate=${publishDate}; categories=${providedCategories}`
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
  dataFeedId: string,
  accountId: string
): Promise<Article[]> => {
  logger.debug('Parsing Articles from Atom Feed')
  const $ = cheerio.load(feedContents, { xmlMode: true })
  const articles: Article[] = []
  for (const article of $('entry')) {
    try {
      logger.debug('Parsing ATOM article: ' + $(article).html())
      const articleId = $(article).find('id').text()
      const url = $(article).find('link').attr('href') ?? ''
      const title = $(article).find('title').text()
      const providedDescription = $(article).find('content').text()
      const publishDate = $(article).find('updated').text()
      if (url !== null && url.length > 0) {
        articles.push({
          id: articleId,
          account: {
            id: accountId,
            __typename: 'Account'
          },
          title,
          createdAt: new Date().toISOString(),
          url,
          providedDescription,
          publishDate,
          dataFeedId,
          __typename: 'Article'
        })
        metrics.addMetric('FeedArticleParsed', MetricUnits.Count, 1)
        metrics.addMetric('ATOMFeedArticleParsed', MetricUnits.Count, 1)
        logger.debug(
          `Article parsed from feed: title=${title}; link=${url}; description=${providedDescription}; publishDate=${publishDate};`
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
