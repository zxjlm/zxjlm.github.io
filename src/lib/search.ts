export interface SearchEntry {
  title: string;
  href: string;
  date: string;
  keywords: string;
  text: string;
}

export const normalize = (text: string) => text.normalize('NFKC').toLowerCase().trim();

export function prepareSearch(entries: SearchEntry[]) {
  return entries.map(entry => ({
    entry,
    title: normalize(entry.title),
    keywords: normalize(entry.keywords),
    text: normalize(entry.text),
  }));
}

export function findArticles(index: ReturnType<typeof prepareSearch>, query: string) {
  const phrase = normalize(query).replace(/\s+/g, ' ');
  if (!phrase) return [];
  const words = [...new Set(phrase.split(' '))];
  return index.flatMap(({ entry, title, keywords, text }) => {
    let score = title === phrase ? 24 : title.includes(phrase) ? 12 : 0;
    for (const word of words) {
      if (title.includes(word)) score += 8;
      else if (keywords.includes(word)) score += 4;
      else if (text.includes(word)) score += 1;
      else return [];
    }

    const firstMatch = text.indexOf(phrase);
    const offset = firstMatch >= 0 ? firstMatch : text.indexOf(words[0]);
    const start = Math.max(0, offset - 28);
    const length = 126;
    const summary = entry.text.slice(start, start + length);
    const snippet = `${start ? '…' : ''}${summary}${start + length < entry.text.length ? '…' : ''}`;
    return [{ entry, score, snippet }];
  }).sort((a, b) => b.score - a.score);
}
