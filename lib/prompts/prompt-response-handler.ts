import { type FormattedSummaryResponse } from '../types/prompts'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PromptResponseHandler {
  public static formatSummaryResponse = (response: string): FormattedSummaryResponse => {
    const responseText = response.replace(/(\r\n|\n|\r)/gm, '').replace(/\\n/g, '</br>')
    const matchedSummaries = responseText.match(/(?<=<generatedOutput>)(.*?)(?=<\/generatedOutput>)/g)
    const matchedErrors = responseText.match(/(?<=<error>)(.*?)(?=<\/error>)/g)
    let summary: string = ''
    let error: string = ''
    if (matchedSummaries?.length === 1) {
      summary = matchedSummaries[0]
    }
    for (const matchedError of matchedErrors ?? []) {
      error += matchedError + '\n'
    }
    if (matchedSummaries !== null && matchedSummaries.length > 1) {
      error += 'Error! There are more than one matched summaries!\n'
      for (const matchedSummary of matchedSummaries) {
        error += matchedSummary + '\n'
      }
    }
    if (summary.length < 1 && error.length < 1) {
      throw new Error('No summary found or error!')
    }
    return {
      error,
      summary
    }
  }
}
