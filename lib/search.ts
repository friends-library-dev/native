type Match = {
  before: string;
  match: string;
  after: string;
  start: number;
  end: number;
};

export function search(query: string, source: string, offset = 0): Match[] {
  function trim(text: string, dir: 'before' | 'after'): string {
    const BEFORE_MAX = 30;
    const AFTER_MAX = 60;
    let trimmed = ``;
    const words = text.split(/\s+/g);
    if (dir === `before`) {
      words.reverse();
      // can't use `for...of` because of transpilation/webview
      for (let i = 0; i < words.length; i++) {
        const word = words[i] || ``;
        if (trimmed.length + word.length + 1 < BEFORE_MAX) {
          trimmed = `${word} ${trimmed}`;
        }
      }
    } else {
      for (let i = 0; i < words.length; i++) {
        const word = words[i] || ``;
        if (trimmed.length + word.length + 1 < AFTER_MAX) {
          trimmed = `${trimmed} ${word}`;
        }
      }
    }
    return trimmed.trim();
  }

  function isLetter(str: string | undefined): boolean {
    return !!str && !!str.match(/^[a-z]$/);
  }

  if (query.trim() === `` || false) {
    return [];
  }

  const words = query.split(/\s+/g).map((s) => s.toLowerCase());
  const text = source.substring(offset).toLowerCase();

  const positions: Array<{ start: number; end: number }> = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i] || ``;
    const index = text.indexOf(word);
    if (index === -1) {
      return [];
    }

    if (i > 0) {
      const prevPos = positions[i - 1] || { start: 0, end: 0 };
      const gap = source.substring(prevPos.end, index);
      if (gap.length > 3 || gap.match(/[a-z]/i)) {
        return [];
      }
    }

    let endIndex = offset + index + word.length;
    let nextChar = source[endIndex];
    if (isLetter(nextChar)) {
      return [];
    }

    // include trailing stuff like `'s` from `Bob's` when matching `Bob`
    while (nextChar && nextChar !== ` `) {
      endIndex += 1;
      nextChar = source[endIndex];
    }

    positions.push({ start: offset + index, end: endIndex });
  }

  const firstPos = positions[0] || { start: 0, end: 0 };
  const lastPos = positions.pop() || { start: 0, end: 0 };

  const before = source.substring(0, firstPos.start).trim();
  const match = source.substring(firstPos.start, lastPos.end).trim();
  const after = source.substring(lastPos.end, source.length).trim();

  return [
    {
      before: trim(before, `before`),
      match,
      after: trim(after, `after`),
      start: firstPos.start,
      end: lastPos.end,
    },
    // can't use spread because of transpilation/webview
  ].concat(search(query, source, lastPos.end));
}
