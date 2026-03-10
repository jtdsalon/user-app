/**
 * Reusable utility for parsing @username patterns in text.
 * Avoids false positives inside email addresses (e.g. user@domain.com).
 * @ must be at start of string or preceded by whitespace.
 * Username: word characters only (letters, numbers, underscore).
 */
const MENTION_REGEX = /(?:^|\s)(@(\w+))/g;

export interface ParsedMention {
  fullMatch: string;  // e.g. " @john"
  username: string;   // e.g. "john"
  index: number;
}

/**
 * Parse text for @username mentions. Does not match @ inside emails.
 */
export function parseMentions(text: string): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(MENTION_REGEX.source, 'g');
  while ((match = re.exec(text)) !== null) {
    mentions.push({
      fullMatch: match[1],
      username: match[2],
      index: match.index,
    });
  }
  return mentions;
}

/**
 * Split content into parts (text | mention | text | mention...) for rendering.
 * Each part is either plain text or { type: 'mention', username: string }
 */
export type TextPart = string | { type: 'mention'; username: string };

export function splitContentWithMentions(content: string): TextPart[] {
  const parts: TextPart[] = [];
  const re = new RegExp(MENTION_REGEX.source, 'g');
  let lastEnd = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const idx = match.index;
    const fullMatchLen = match[0].length;
    const username = match[2];
    const hasLeadingSpace = match[0].startsWith(' ');
    if (idx > lastEnd) {
      parts.push(content.slice(lastEnd, idx + (hasLeadingSpace ? 1 : 0)));
    }
    parts.push({ type: 'mention', username });
    lastEnd = idx + fullMatchLen;
  }
  if (lastEnd < content.length) {
    parts.push(content.slice(lastEnd));
  }
  return parts.length ? parts : [content];
}
