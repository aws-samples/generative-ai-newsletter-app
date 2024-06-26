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
import { S3Client } from '@aws-sdk/client-s3'

import {
  DynamoDBClient,
  PutItemCommand,
  type PutItemCommandInput
} from '@aws-sdk/client-dynamodb'
import { Upload } from '@aws-sdk/lib-storage'
import { marshall } from '@aws-sdk/util-dynamodb'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { v4 as uuidv4 } from 'uuid'
import middy from '@middy/core'
import { ArticleSummaryBuilder } from '../../shared/prompts/article-summary-prompt'
import { type MultiSizeFormattedResponse } from '../../shared/prompts/prompt-processing'
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput
} from '@aws-sdk/client-bedrock-runtime'

const SERVICE_NAME = 'article-ingestor'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const s3Client = tracer.captureAWSv3Client(new S3Client())
const dynamodbClient = tracer.captureAWSv3Client(new DynamoDBClient())
const bedrockRuntimeClient = tracer.captureAWSv3Client(
  new BedrockRuntimeClient()
)

const BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'
const NEWS_DATA_INGEST_BUCKET = process.env.NEWS_DATA_INGEST_BUCKET
const DATA_FEED_TABLE = process.env.DATA_FEED_TABLE

interface ArticleIngestorInput {
  summarizationPrompt?: string
  input: {
    url: string
    dataFeed: {
      id: string
    }
    id?: string
    title: string
    account: {
      id: string
      __typename: 'Account'
    }
  }
}

const lambdaHander = async (event: ArticleIngestorInput): Promise<void> => {
  const { dataFeed, account, id: inputArticleId, url, title } = event.input
  const summarizationPrompt = event.summarizationPrompt
  const subsegment = tracer.getSegment()?.addNewSubsegment('### ingestArticle')
  if (subsegment !== undefined) {
    tracer.setSegment(subsegment)
  }
  try {
    if (url === undefined) {
      throw new Error('No url to crawl')
    }
    const articleId = inputArticleId?.trim() ?? uuidv4()
    const $ = await getSiteContent(url)
    let articleText: string = ''
    if ($('article').length > 0) {
      articleText = $('article').text()
    } else {
      articleText = $('body').text()
    }
    if (articleText !== undefined) {
      try {
        await storeSiteContent(articleText, dataFeed.id, articleId)
      } catch (error) {
        logger.error('Failed to store site contents to s3 ', {
          error,
          url,
          dataFeed,
          articleId,
          title,
          articleText
        })
      }
      let response
      try {
        response = await generateArticleSummarization(
          articleText,
          summarizationPrompt
        )
      } catch (error) {
        logger.error('Failed to generate article summary for ' + url, {
          error
        })
        tracer.addErrorAsMetadata(error as Error)
        logger.debug('Attempting to find a fallback URL')
        const redirectFallback = checkForRedirectFallback($)
        if (redirectFallback !== null) {
          const $$ = await getSiteContent(url)
          if ($$('article').length > 0) {
            articleText = $$('article').text()
          } else {
            articleText = $$('body').text()
          }
          if (articleText !== undefined && articleText.length > 255) {
            try {
              await storeSiteContent(articleText, dataFeed.id, articleId)
            } catch (error) {
              logger.error('Failed to store site contents to s3 ', {
                error,
                url,
                dataFeed,
                articleId,
                title,
                articleText
              })
            }
            try {
              response = await generateArticleSummarization(
                articleText,
                summarizationPrompt
              )
            } catch (error) {
              logger.error('Failed to generate article summary for ' + url, {
                error
              })
              tracer.addErrorAsMetadata(error as Error)
            }
          }
        }
      } finally {
        if (response !== undefined && response !== null) {
          await saveArticleData(
            response,
            dataFeed.id,
            articleId,
            account.id,
            url,
            title,
            summarizationPrompt
          )
        }
      }
    } else {
      logger.error('Failed to generate article summary for ' + url)
      tracer.putAnnotation('summaryGenerated', false)
      metrics.addMetric('EmptyArticleFound', MetricUnits.Count, 1)
    }
  } catch (error) {
    logger.error('Error in website crawler', { error })
    tracer.addErrorAsMetadata(error as Error)
  }
}

const getSiteContent = async (url: string): Promise<cheerio.Root> => {
  logger.debug(`getSiteContent Called; url = ${url}`)
  tracer.putMetadata('url', url)
  let $: cheerio.Root
  try {
    logger.debug('URL of Provided Site = ' + url)
    const response = await axios.get(url)
    tracer.putAnnotation('url', 'Successfully Crawled')
    const text = response.data as string
    $ = cheerio.load(text)
    // Cutting out elements that aren't needed
    $('footer').remove()
    $('header').remove()
    $('script').remove()
    $('style').remove()
    $('nav').remove()
  } catch (error) {
    logger.error(`Failed to crawl; url = ${url}`)
    logger.error(JSON.stringify(error))
    tracer.addErrorAsMetadata(error as Error)
    throw error
  }
  return $
}

