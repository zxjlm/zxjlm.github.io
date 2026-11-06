import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { parse } from 'parse5';

const root = process.env.ASTRO_DIST || 'dist';
const origin = 'https://blog.harumonia.moe';
const files = new Set(await readdir(root, { recursive: true, withFileTypes: true }).then(
  entries => entries.filter(entry => entry.isFile()).map(entry => `${entry.parentPath}/${entry.name}`.slice(root.length + 1)),
));
const redirects = new Map((await readFile(`${root}/_redirects`, 'utf8')).trim().split('\n').map(line => {
  const [from, to] = line.split(/\s+/);
  return [decodeURIComponent(from), decodeURIComponent(to)];
}));
const siteMap = new Set([...((await readFile(`${root}/sitemap.xml`, 'utf8')).matchAll(/<loc>(.*?)<\/loc>/g))].map(match => match[1]));
const pages = new Map();
const issues = new Set();
const externalImages = new Set();

function visit(node, action) {
  if (node.tagName) action(node, Object.fromEntries(node.attrs.map(attr => [attr.name, attr.value])));
  node.childNodes?.forEach(child => visit(child, action));
}

for (const file of [...files].filter(path => path.endsWith('.html'))) {
  const path = file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;
  const url = new URL(path.split('/').map(encodeURIComponent).join('/').replace(/%2B/g, '+'), origin);
  const ids = new Set();
  const links = [];
  let canonical;
  visit(parse(await readFile(`${root}/${file}`, 'utf8')), (node, attrs) => {
    if (attrs.id) ids.add(attrs.id);
    if (node.tagName === 'a' && attrs.name) ids.add(attrs.name);
    if (attrs.rel === 'canonical') canonical = attrs.href;
    for (const key of ['href', 'src', 'poster']) {
      if (attrs[key]) links.push([node.tagName, attrs[key]]);
    }
    if (attrs.srcset && !attrs.srcset.startsWith('data:')) {
      for (const candidate of attrs.srcset.split(',')) links.push([node.tagName, candidate.trim().split(/\s+/)[0]]);
    }
  });
  if (file === '404.html') assert.equal(canonical, undefined);
  else {
    assert.equal(canonical && decodeURIComponent(new URL(canonical).pathname), path, `Canonical for ${file}`);
    assert.equal(new URL(canonical).origin, origin, `Canonical host for ${file}`);
    assert.ok(siteMap.delete(canonical), `Canonical missing from sitemap: ${canonical}`);
  }
  pages.set(file, { ids, url, links });
}
assert.deepEqual([...siteMap], [], 'Sitemap references pages without canonical output');

let checked = 0;
for (const [file, { url, links }] of pages) {
  for (const [tag, raw] of links) {
    if (!raw || /^#(?:!|$)/.test(raw)) continue;
    let destination;
    try {
      destination = new URL(raw, url);
    } catch {
      issues.add(`${file}\t${raw}\tinvalid URL`);
      continue;
    }
    if (destination.hostname !== url.hostname || !['http:', 'https:'].includes(destination.protocol)) {
      if (['img', 'source'].includes(tag) && destination.protocol === 'https:') externalImages.add(destination.href);
      continue;
    }
    let path, hash;
    try {
      path = decodeURIComponent(destination.pathname);
      hash = decodeURIComponent(destination.hash.slice(1));
    } catch {
      issues.add(`${file}\t${raw}\tinvalid path encoding`);
      continue;
    }
    path = redirects.get(path) || path;
    const candidate = path === '/' ? 'index.html' : path.replace(/^\//, '');
    const target = [candidate, `${candidate}.html`, `${candidate.replace(/\/$/, '')}/index.html`]
      .find(option => files.has(option));
    if (!target) issues.add(`${file}\t${raw}\tmissing file`);
    else if (hash && pages.has(target) && !hash.startsWith(':~:') && !pages.get(target).ids.has(hash)) {
      issues.add(`${file}\t${raw}\tmissing fragment`);
    }
    checked++;
  }
}
const known = await readFile(new URL('../docs/migration/legacy-broken-links.txt', import.meta.url), 'utf8').catch(() => '');
const knownIssues = new Set(known.split('\n').filter(line => line && !line.startsWith('#')));
const newIssues = [...issues].filter(issue => !knownIssues.has(issue)).sort();
const report = { pages: pages.size, localReferences: checked, historicalIssues: issues.size - newIssues.length,
  externalImageUrls: [...externalImages].sort(), newIssues };
await writeFile('.validation/links.json', JSON.stringify(report, null, 2) + '\n');
assert.deepEqual(newIssues, [], 'Broken internal links');
console.log(`Checked ${checked} internal references across ${pages.size} HTML files; ${issues.size} registered historical issues.`);
