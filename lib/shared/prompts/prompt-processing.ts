/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
export interface PromptElementContext {
  before: string
  after?: string
}

export class TaggedElement {
  private readonly _element: string
  private _response: string | null
  constructor (element: string) {
    this._element = element
  }

  public get element (): string {
    return this._element
  }

  public get openTag (): string {
    return `<${this._element}>`
  }

  public get closeTag (): string {
    return `</${this._element}>`
  }

  public set response (response: string) {
    this._response = response
  }

  public get response (): string | null {
    return this._response
  }

  public get wrappedElement (): string {
    if (this._response !== null) {
      return this.openTag + this._response + this.closeTag
    } else {
      throw new Error(
        "Error getting wrapped element. The response value hasn't been set yet"
      )
    }
  }

  public extractResponseValue (response: string): string | null {
    const formattedInput = response
      .replace(/(\r\n|\n|\r)/gm, '')
      .replace(/\\n/g, '')
    const regex = new RegExp(
      `(?<=${this.openTag})(.*?)(?=${this.closeTag})`,
      'g'
    )
    const match = formattedInput.match(regex)
    this._response = match !== null ? match[0] : null
    return this._response
  }
}

export class FormattedResponse {
  summary: TaggedElement
  error: TaggedElement
  constructor (values?: { summary?: string, error?: string }) {
    this.summary = new TaggedElement('summary')
    this.error = new TaggedElement('error')
    if (values !== undefined) {
      if (values.summary !== undefined) {
        this.summary.response = values.summary
      }
      if (values.error !== undefined) {
        this.error.response = values.error
      }
    }
  }

  public processResponse (response: string): void {
    this.summary.extractResponseValue(response)
    this.error.extractResponseValue(response)
  }
}
export class MultiSizeFormattedResponse {
  keywords: TaggedElement
  shortSummary: TaggedElement
  longSummary: TaggedElement
  error: TaggedElement
  constructor (values?: {
    keywords?: string
    shortSummary?: string
    longSummary?: string
  }) {
    this.keywords = new TaggedElement('keywords')
    this.shortSummary = new TaggedElement('shortSummary')
    this.longSummary = new TaggedElement('longSummary')
    this.error = new TaggedElement('error')
    if (values !== undefined) {
      if (values.keywords !== undefined) {
        this.keywords.response = values.keywords
      }
      if (values.shortSummary !== undefined) {
        this.shortSummary.response = values.shortSummary
      }
      if (values.longSummary !== undefined) {
        this.longSummary.response = values.longSummary
      }
    }
  }

  public processResponse (response: string): this {
    this.keywords.extractResponseValue(response)
    this.shortSummary.extractResponseValue(response)
    this.longSummary.extractResponseValue(response)
    this.error.extractResponseValue(response)
    return this
  }
}
