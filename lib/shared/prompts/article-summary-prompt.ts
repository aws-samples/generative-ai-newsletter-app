import {
  TaggedElement,
  type PromptElementContext,
  MultiSizeFormattedResponse
} from './prompt-processing'

export class ArticleSummaryBuilder {
  private readonly articleSummarizationPrompt: string | null
  private readonly articleContent: string
  private readonly articleTag = new TaggedElement('article')
  private readonly articleSummarizationPromptTag = new TaggedElement(
    'articleSummarizationPrompt'
  )

  private readonly response = new MultiSizeFormattedResponse()

  constructor (
    articleContent: string,
    articleSummarizationPrompt: string | null
  ) {
    this.articleSummarizationPrompt = articleSummarizationPrompt
    this.articleContent = articleContent
  }

  public getCompiledPrompt (): string {
    return (
      // 'Human:\n\n' +
      this.getBaseContextPrompt().before +
      (this.articleSummarizationPrompt !== null
        ? this.getArticleSummarizationPrompt().before +
          this.getPromptFormattedArticleSummarization() +
          this.getArticleSummarizationPrompt().after
        : '') +
      this.getPromptFormattedArticle() +
      this.getInstructions() +
      this.getErrorHandling() +
      this.getFinalInstructionsPrompt() // +
      // '\n\nAssistant:'
    )
  }

  public getProcessedResponse (response: string): MultiSizeFormattedResponse {
    this.response.processResponse(response)
    return this.response
  }

  private getBaseContextPrompt (): PromptElementContext {
    return {
      before:
        'You are in charge of summarizing content from articles.' +
        'Read the article and follow the guidance and instructions for creating a summarization.'
    }
  }

  private getPromptFormattedArticle (): string {
    return (
      this.articleTag.openTag + this.articleContent + this.articleTag.closeTag
    )
  }

  private getPromptFormattedArticleSummarization (): string {
    return (
      this.articleSummarizationPromptTag.openTag +
      this.articleSummarizationPrompt +
      this.articleSummarizationPromptTag.closeTag +
      '\n'
    )
  }

  private getArticleSummarizationPrompt (): PromptElementContext {
    return {
      before: 'TONE:\n'
    }
  }

  private getInstructions (): string {
    return (
      'INSTRUCTIONS:\n' +
      '1. Create up to 3 unique keywords that describe the article. (keywords)\n' +
      '2. Create a single sentence that clearly summarizes the article contents. (shortSummary)\n' +
      '3. Create a 1 - 2 paragraph summary that clearly summaries the article. (longSummary)\n' +
      '---\nThink about your answer. It should match tone and instructions stated above.\n---\n'
    )
  }

  private getErrorHandling (): string {
    return (
      'ERROR HANDLING\n' +
      'If for some reason you are unable to complete the steps as instructed, output your reason for failure\n' +
      'inside of the <error> tag. If you do not encounter any failure and are able to respond fully do not output any errors.\n' +
      'If you lack enough context to create a summary or you are unable to read the contents of the article, \n' +
      'this is considered a failure and you should output the error inside of the error tag.\n' +
      'Do not output errors or problems in any other tag besides the <error> tag.\n' +
      'Error messages in side of the <error> tag should be clear, descriptive error messages.\n---\n'
    )
  }

  private getFinalInstructionsPrompt (): string {
    return (
      'The only valid XML tags you can respond with are:\n' +
      '<keywords>, <shortSummary>, <longSummary>, <error>\n'
    )
  }
}
