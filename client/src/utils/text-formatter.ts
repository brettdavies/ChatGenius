interface FormattedSegment {
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  isStrikethrough?: boolean;
  isCode?: boolean;
  isLink?: boolean;
  href?: string;
}

export function formatText(text: string): FormattedSegment[] {
  const segments: FormattedSegment[] = [];
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    // Handle code blocks
    if (text.startsWith('```', i)) {
      if (currentText) {
        segments.push({ text: currentText });
        currentText = '';
      }
      const end = text.indexOf('```', i + 3);
      if (end !== -1) {
        segments.push({
          text: text.slice(i + 3, end),
          isCode: true,
        });
        i = end + 3;
        continue;
      }
    }

    // Handle inline code
    if (text[i] === '`' && !text.startsWith('```', i)) {
      if (currentText) {
        segments.push({ text: currentText });
        currentText = '';
      }
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        segments.push({
          text: text.slice(i + 1, end),
          isCode: true,
        });
        i = end + 1;
        continue;
      }
    }

    // Handle bold
    if (text.startsWith('**', i) || (text[i] === '*' && !text.startsWith('*_', i))) {
      if (currentText) {
        segments.push({ text: currentText });
        currentText = '';
      }
      const isSingle = text[i + 1] !== '*';
      const searchChar = isSingle ? '*' : '**';
      const end = text.indexOf(searchChar, i + searchChar.length);
      if (end !== -1) {
        segments.push({
          text: text.slice(i + searchChar.length, end),
          isBold: true,
        });
        i = end + searchChar.length;
        continue;
      }
    }

    // Handle italic
    if (text.startsWith('_', i) || text.startsWith('*_', i)) {
      if (currentText) {
        segments.push({ text: currentText });
        currentText = '';
      }
      const hasPrefix = text.startsWith('*_', i);
      const searchChar = hasPrefix ? '_' : '_';
      const start = i + (hasPrefix ? 2 : 1);
      const end = text.indexOf(searchChar, start);
      if (end !== -1) {
        segments.push({
          text: text.slice(start, end),
          isItalic: true,
        });
        i = end + 1;
        continue;
      }
    }

    // Handle strikethrough
    if (text[i] === '~') {
      if (currentText) {
        segments.push({ text: currentText });
        currentText = '';
      }
      const end = text.indexOf('~', i + 1);
      if (end !== -1) {
        segments.push({
          text: text.slice(i + 1, end),
          isStrikethrough: true,
        });
        i = end + 1;
        continue;
      }
    }

    // Handle links
    if (text[i] === '<' && text.indexOf('>', i) !== -1) {
      const end = text.indexOf('>', i);
      const url = text.slice(i + 1, end);
      if (isValidUrl(url)) {
        if (currentText) {
          segments.push({ text: currentText });
          currentText = '';
        }
        segments.push({
          text: url,
          isLink: true,
          href: url,
        });
        i = end + 1;
        continue;
      }
    }

    currentText += text[i];
    i++;
  }

  if (currentText) {
    segments.push({ text: currentText });
  }

  return segments;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 