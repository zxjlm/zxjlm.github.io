import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: true });
const aliases = { plain_text: 'text', pyhton: 'python', python3: 'python', conf: 'ini', 'c++': 'cpp' };
const legacyFragments = {
  '2020-12-07-sql-frm-myi-myd-files.md': { '_8-x': '8.x' },
  '2021-03-30-why-mongo-use-object-id.md': { sql: 'SQL', 'uuid-和自增-id-存储空间对比': 'UUID和自增ID存储空间对比' },
  '2021-06-06-fastnlp-and-spacy.md': { 'config-cfg': 'config.cfg' },
};
const explicitId = /\s*\{#([^\s{}]+)\}\s*$/;

// Zaxon uses the mdit slug rules, including the underscore for leading digits.
function slugify(value) {
  return value.normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
}

export function remarkLegacyMarkdown() {
  return (tree, file) => {
    const tokens = markdown.parse(String(file.value), {});
    const headings = new Map();
    const used = new Set();
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type !== 'heading_open') continue;
      const inline = tokens[i + 1];
      const manual = explicitId.exec(inline.content)?.[1];
      const title = inline.children.filter(child => child.type !== 'html_inline' && child.type !== 'emoji')
        .map(child => child.content).join('').replace(explicitId, '');
      const base = manual ?? slugify(title);
      let id = base;
      for (let suffix = 1; used.has(id); suffix++) id = `${base}-${suffix}`;
      used.add(id);
      headings.set(token.map[0] + 1, { id, manual });
    }
    function visit(node) {
      if (node.type === 'heading') {
        const heading = headings.get(node.position?.start.line);
        if (heading) {
          node.data ??= {};
          node.data.hProperties = { ...node.data.hProperties, id: heading.id };
          const last = node.children.at(-1);
          if (heading.manual && last?.type === 'text') last.value = last.value.replace(explicitId, '');
        }
      }
      if (node.type === 'code' && node.lang) {
        const language = node.lang.toLowerCase();
        if (language === 'math') {
          node.type = 'math';
          node.data = {
            hName: 'pre',
            hChildren: [{ type: 'element', tagName: 'code', properties: { className: ['language-math', 'math-display'] }, children: [{ type: 'text', value: node.value }] }],
          };
        } else if (language === 'mermaid') {
          node.type = 'mermaid';
          node.data = {
            hName: 'pre',
            hProperties: { 'data-mermaid': '' },
            hChildren: [{ type: 'text', value: node.value }],
          };
        } else {
          node.lang = aliases[language] ?? language;
        }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
    const fragments = legacyFragments[file.path?.split('/').at(-1)];
    if (fragments) {
      tree.children = tree.children.flatMap(node => {
        const alias = fragments[node.data?.hProperties?.id];
        return alias ? [{ type: 'html', value: `<span id="${alias}"></span>` }, node] : [node];
      });
    }
  };
}
