const ESCAPE_SEQUENCE = '\x1b['

interface FormattingOptions {
  bigHeader?: boolean
  bold?: boolean
  textColor?: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW' | 'WHITE' | 'BLACK'
  backgroundColor?: 'RED' | 'GREEN' | 'BLUE' | 'YELLOW' | 'WHITE' | 'BLACK'
}

export const bigHeader = (text: string): string => {
  const maxLineLength = 80
  const maxTextLength = maxLineLength - 10
  const lines = []
  const endLine = '#'.repeat(maxLineLength)
  const blankLine = '#' + ' '.repeat(maxLineLength - 2) + '#'
  const generateSpacedLine = (subtext: string, legnth: number): string => {
    return (
      '#' + ' '.repeat(((legnth - subtext.length) / 2) - ((legnth - subtext.length) % 2)) + subtext + ' '.repeat(((legnth - subtext.length) / 2) - ((legnth - subtext.length) % 2)) + '#'
    )
  }
  lines.push(endLine)
  lines.push(blankLine)
  if (text.length > maxTextLength) {
    let remainingText = text
    while (remainingText.length > 0) {
      let subtext = remainingText.substring(0, maxTextLength)
      subtext = subtext.substring(0, subtext.lastIndexOf(' '))
      lines.push(generateSpacedLine(subtext, maxLineLength))
      remainingText = remainingText.substring(subtext.length)
    }
  } else {
    lines.push(generateSpacedLine(text, maxLineLength))
  }
  lines.push(blankLine)
  lines.push(endLine)
  return lines.join('\n') + '\n'
}

/**
 * Used to format text for the CLI. Should be applied to plain strings.
 * Do not format already formatted strings
 * @param text
 * @param formatting
 */
export const formatText = (text: string, formatting: FormattingOptions): string => {
  let outputText = ''
  if (formatting.bold === true || formatting.textColor !== undefined || formatting.backgroundColor !== undefined) {
    outputText += ESCAPE_SEQUENCE
    if (formatting.bold === true) {
      outputText += '1'
      if (formatting.textColor !== undefined || formatting.backgroundColor !== undefined) {
        outputText += ';'
      }
    }
    if (formatting.textColor !== undefined) {
      switch (formatting.textColor) {
        case 'RED':
          outputText += '31'
          break
        case 'GREEN':
          outputText += '32'
          break
        case 'BLUE':
          outputText += '34'
          break
        case 'YELLOW':
          outputText += '33'
          break
        case 'WHITE':
          outputText += '37'
          break
        case 'BLACK':
          outputText += '30'
          break
      }
      if (formatting.backgroundColor !== undefined) {
        outputText += ';'
      }
    }
    if (formatting.backgroundColor !== undefined) {
      switch (formatting.backgroundColor) {
        case 'RED':
          outputText += '41'
          break
        case 'GREEN':
          outputText += '42'
          break
        case 'BLUE':
          outputText += '44'
          break
        case 'YELLOW':
          outputText += '43'
          break
        case 'WHITE':
          outputText += '47'
          break
        case 'BLACK':
          outputText += '40'
          break
      }
    }
  }
  outputText += 'm'
  outputText += text

  if (formatting.backgroundColor !== undefined || formatting.textColor !== undefined || formatting.bold === true) {
    outputText += ESCAPE_SEQUENCE + '0m'
  }
  if (formatting.bigHeader === true) {
    outputText = '\n' + bigHeader(outputText) + '\n'
  }
  return outputText
}
