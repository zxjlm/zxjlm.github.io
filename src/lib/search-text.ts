import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5';

const omittedTags = new Set(['script', 'style', 'template', 'noscript']);
const blockTags = new Set([
  'article', 'aside', 'blockquote', 'br', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'li', 'ol', 'p', 'pre', 'section', 'table',
  'td', 'th', 'tr', 'ul',
]);

export function htmlToSearchText(html: string) {
  const parts: string[] = [];
  function visit(node: DefaultTreeAdapterTypes.Node) {
    if ('value' in node) {
      parts.push(node.value);
      return;
    }

    if ('tagName' in node) {
      if (omittedTags.has(node.tagName) || node.attrs.some(({ name, value }) => name === 'aria-hidden' && value === 'true')) return;
      if (node.tagName === 'img') {
        parts.push(' ', node.attrs.find(({ name }) => name === 'alt')?.value ?? '', ' ');
        return;
      }
    }

    const separated = 'tagName' in node && blockTags.has(node.tagName);
    if (separated) parts.push(' ');
    if ('childNodes' in node) node.childNodes.forEach(visit);
    if (separated) parts.push(' ');
  }
  visit(parseFragment(html));
  return parts.join('').replace(/\s+/g, ' ').trim();
}
