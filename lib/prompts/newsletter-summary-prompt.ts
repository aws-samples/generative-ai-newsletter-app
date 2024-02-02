import { TaggedElement, type PromptElementContext, FormattedRespone as FormattedResponse } from '../prompts/prompt-processing'
import { type ArticleData } from './types'

export class NewsletterSummaryBuilder {
  private readonly newletterArticles: ArticleData[]
  private readonly newsletterIntroPrompt = new TaggedElement('newsletterIntroPrompt')
  private readonly articles = new TaggedElement('articles')
  private readonly response = new FormattedResponse()
  constructor (newletterArticles: ArticleData[], newsletterIntroPrompt: string | null) {
    if (newsletterIntroPrompt !== null) {
      this.newsletterIntroPrompt.response = newsletterIntroPrompt
    }
    this.newletterArticles = newletterArticles
    this.generatePromptFormattedArticles()
  }

  getCompiledPrompt (): string {
    return 'Human:\n\n' +
      this.getArticlesContextPrompt().before +
      this.articles.wrappedElement +
      this.getArticlesContextPrompt().after +
      this.getIntroPromptContextPrompt().before +
      (this.newsletterIntroPrompt.response !== null
        ? this.newsletterIntroPrompt.wrappedElement
        : '') +
      this.getIntroPromptContextPrompt().after +
      '\n\nAssistant:'
  }

  getProcessedResponse (response: string): FormattedResponse {
    this.response.processResponse(response)
    return this.response
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

      formattedArticles += articleTag.openTag +
        articleTitle.response != null
        ? articleTitle.wrappedElement
        : '' +
        articleSummary.wrappedElement +
        articleTag.closeTag
    }

    this.articles.response = formattedArticles
  }

  private getArticlesContextPrompt (): PromptElementContext {
    const articlesTag = new TaggedElement('articles')
    return {
      before: `Read the following text inside the ${articlesTag.openTag} tags. You will use the information later\n\n, tag. You will use the information later\n\n`,
      after: ''
    }
  }

  private getIntroPromptContextPrompt (): PromptElementContext {
    if (this.newsletterIntroPrompt === null) {
      return {
        before: '\n',
        after: 'Using the summarized articles you read in the <article> tags, generate 1 to 2 Newsletter introduction paragraphs.\n' +
        'The summary should be high-level.\n' +
        'The summary should be written in simple markdown format\n' +
        'The newsletter summary content should be output inside of the tag <generatedOutput>\n' +
        'If you are unable to create a summary or have any other issues causing you to fail to complete the generation of the summary \n' +
        'output the errors/problems inside of the tag <error>.\n'
      }
    }
    return {
      before: 'Read the following text inside the <newsletterIntroPrompt> tags. You will use the prompt later\n\n',
      after: 'Using the summarized articles you read in the <article> tags, generate 1 to 2 Newsletter introduction paragraphs.\n' +
            'The summary should be high-level.\n' +
            'The summary should be written in simple markdown format\n' +
            'Use the text provided in the <newsletterIntroPrompt> tag as guidance to help direct how you create the newsletter introduction.\n' +
            'The newsletter summary content should be output inside of the tag <generatedOutput>\n' +
            'If you are unable to create a summary or have any other issues causing you to fail to complete the generation of the summary \n' +
            'output the errors/problems inside of the tag <error>.\n'

    }
  }
}
