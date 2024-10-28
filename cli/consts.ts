import ansi from 'ansi-escape-sequences';

interface FormattingOptions {
  bigHeader?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textColor?: ansi.Style;
  backgroundColor?: ansi.Style;
}

export const bigHeader = (text: string): string => {
  const maxLineLength = 80;
  const maxTextLength = maxLineLength - 10;
  const lines = [];
  const endLine = '#'.repeat(maxLineLength);
  const blankLine = '#' + ' '.repeat(maxLineLength - 2) + '#';
  const generateSpacedLine = (subtext: string, length: number): string => {
    return (
      '#' +
      ' '.repeat(
        (length - subtext.length) / 2 - ((length - subtext.length) % 2),
      ) +
      subtext +
      ' '.repeat(
        (length - subtext.length) / 2 - ((length - subtext.length) % 2),
      ) +
      '#'
    );
  };
  lines.push(endLine);
  lines.push(blankLine);
  if (text.length > maxTextLength) {
    let remainingText = text;
    while (remainingText.length > 0) {
      let subtext = remainingText.substring(0, maxTextLength);
      subtext = subtext.substring(0, subtext.lastIndexOf(' '));
      lines.push(generateSpacedLine(subtext, maxLineLength));
      remainingText = remainingText.substring(subtext.length);
    }
  } else {
    lines.push(generateSpacedLine(text, maxLineLength));
  }
  lines.push(blankLine);
  lines.push(endLine);
  return lines.join('\n') + '\n';
};

/**
 * Used to format text for the CLI. Should be applied to plain strings.
 * Do not format already formatted strings
 * @param text
 * @param formatting
 */
export const formatText = (
  text: string,
  formatting: FormattingOptions,
): string => {
  let outputText = '';
  const styles: ansi.Style[] = [];
  if (formatting.bold === true) {
    styles.push('bold');
  }
  if (formatting.textColor !== undefined) {
    styles.push(formatting.textColor);
  }
  if (formatting.backgroundColor !== undefined) {
    styles.push(formatting.backgroundColor);
  }
  if (formatting.italic === true) {
    styles.push('italic');
  }
  if (formatting.underline === true) {
    styles.push('underline');
  }
  if (styles.length > 0) {
    outputText = ansi.format(text, styles);
  }
  if (formatting.bigHeader === true) {
    outputText = '\n' + bigHeader(outputText) + '\n';
  }
  return outputText;
};
