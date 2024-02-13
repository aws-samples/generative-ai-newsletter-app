import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { S3Client } from '@aws-sdk/client-s3'
import {
  DynamoDBClient,
  PutItemCommand,
  type PutItemCommandInput
} from '@aws-sdk/client-dynamodb'
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  type InvokeModelCommandInput
} from '@aws-sdk/client-bedrock-runtime'
import { Upload } from '@aws-sdk/lib-storage'
import { marshall } from '@aws-sdk/util-dynamodb'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { v4 as uuidv4 } from 'uuid'
import middy from '@middy/core'
import { ArticleSummaryBuilder } from '@shared/prompts/article-summary-prompt'
import { type MultiSizeFormattedResponse } from '@shared/prompts/prompt-processing'

const SERVICE_NAME = 'article-ingestor'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const s3Client = tracer.captureAWSv3Client(new S3Client())
const dynamodbClient = tracer.captureAWSv3Client(new DynamoDBClient())
const bedrock = tracer.captureAWSv3Client(new BedrockRuntimeClient())

const BEDROCK_MODEL_ID = 'anthropic.claude-v2:1'
const NEWS_DATA_INGEST_BUCKET = process.env.NEWS_DATA_INGEST_BUCKET
const NEWS_SUBSCRIPTION_TABLE = process.env.NEWS_SUBSCRIPTION_TABLE

interface ArticleIngestorInput {
  summarizationPrompt?: string
  input: {
    link: string
    subscriptionId: string
    guid?: string
    title: string
  }
}

const lambdaHander = async (event: ArticleIngestorInput): Promise<void> => {
  logger.debug('event', { event })
  tracer.putMetadata('event', event)
  await ingestArticle(event)
}

const ingestArticle = async (event: ArticleIngestorInput): Promise<void> => {
  const { subscriptionId, guid, link, title } = event.input
  const summarizationPrompt = event.summarizationPrompt
  const subsegment = tracer.getSegment()?.addNewSubsegment('### ingestArticle')
  if (subsegment !== undefined) {
    tracer.setSegment(subsegment)
  }
  try {
    if (link === undefined) {
      throw new Error('No url to crawl')
    }
    const articleId = guid?.trim() ?? uuidv4()
    const $ = await getSiteContent(link)
    let articleText: string = ''
    if ($('article').length > 0) {
      articleText = $('article').text()
    } else {
      articleText = $('body').text()
    }
    if (articleText !== undefined && articleText.length > 255) {
      try {
        await storeSiteContent(articleText, subscriptionId, articleId)
      } catch (error) {
        logger.error('Failed to load site content for ', link)
      }
      try {
        const response = await generateArticleSummarization(
          articleText,
          summarizationPrompt
        )
        if (response !== undefined && response !== null) {
          await saveArticleData(
            response,
            subscriptionId,
            articleId,
            link,
            title,
            summarizationPrompt
          )
        } else {
          throw new Error('Response is undefined')
        }
      } catch (error) {
        logger.error('Failed to generate article summary for ' + link, {
          error
        })
        tracer.addErrorAsMetadata(error as Error)
      }
    } else {
      logger.error('Failed to generate article summary for ' + link)
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
  subscriptionId: string,
  articleId: string
): Promise<void> => {
  metrics.addMetric('TextsStored', MetricUnits.Count, 1)

  const body = Buffer.from(text)
  const parallelUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: NEWS_DATA_INGEST_BUCKET,
      Key: `${subscriptionId}/${articleId}`,
      Body: body
    }
  })
  logger.debug('Starting upload')
  try {
    await parallelUpload.done()
    tracer.putAnnotation('uploadComplete', true)
    tracer.putMetadata('S3SiteContents', {
      bucket: NEWS_DATA_INGEST_BUCKET,
      key: `${subscriptionId}/${articleId}`
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
  const bedrockInput: InvokeModelCommandInput = {
    body: JSON.stringify({
      prompt,
      max_tokens_to_sample: 500,
      stop_sequences: ['\n\nHuman:']
    }),
    modelId: BEDROCK_MODEL_ID,
    accept: 'application/json',
    contentType: 'application/json'
  }
  const command = new InvokeModelCommand(bedrockInput)
  const response = await bedrock.send(command)
  const responseData = new TextDecoder().decode(response.body)
  logger.debug('GenAI Output:\n' + responseData)
  const processedResponse = summaryBuilder.getProcessedResponse(responseData)
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
  subscriptionId: string,
  articleId: string,
  url: string,
  title: string,
  summarizationPrompt?: string
): Promise<void> => {
  tracer.putMetadata('subscriptionId', subscriptionId, 'articleInfo')
  tracer.putMetadata('articleId', articleId, 'articleInfo')
  tracer.putMetadata('url', url, 'articleInfo')
  tracer.putMetadata('title', title, 'articleInfo')
  tracer.putMetadata('summarizationPrompt', summarizationPrompt, 'articleInfo')
  const { keywords, shortSummary, longSummary } = processedResponse
  const input: PutItemCommandInput = {
    TableName: NEWS_SUBSCRIPTION_TABLE,
    Item: marshall(
      {
        subscriptionId,
        articleId,
        compoundSortKey: `article#${articleId}`,
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

export const handler = middy()
  .handler(lambdaHander)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger))
