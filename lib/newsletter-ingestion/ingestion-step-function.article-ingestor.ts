import { Tracer, captureLambdaHandler } from '@aws-lambda-powertools/tracer'
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import { MetricUnits, Metrics } from '@aws-lambda-powertools/metrics'
import { S3Client } from '@aws-sdk/client-s3'
import {
  DynamoDBClient, PutItemCommand, type PutItemCommandInput
} from '@aws-sdk/client-dynamodb'
import { BedrockRuntimeClient, InvokeModelCommand, type InvokeModelCommandInput } from '@aws-sdk/client-bedrock-runtime'
import { Upload } from '@aws-sdk/lib-storage'
import { marshall } from '@aws-sdk/util-dynamodb'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { v4 as uuidv4 } from 'uuid'
import middy from '@middy/core'

const SERVICE_NAME = 'article-ingestor'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })
const metrics = new Metrics({ serviceName: SERVICE_NAME })

const s3Client = tracer.captureAWSv3Client(new S3Client())
const dynamodbClient = tracer.captureAWSv3Client(new DynamoDBClient())
const bedrock = tracer.captureAWSv3Client(new BedrockRuntimeClient())

const BEDROCK_MODEL_ID = 'anthropic.claude-v2:1'
const INGEST_BUCKET = process.env.INGEST_BUCKET
const NEWSLETTER_TABLE = process.env.NEWSLETTER_TABLE

interface WebsiteCrawlerInput {
  link: string
  subscriptionId: string
  guid?: string
}

const lambdaHander = async (event: WebsiteCrawlerInput): Promise<void> => {
  await ingestArticle(event)
}

const ingestArticle = async (input: WebsiteCrawlerInput): Promise<void> => {
  const subsegment = tracer.getSegment()?.addNewSubsegment('### ingestArticle')
  if (subsegment !== undefined) { tracer.setSegment(subsegment) }
  try {
    if (input.link === undefined) {
      throw new Error('No url to crawl')
    }
    const articleId = input.guid ?? uuidv4()
    const $ = await getSiteContent(input.link)
    let articleText: string = ''
    if ($('article').length > 0) {
      articleText = $('article').text()
    } else {
      articleText = $('body').text()
    }
    try {
      await storeSiteContent(articleText, input.subscriptionId, articleId)
    } catch (error) {
      logger.error('Failed to load site content for ', input.link)
    }
    try {
      const summary = await generateArticleSummary(articleText)
      if (summary !== undefined) {
        await saveArticleData(summary, input.subscriptionId, articleId, input.link)
      }
    } catch (error) {
      logger.error('Failed to generate article summary for ' + input.link, { error })
      tracer.addErrorAsMetadata(error as Error)
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

const storeSiteContent = async (text: string, subscriptionId: string, articleId: string): Promise<void> => {
  metrics.addMetric('TextsStored', MetricUnits.Count, 1)

  const body = Buffer.from(text)
  const parallelUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: INGEST_BUCKET,
      Key: `${subscriptionId}/${articleId}`,
      Body: body
    }
  })
  logger.debug('Starting upload')
  try {
    await parallelUpload.done()
    tracer.putAnnotation('uploadComplete', true)
    tracer.putMetadata('S3SiteContents', {
      bucket: INGEST_BUCKET,
      key: `${subscriptionId}/${articleId}`
    })
  } catch (error) {
    tracer.addErrorAsMetadata(error as Error)
    tracer.putAnnotation('uploadComplete', false)
  }
}

const generateArticleSummary = async (articleBody: string): Promise<string> => {
  const prompt = '\n\nHuman: ' +
    'The following content is a news article. Generate a summary with a maximum of 5 sentences in length.\n' +
    'Never include a preamble or any text prior to the summary. Only state the summary and nothing else.\n' +
    'Output the summary inside of <summary></summary> tags\n' +
    'If you do not know something, do not make it up.\n' +
    '<BEGIN ARTICLE>\n' +
    articleBody +
    '<END ARTICLE>\n' +
    '\n\nAssistant:'
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
  let summary = responseData.replace(/\\n-/g, '')
  summary = summary.replace(/\\n/g, '')
  const matchedSummary = summary.match(/(?<=<summary>)(.*?)(?=<\/summary>)/g)
  if (matchedSummary === null) {
    throw new Error('No summary found')
  } else {
    return matchedSummary[0]
  }
}

const saveArticleData = async (articleSummary: string, subscriptionId: string, articleId: string, url: string): Promise<void> => {
  tracer.putMetadata('subscriptionId', subscriptionId, 'articleInfo')
  tracer.putMetadata('articleId', articleId, 'articleInfo')
  tracer.putMetadata('url', url, 'articleInfo')
  const input: PutItemCommandInput = {
    TableName: NEWSLETTER_TABLE,
    Item: marshall({
      subscriptionId,
      articleId,
      compoundSortKey: `${subscriptionId}#${articleId}`,
      articleSummary,
      createdAt: new Date().toISOString(),
      url,
      type: 'article'
    })
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
