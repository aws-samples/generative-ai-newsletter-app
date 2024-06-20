/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { Logger } from '@aws-lambda-powertools/logger'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import middy from '@middy/core'
import { type FeedArticle } from '../../shared/common'
import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelCommandInput } from '@aws-sdk/client-bedrock-runtime'


const SERVICE_NAME = 'filter-articles-with-bedrock'

const tracer = new Tracer({ serviceName: SERVICE_NAME })
const logger = new Logger({ serviceName: SERVICE_NAME })

const dynamodb = tracer.captureAWSv3Client(
    new DynamoDBClient())
const bedrockRuntimeClient = tracer.captureAWSv3Client(
    new BedrockRuntimeClient()
)

const DATA_FEED_TABLE = process.env.DATA_FEED_TABLE
const BEDROCK_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0'

interface FilterArticlesWithBedrockInput {
    dataFeedId: string
    articles: FeedArticle[]
}

const lambdaHandler = async (
    event: FilterArticlesWithBedrockInput
): Promise<FeedArticle[]> => {
    const { dataFeedId, articles } = event
    logger.debug('Filtering articles with Bedrock for Data Feed ID ',
        dataFeedId
    )
    logger.debug('Unfiltered new article count = ', { articleLength: articles.length })
    const filteredArticles = await filterArticlesWithBedrock(articles, dataFeedId)
    logger.debug('Filtered article count = ' + filteredArticles.length)
    return filteredArticles
}

const filterArticlesWithBedrock = async (
    articles: FeedArticle[], dataFeedId: string
): Promise<FeedArticle[]> => {
    const filteredArticles: FeedArticle[] = []
    const filterPrompt = await getFilterPrompt(dataFeedId)
    if (filterPrompt === null) {
        return articles
    }
    for (const article of articles) {
        logger.debug("Working on article", { article })
        const siteContent = await getSiteContent(article.url)
        if (siteContent !== null) {
            const isFiltered = await isArticleFilteredWithBedrock(siteContent, filterPrompt)
            if (!isFiltered) {
                console.debug('Article passed filter: ' + article.title)
                filteredArticles.push(article)
            } else {
                console.debug('Article filtered out: ' + article.title)
            }
        }

    }
    return filteredArticles
}

const getFilterPrompt = async (dataFeedId: string): Promise<string | null> => {
    // Get the filter prompt from dynamoDB using the dataFeedId
    logger.debug('Getting filter prompt for data feed ', dataFeedId)
    const input: GetItemCommandInput = {
        Key: {
            dataFeedId: {
                S: dataFeedId
            },
            sk: {
                S: 'dataFeed'
            }
        },
        TableName: DATA_FEED_TABLE,
        AttributesToGet: ['articleFilterPrompt']
    }
    const command = new GetItemCommand(input)
    const result = await dynamodb.send(command)
    if (result.Item !== undefined && result.Item.articleFilterPrompt?.S !== undefined) {
        logger.debug('Filter prompt found for data feed ' + result.Item.articleFilterPrompt.S, dataFeedId,)
        return result.Item.articleFilterPrompt.S
    } else {
        logger.debug('No filter prompt found for data feed ', dataFeedId)
        return null
    }
}

const isArticleFilteredWithBedrock = async (
    articleContent: string, filterPrompt: string
): Promise<boolean> => {
    if (filterPrompt === null) {
        return false
    }
    const prompt = "You are an agent responsible for reading articles and determining if the article should be filtered out based on the filter prompt." +
        "Is the article filtered out based on the filter prompt? Return either 'true' or 'false'." +
        "If the article is filtered out, return 'true', otherwise return 'false'." +
        "Here is the article content:\n" +
        "<article>" + articleContent + "</article>\n" +
        "Here is the filter prompt:\n" +
        "<filter_prompt>" + filterPrompt + "</filter_prompt>" +
        "Only return 'true' if the article is filtered out based on the filter prompt. Do not return any other content." +
        "Place the response in a <filter_response> xml tag."

    const input: InvokeModelCommandInput = {
        modelId: BEDROCK_MODEL_ID,
        contentType: 'application/json',
        accept: '*/*',
        body: new TextEncoder().encode(JSON.stringify({
            max_tokens: 1000,
            anthropic_version: 'bedrock-2023-05-31',
            messages: [
                {
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: prompt
                    }]
                }
            ]
        }))
    }
    const command = new InvokeModelCommand(input)
    const response = await bedrockRuntimeClient.send(command)
    const responseText = new TextDecoder().decode(response.body)
    console.debug('Response from Bedrock: ' + responseText)
    const responseObject = JSON.parse(responseText)
    return extractResponseValue(responseObject.content[0].text, 'filter_response')
}

const getSiteContent = async (url: string): Promise<string | null> => {
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
    let articleText: string = ''
    if ($('article').length > 0) {
        articleText = $('article').text()
    } else {
        articleText = $('body').text()
    }
    if (articleText !== undefined) {
        return articleText
    } else {
        return null
    }
}

const extractResponseValue = (response: string, xml_tag: string): boolean => {
    const formattedInput = response
        .replace(/(\r\n|\n|\r)/gm, '')
        .replace(/\\n/g, '')
    const open_tag = `<${xml_tag}>`
    const close_tag = `</${xml_tag}>`
    const regex = new RegExp(
        `(?<=${open_tag})(.*?)(?=${close_tag})`,
        'g'
    )
    const match = formattedInput.match(regex)
    const isFiltered = match?.[0].toLocaleLowerCase() === 'true'
    return isFiltered

}

export const handler = middy()
    .handler(lambdaHandler)
    .use(captureLambdaHandler(tracer, { captureResponse: false }))
    .use(injectLambdaContext(logger))