import { type FormattedRespone, type MultiSizeFormattedResponse } from './prompt-processing'

export abstract class PromptHandler {
  protected readonly promptStart: string
  protected taskContext: string
  protected toneContext: string
  protected data: string
  protected examples?: string
  protected taskDescription?: string
  protected history?: string
  protected instructions: string
  protected outputFormat: string
  protected readonly promptEnd: string
  protected response: string

  constructor (input: { promptStart?: string, taskContext?: string, toneContext?: string, data?: string, examples?: string, taskDescription?: string, history?: string, instructions?: string, outputFormat?: string, promptEnd?: string }) {
    if (input.promptStart !== undefined) { this.promptStart = input.promptStart }
    if (input.taskContext !== undefined) { this.taskContext = input.taskContext }
    if (input.toneContext !== undefined) { this.toneContext = input.toneContext }
    if (input.data !== undefined) { this.data = input.data }
    if (input.taskDescription !== undefined) { this.taskDescription = input.taskDescription }
    if (input.examples !== undefined) { this.examples = input.examples }
    if (input.history !== undefined) { this.history = input.history }
    if (input.instructions !== undefined) { this.instructions = input.instructions }
    if (input.outputFormat !== undefined) { this.outputFormat = input.outputFormat }
    if (input.promptEnd !== undefined) { this.promptEnd = input.promptEnd }
  }

  abstract getCompiledPrompt (): string
  abstract getProcessedResponse (): MultiSizeFormattedResponse | FormattedRespone
}
