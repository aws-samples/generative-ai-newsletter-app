export class BodyStyle {
  backgroundColor: string | '#fff'
  color: string | '#000'
  fontFamily: string | "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
  constructor (values?: { backgroundColor?: string, color?: string, fontFamily?: string }) {
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
      this.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }
  }
}
export class ContentStyle {
  backgroundColor: string | '#f9f9f9'
  fontSize: string | '20px'
  margin?: 'auto'
  paddingLeft?: '10px'
  paddingRight?: '10px'
  constructor (values?: { backgroundColor?: string, fontSize?: string }) {
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

export class NewsletterStyle {
  public body: BodyStyle
  public content: ContentStyle
  constructor (values?: { body?: BodyStyle, content?: ContentStyle }) {
    if (values?.body !== undefined) {
      this.body = values.body
    } else {
      this.body = new BodyStyle()
    }
    if (values?.content !== undefined) {
      this.content = values.content
    } else {
      this.content = new ContentStyle()
    }
  }
}
