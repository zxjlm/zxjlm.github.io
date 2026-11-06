import { parse } from 'yaml';

const datePattern = /^(\d{4})([-/])(\d{1,2})\2(\d{1,2})(?:[ Tt](\d{1,2}):(\d{2})(?::(\d{2})(\.\d+)?)?)?(?:\s*(Z|[+-]\d{2}:?\d{2}))?$/i;
const pad = value => value.padStart(2, '0');

export function normalizePostDate(value, fallbackOffset = '+08:00') {
  const match = typeof value === 'string' && datePattern.exec(value.trim());
  if (!match) throw new Error('expected a calendar date with an optional time and UTC offset');

  const [, year, , month, day, hour = '0', minute = '00', second = '00', fraction = '', zone = fallbackOffset] = match;
  const calendar = `${year}-${pad(month)}-${pad(day)}`;
  const midnight = new Date(`${calendar}T00:00:00Z`);
  if (Number.isNaN(midnight.getTime()) || midnight.toISOString().slice(0, 10) !== calendar
    || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) {
    throw new Error('invalid calendar date or time');
  }

  const date = new Date(`${calendar}T${pad(hour)}:${minute}:${second}${fraction.slice(0, 4)}${zone.toUpperCase()}`);
  if (Number.isNaN(date.getTime())) throw new Error('invalid UTC offset');
  return date;
}

export function readPostMetadata(source, file) {
  const header = source.match(/^\uFEFF?---[ \t]*\r?\n([\s\S]*?)^---[ \t]*\r?$/m);
  if (!header || header.index !== 0) throw new Error(`${file}: missing YAML frontmatter`);
  let data;
  try {
    data = parse(header[1], { merge: true });
  } catch (error) {
    throw new Error(`${file}: invalid YAML frontmatter: ${error.message}`, { cause: error });
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${file}: frontmatter must be a mapping`);

  const date = (key, fallbackOffset) => {
    try {
      return normalizePostDate(data[key], fallbackOffset);
    } catch (error) {
      throw new Error(`${file}: ${key}: ${error.message}`, { cause: error });
    }
  };
  return {
    ...data,
    date: date('date'),
    feedDate: date('date', 'Z'),
    updated: data.updated == null || data.updated === '' ? undefined : date('updated'),
  };
}

export function checkPostIds(entries) {
  const seen = new Map();
  for (const entry of entries) {
    const id = entry.replace(/\.md$/i, '');
    const folded = id.normalize('NFC').toLowerCase();
    if (seen.has(folded)) throw new Error(`Duplicate post ID: ${seen.get(folded)} and ${entry}`);
    seen.set(folded, entry);
  }
}
