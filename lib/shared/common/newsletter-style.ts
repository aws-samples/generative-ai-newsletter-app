/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
export class BodyStyle {
  backgroundColor: string | '#fff'
  color: string | '#000'
  fontFamily: string | 'sans-serif'
  constructor (values?: {
    backgroundColor?: string
    color?: string
    fontFamily?: string
  }) {
    if (values?.backgroundColor !== undefined) {
      this.backgroundColor = values.backgroundColor
    } else {
      this.backgroundColor = '#fff'
    }
    if (values?.color !== undefined) {
      this.color = values.color
    } else {
      this.color = '#000'
    }
    if (values?.fontFamily !== undefined) {
      this.fontFamily = values.fontFamily
    } else {
      this.fontFamily = 'sans-serif'
    }
  }
}

export class ContentStyle {
  backgroundColor: string | '#f9f9f9'
  fontSize: string | '20px'
  margin?: 'auto'
  paddingLeft?: '10px'
  paddingRight?: '10px'
  constructor (values?: { backgroundColor?: string; fontSize?: string }) {
    if (values?.backgroundColor !== undefined) {
      this.backgroundColor = values.backgroundColor
    } else {
      this.backgroundColor = '#f9f9f9'
    }
    if (values?.fontSize !== undefined) {
      this.fontSize = values.fontSize
    } else {
      this.fontSize = '20px'
    }
    this.margin = 'auto'
    this.paddingLeft = '10px'
    this.paddingRight = '10px'
  }
}
export class IntroHeaderStyle {
  fontSize: string = '30px'
  fontWeight: string = 'bold'
  align: string = 'left'
  fontFamily: string = 'sans-serif'
  color: string = '#000'
  constructor (values?: {
    fontSize?: string
    textAlign?: string
    fontWeight?: string
    fontFamily?: string
    color?: string
  }) {
    if (values?.fontSize !== undefined) {
      this.fontSize = values.fontSize
    }
    if (values?.textAlign !== undefined) {
      this.align = values.textAlign
    }
    if (values?.fontWeight !== undefined) {
      this.fontWeight = values.fontWeight
    }
    if (values?.fontFamily !== undefined) {
      this.fontFamily = values.fontFamily
    }
    if (values?.color !== undefined) {
      this.color = values.color
    }
  }
}

export class IntroBodyStyle {
  fontSize: string = '20px'
  fontFamily: string = 'sans-serif'
  color: string = '#000'
  constructor (values?: {
    fontSize?: string
    fontFamily?: string
    color?: string
  }) {
    if (values?.fontSize !== undefined) {
      this.fontSize = values.fontSize
    }
    if (values?.fontFamily !== undefined) {
      this.fontFamily = values.fontFamily
    }
    if (values?.color !== undefined) {
      this.color = values.color
    }
  }
}

export class ContentHeaderStyle {
  fontSize: string = '20px'
  fontWeight: string = 'bold'
  align: string = 'left'
  fontFamily: string = 'sans-serif'
  constructor (values?: {
    fontSize?: string
    textAlign?: string
    fontWeight?: string
    fontFamily?: string
  }) {
    if (values?.fontSize !== undefined) {
      this.fontSize = values.fontSize
    }
    if (values?.textAlign !== undefined) {
      this.align = values.textAlign
    }
    if (values?.fontWeight !== undefined) {
      this.fontWeight = values.fontWeight
    }
    if (values?.fontFamily !== undefined) {
      this.fontFamily = values.fontFamily
    }
  }
}

export class ContentBodyStyle {
  fontSize: string = '18px'
  align: string = 'left'
  color: string | undefined
  backgroundColor: string | undefined
  constructor (values?: {
    fontSize?: string
    textAlign?: string
    color?: string
    backgroundColor?: string
  }) {
    if (values?.fontSize !== undefined) {
      this.fontSize = values.fontSize
    }
    if (values?.textAlign !== undefined) {
      this.align = values.textAlign
    }
    if (values?.color !== undefined) {
      this.color = values.color
    }
    if (values?.backgroundColor !== undefined) {
      this.backgroundColor = values.backgroundColor
    }
  }
}

export class NewsletterStyle {
  public body: BodyStyle = new BodyStyle()
  public content: ContentStyle = new ContentStyle()
  public introHeader: IntroHeaderStyle = new IntroHeaderStyle()
  public introBody: IntroBodyStyle = new IntroBodyStyle()
  public contentHeader: ContentHeaderStyle = new ContentHeaderStyle()
  public contentBody: ContentBodyStyle = new ContentBodyStyle()
  constructor (values?: {
    body?: BodyStyle
    content?: ContentStyle
    introHeader?: IntroHeaderStyle
    introBody?: IntroBodyStyle
    contentHeader?: ContentHeaderStyle
    contentBody?: ContentBodyStyle
  }) {
    if (values?.body !== undefined) {
      this.body = values.body
    }
    if (values?.content !== undefined) {
      this.content = values.content
    }
    if (values?.introHeader !== undefined) {
      this.introHeader = values.introHeader
    }
    if (values?.introBody !== undefined) {
      this.introBody = values.introBody
    }
    if (values?.contentHeader !== undefined) {
      this.contentHeader = values.contentHeader
    }
    if (values?.contentBody !== undefined) {
      this.contentBody = values.contentBody
    }
  }
}