const storeSiteContent = async (
  text: string,
  dataFeedId: string,
  articleId: string
): Promise<void> => {
  metrics.addMetric('TextsStored', MetricUnits.Count, 1)

  const body = Buffer.from(text)
  const parallelUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: NEWS_DATA_INGEST_BUCKET,
      Key: `${dataFeedId}/${articleId}`,
      Body: body
    }
  })
  logger.debug('Starting upload')
  try {
    await parallelUpload.done()
    tracer.putAnnotation('uploadComplete', true)
    tracer.putMetadata('S3SiteContents', {
      bucket: NEWS_DATA_INGEST_BUCKET,
      key: `${dataFeedId}/${articleId}`
    })
  } catch (error) {
    tracer.addErrorAsMetadata(error as Error)
    tracer.putAnnotation('uploadComplete', false)
  }
}

const generateArticleSummarization = async (
  articleBody: string,
  summarizationPrompt?: string
): Promise<MultiSizeFormattedResponse> => {
  const summaryBuilder = new ArticleSummaryBuilder(
    articleBody,
    summarizationPrompt ?? null
  )
  const prompt = summaryBuilder.getCompiledPrompt()
  console.debug(prompt)
  const input: InvokeModelCommandInput = {
    modelId: BEDROCK_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: new TextEncoder().encode(
      JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    )
  }
  const command = new InvokeModelCommand(input)
  const response = await bedrockRuntimeClient.send(command)
  logger.debug('GenAI Output', { response })
  const responseText = new TextDecoder().decode(response.body)
  const responseObject = JSON.parse(responseText)
  const processedResponse = summaryBuilder.getProcessedResponse(
    responseObject.content
      .map((item: { type: string; text: any }) => {
        return item.type === 'text' ? item.text : ''
      })
      .join('\n')
  )
  logger.debug('Formatted response from Model:', { processedResponse })
  if (processedResponse.error.response !== null) {
    logger.error('Error in processed response from LLM', {
      processedResponse
    })
    throw new Error('Error in processed response from LLM')
  }
  return processedResponse
}

const saveArticleData = async (
  processedResponse: MultiSizeFormattedResponse,
  dataFeedId: string,
  articleId: string,
  accountId: string,
  url: string,
  title: string,
  summarizationPrompt?: string
): Promise<void> => {
  tracer.putMetadata('dataFeedId', dataFeedId, 'articleInfo')
  tracer.putMetadata('articleId', articleId, 'articleInfo')
  tracer.putMetadata('url', url, 'articleInfo')
  tracer.putMetadata('title', title, 'articleInfo')
  tracer.putMetadata('summarizationPrompt', summarizationPrompt, 'articleInfo')
  const { keywords, shortSummary, longSummary } = processedResponse
  const input: PutItemCommandInput = {
    TableName: DATA_FEED_TABLE,
    Item: marshall(
      {
        dataFeedId,
        articleId,
        sk: `article#${articleId}`,
        accountId,
        createdAt: new Date().toISOString(),
        url,
        title,
        summarizationPrompt,
        keywords: keywords.response,
        shortSummary: shortSummary.response,
        longSummary: longSummary.response
      },
      {
        removeUndefinedValues: true
      }
    )
  }
  const command = new PutItemCommand(input)
  const response = await dynamodbClient.send(command)
  logger.debug(JSON.stringify(response))
  metrics.addMetric('ArticlesSavedToDDB', MetricUnits.Count, 1)
}

const checkForRedirectFallback = ($: cheerio.Root): string | null => {
  logger.debug('Checking for redirect fallback in <noscript> tag')
  if ($('noscript').length > 0 && $('noscript').children('a').length === 1) {
    logger.debug('<noscript> exists with one anchor URL.', {
      noscript: $('noscript').html()?.toString()
    })
    tracer.putAnnotation('redirectFallback', true)
    metrics.addMetric('RedirectFallback', MetricUnits.Count, 1)
    const redirectFallback = $('noscript').children('a').first().attr('href')
    if (redirectFallback !== undefined) {
      logger.debug('Redirect fallback found', { redirectFallback })
      return redirectFallback
    } else {
      logger.debug('No redirect fallback found')
    }
  }
  return null
}

export const handler = middy()
  .handler(lambdaHander)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
