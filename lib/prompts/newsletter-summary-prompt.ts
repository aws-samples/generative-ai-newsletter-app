import { type ArticleData } from '../types/newsletter-generator'
import { type PromptElementContext } from '../types/prompts'

export class NewsletterSummaryPrompt {
  private readonly newsletterIntroPrompt: string | null
  private readonly newletterArticles: ArticleData[]
  constructor (newsletterIntroPrompt: string | null, newletterArticles: ArticleData[]) {
    this.newsletterIntroPrompt = newsletterIntroPrompt
    this.newletterArticles = newletterArticles
  }

  getCompiledSummaryPrompt (): string {
    return 'Human:\n\n' +
      this.getArticlesContextPrompt().before +
      this.getPromptFormattedArticles() +
      this.getArticlesContextPrompt().after +
      this.getIntroPromptContextPrompt().before +
      (this.newsletterIntroPrompt !== null ? '<newsletterIntroPrompt>' + this.newsletterIntroPrompt + '</newsletterIntroPrompt>' : '') +
      this.getIntroPromptContextPrompt().after +
      '\n\nAssistant:'
  }

  private getPromptFormattedArticles (): string {
    let formattedArticles = ''
    for (const article of this.newletterArticles) {
      formattedArticles += '<article>' +
            `<articleTitle>${article.title}</articleTitle>` +
            `<articleSummary>${article.content}</articleSummary>` +
            '</article>'
    }
    return formattedArticles
  }

  private getArticlesContextPrompt (): PromptElementContext {
    return {
      before: 'Read the following text inside the <articles> tag. You will use the information later\n\n',
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
