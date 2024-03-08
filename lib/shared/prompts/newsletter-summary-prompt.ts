import {
  TaggedElement,
  MultiSizeFormattedResponse
} from './prompt-processing'
import { PromptHandler } from './prompt-handler'
import { type ArticleData } from './types'

export class NewsletterSummaryBuilder extends PromptHandler {
  private readonly newletterArticles: ArticleData[]
  private readonly newsletterIntroPrompt = new TaggedElement('tone')
  private readonly articles = new TaggedElement('articles')
  constructor (
    newletterArticles: ArticleData[],
    newsletterIntroPrompt?: string
  ) {
    super({})
    this.taskContext =
      'You are an AI responsible for reading article summaries\n' +
      'and generating a newsletter summary.\n' +
      'Read the summaries and follow the guidance and instructions for creating a summarization'
    if (newsletterIntroPrompt !== undefined) {
      this.newsletterIntroPrompt.response = newsletterIntroPrompt
      this.toneContext =
        'Here is the tone of the article\n' +
        this.newsletterIntroPrompt.wrappedElement +
        '\n'
    }
    this.newletterArticles = newletterArticles
    this.generatePromptFormattedArticles()
    this.data =
      'Here are the articles you should use for reference:\n' +
      this.articles.wrappedElement +
      '\n'
    this.taskDescription =
      'Here are some important rules to follow:\n' +
      (newsletterIntroPrompt !== null
        ? '-Always match the tone you are instructed to use\n'
        : '') +
      '-If you are unable to summarize content, do not make things up\n' +
      "-The summary should aim to give a broad overview of the included articles, but doesn't" +
      'to summarize all articles, especially if there are a lot\n'
    this.instructions =
      '1. Create up to 3 unique keywords that describe the newsletter (keywords)\n' +
      '2. Create a single sentence that clearly summarizes the newsletter (shortSummary)\n' +
      '3. Create a 1-2 paragraph summary the clearly summarizes the newsletter (longSummary)\n' +
      'If you are unable to complete your task exactly as you were instructed, it is considered an error (error)\n' +
      '---\nThink about your response before proceeding to answer.\n'
    this.outputFormat =
      'The only valid XML tags you can respond with are:\n' +
      '<keywords>, <shortSummary>, <longSummary>, <error>\n' +
      'If you cannot complete the task, your output should be inside the <error> tag'
  }

  getCompiledPrompt (): string {
    return (
      this.promptStart +
      this.taskContext +
      this.toneContext +
      this.data +
      this.taskDescription +
      this.instructions +
      this.outputFormat +
      this.promptEnd
    )
  }

  getProcessedResponse (response?: string): MultiSizeFormattedResponse {
    if (response !== undefined) {
      this.response = response
    }
    if (this.response !== undefined) {
      const response = new MultiSizeFormattedResponse()
      return response.processResponse(this.response)
    } else {
      throw Error('No response set!')
    }
  }

  private generatePromptFormattedArticles (): void {
    let formattedArticles = ''
    for (const article of this.newletterArticles) {
      const articleTag = new TaggedElement('article')
      const articleSummary = new TaggedElement('articleSummary')
      const articleTitle = new TaggedElement('articleTitle')
      if (article.content.shortSummary.response !== null) {
        articleSummary.response = article.content.shortSummary.response
      } else if (article.content.longSummary.response !== null) {
        articleSummary.response = article.content.longSummary.response
      } else {
        continue
      }
      if (article.title !== null) {
        articleTitle.response = article.title
      }

      formattedArticles +=
        articleTag.openTag + articleTitle.response != null
          ? articleTitle.wrappedElement
          : '' + articleSummary.wrappedElement + articleTag.closeTag
    }

    this.articles.response = formattedArticles
  }
}
