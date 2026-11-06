import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4860');
const inventory = JSON.parse(await readFile(new URL('../docs/migration/url-inventory.json', import.meta.url)));
const checks = new Map();
for (const { path, files, kind } of inventory.pages) {
  checks.set(path, kind === 'not-found' ? 'not-found-page' : kind);
  if (kind === 'not-found' || kind === 'home') continue;
  if (kind === 'post' || kind === 'album') checks.set(`${path}/`, kind);
  for (const file of files) {
    if (file.endsWith('/index.html')) continue;
    checks.set(`/${file}`, kind);
  }
}
for (const path of inventory.markdownExports) checks.set(path, 'markdown');
for (const path of inventory.publicFiles) checks.set(path, 'file');
for (const { browserPath } of inventory.collectionDetailLinks) checks.set(browserPath, 'collection');
checks.set('/posts/2018-10-28-sth-good-on-vps', 'missing');
checks.set('/posts/2026-07-02-luniao', 'missing');
checks.set('/posts/2026-07-02-luniao.md', 'missing');
checks.set('/posts/does-not-exist-for-migration', 'missing');
const formats = {
  '/atom.xml': 'application/atom+xml',
  '/feed.xml': 'application/rss+xml',
  '/feed.json': 'application/feed+json',
};
const counts = { checked: 0, permanentRedirects: 0 };
const failed = [];
const queue = [...checks];
await Promise.all(Array.from({ length: 12 }, async () => {
  for (let next = queue.shift(); next; next = queue.shift()) {
    const [path, kind] = next;
    try {
      const firstUrl = new URL(path, base);
      const fetchOptions = { redirect: 'manual', signal: AbortSignal.timeout(20_000) };
      let response = await fetch(firstUrl, fetchOptions);
      if ([301, 308].includes(response.status)) {
        const location = new URL(response.headers.get('location'), response.url);
        assert.equal(location.origin, firstUrl.origin, 'Redirect leaves the deployment');
        await response.body?.cancel();
        response = await fetch(location, fetchOptions);
        counts.permanentRedirects++;
      }
      if (kind === 'not-found-page') assert.ok([200, 404].includes(response.status), `HTTP ${response.status}`);
      else assert.equal(response.status, kind === 'missing' ? 404 : 200);
      const mime = response.headers.get('content-type') || '';
      if (formats[path]) assert.ok(mime.startsWith(formats[path]), `Unexpected MIME ${mime}`);
      if (kind === 'markdown') assert.ok(mime.startsWith('text/markdown'), `Unexpected MIME ${mime}`);
      if (kind === 'file' && !formats[path]) {
        await response.body?.cancel();
      } else {
        const body = await response.text();
        if (kind === 'post') assert.match(body, /id="article-content"/);
        if (kind === 'markdown') assert.match(body, /## 文章声明/);
        if (kind === 'missing' || kind === 'not-found-page') assert.match(body, /id="field-lost-title"/);
      }
      counts.checked++;
    } catch (error) {
      failed.push(`${path} — ${error.message}`);
    }
  }
}));
assert.equal(failed.length, 0, failed.sort().join('\n'));
console.log(JSON.stringify({ base: base.origin, ...counts }, null, 2));
