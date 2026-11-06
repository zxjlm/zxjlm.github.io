import { writeFile } from 'node:fs/promises';

const [slug, title = slug] = process.argv.slice(2);
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !title?.trim()) {
  console.error('Usage: pnpm new <lowercase-slug> [title]');
  process.exit(1);
}
const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
const name = /^\d{4}-\d{2}-\d{2}-/.test(slug) ? slug : `${date}-${slug}`;
const target = new URL(`../src/content/posts/${name}.md`, import.meta.url);
const body = `---\ntitle: ${JSON.stringify(title)}\ndate: ${date}\ndraft: true\ncategories: []\ntags: []\n---\n\n`;
await writeFile(target, body, { flag: 'wx' });
console.log(`src/content/posts/${name}.md`);
