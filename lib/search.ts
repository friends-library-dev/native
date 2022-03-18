type Match = {
  before: string;
  match: string;
  after: string;
  start: number;
  end: number;
};

export function search(query: string, source: string, offset = 0): Match[] {
  function prepareContext(text: string, dir: 'before' | 'after'): string {
    const BEFORE_MAX = 30;
    const AFTER_MAX = 55;
    let trimmed = ``;
    const words = text.split(/\s+/g);
    if (dir === `before`) {
      words.reverse();
      // can't use `for...of` because of transpilation/webview
      for (let i = 0; i < words.length; i++) {
        const word = words[i] || ``;
        if (trimmed.length + word.length + 1 < BEFORE_MAX) {
          trimmed = `${word} ${trimmed}`;
        } else {
          break;
        }
      }
    } else {
      for (let i = 0; i < words.length; i++) {
        const word = words[i] || ``;
        if (trimmed.length + word.length + 1 < AFTER_MAX) {
          trimmed = `${trimmed} ${word}`;
        } else {
          break;
        }
      }
    }
    return trimmed.trim().replace(/\s*\[\d+\]\s*/, ``);
  }

  function isLetter(str: string | undefined): boolean {
    return !!str && !!str.match(/^[a-z]$/);
  }

  if (query.trim() === ``) {
    return [];
  }

  if (offset >= source.length - 1) {
    return [];
  }

  const words = query.split(/\s+/g).map((s) => s.toLowerCase());
  const text = source.substring(offset).toLowerCase();

  const positions: Array<{ start: number; end: number }> = [];

  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const prevPos = positions[wordIndex - 1];
    const wordsLoopSubOffset = prevPos ? prevPos.end - offset : 0;
    const word = words[wordIndex] || ``;
    const firstCharIndex = text.substring(wordsLoopSubOffset).indexOf(word);
    const firstCharAbsoluteIndex = firstCharIndex + offset + wordsLoopSubOffset;
    if (firstCharIndex === -1) {
      return [];
    }

    // reject matching `slight` when searching for `light`
    if (
      firstCharAbsoluteIndex > 0 &&
      source[firstCharAbsoluteIndex - 1]?.match(/[a-z]/i)
    ) {
      return search(query, source, firstCharAbsoluteIndex + word.length);
    }

    if (wordIndex > 0 && prevPos) {
      const gap = source.substring(prevPos.end, firstCharAbsoluteIndex);
      if (gap.length > 3 || gap.match(/[a-z]/i)) {
        return search(query, source, prevPos.end);
      }
    }

    let endIndex = firstCharAbsoluteIndex + word.length;
    const nextChar = source[endIndex];
    if (isLetter(nextChar)) {
      return search(query, source, firstCharAbsoluteIndex + word.length);
    }

    // include trailing stuff like `'s` from `Bob's` when matching `Bob`
    const lookahead = source.substring(endIndex, endIndex + 3);
    if (lookahead.match(/^[^a-z ][a-z]\b/)) {
      endIndex += 2;
    }

    positions.push({ start: firstCharAbsoluteIndex, end: endIndex });
  }

  const firstPos = positions[0] || { start: 0, end: 0 };
  const lastPos = positions.pop() || { start: 0, end: 0 };

  const before = source.substring(0, firstPos.start).trim();
  const match = source.substring(firstPos.start, lastPos.end).trim();
  const after = source.substring(lastPos.end, source.length).trim();

  return [
    {
      before: prepareContext(before, `before`),
      match,
      after: prepareContext(after, `after`),
      start: firstPos.start,
      end: lastPos.end,
    },
    // can't use spread because of transpilation/webview
  ].concat(search(query, source, lastPos.end));
}
