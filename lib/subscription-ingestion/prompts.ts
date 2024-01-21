/* eslint-disable @typescript-eslint/no-extraneous-class */
export class ArticleIngestorPromptConfiguration {
  private static readonly BASE_PROMPT = '\n\nHuman: ' +
    'The following content is a news article. Read it carefully. You will need to use the information later. The article will be in <article></article> tags.\n'

  private static readonly USER_PROMPT_COMPONENT_BACKGROUND = 'The next section of the prompt is provided by user input.\n' +
    'Use the user provided prompt to influence the article summarization. The user prompt will be inside <user-prompt></user-prompt> tags.\n'

  private static readonly GENERATION_PROMPT = 'Generate a summary of the article you read.\n'

  private static readonly USER_PROMPT_INCLUDED_PROMPT = 'Use the provided user prompt as guidance for how you should summarize the information in the article'

  private static readonly PROMPT_RESTRICTIONS =
    'If you cannot access the article, response with an error message inside <error></error> tags\n' +
    'Never include a preamble or any text prior to the summary.\n' +
    'If you do not know something, do not make it up.\n' +
    'If you are unable to read the content of the article, return null\n'

  private static readonly PROMPT_RESPONSE_FORMAT_PROMPT = 'Respond to the prompt using with the summary in <summary></summary> tags:\n'

  public static buildPrompt = (articleBody: string, summarizationPrompt?: string): string => {
    return this.BASE_PROMPT +
        '<article>\n' +
        articleBody +
        '</article>\n' +
        this.USER_PROMPT_COMPONENT_BACKGROUND +
        (summarizationPrompt !== undefined
          ? '<user-prompt>\n' +
            summarizationPrompt +
            '</user-prompt>\n'
          : '') +
        this.GENERATION_PROMPT +
        (summarizationPrompt !== undefined
          ? this.USER_PROMPT_INCLUDED_PROMPT + '\n'
          : '') +
        this.PROMPT_RESTRICTIONS + '\n' +
        this.PROMPT_RESPONSE_FORMAT_PROMPT +
        '\n\nAssistant:'
  }
}
