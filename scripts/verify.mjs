import assert from 'node:assert/strict';
import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { readPostMetadata } from '../src/lib/post-metadata.mjs';
const report = { posts: 0, legacySlugs: 0, travel: [], albums: [], feeds: {}, snapshotChecked: process.env.VERIFY_SNAPSHOT === '1' };
if (process.env.VERIFY_SNAPSHOT === '1') {
  const snapshot = JSON.parse(await readFile('validation/source-snapshot.json', 'utf8'));
  for (const item of snapshot.files) {
    const bytes = await readFile(item.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, `${item.path} snapshot changed`);
  }
}
const expectedPostFiles = [];
const publicPostPaths = [];
const draftPostPaths = [];
const contentRoot = 'src/content/posts';
const postSources = await readdir(contentRoot, { recursive: true, withFileTypes: true });
for (const file of postSources.filter(file => file.isFile() && !file.name.startsWith('_') && /\.md$/i.test(file.name))) {
  const filePath = resolve(file.parentPath, file.name);
  const raw = await readFile(filePath, 'utf8');
  const data = readPostMetadata(raw, filePath);
  const id = relative(contentRoot, filePath).slice(0, -3);
  const path = `/posts/${id.split('/').map(encodeURIComponent).join('/')}`;
  const exists = await stat(`dist/posts/${id}.html`).then(() => true).catch(() => false);
  if (data.draft) {
    assert.equal(exists, false, 'Draft must not publish');
    draftPostPaths.push(path);
    continue;
  }
  publicPostPaths.push(path);
  assert.ok(exists, `Missing original filename URL: ${id}`);
  expectedPostFiles.push(`${id}.html`, `${id}.md`);
  const html = await readFile(`dist/posts/${id}.html`, 'utf8');
  assert.ok(html.includes('id="article-content"'), `Missing static article: ${id}`);
  const source = await readFile(`dist/posts/${id}.md`, 'utf8');
  assert.ok(source.startsWith(raw.trimEnd()), 'Markdown export must preserve source');
  assert.ok(source.includes('## 文章声明'), 'Markdown export notice missing');
  assert.ok(html.includes(`https://blog.harumonia.moe${path}`), 'Canonical URL missing');
  const localDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(data.date);
  assert.ok(html.includes(`>${localDate}</time>`), `Blog-local date shifted: ${id}`);
  report.posts++;
  if (data.slug != null) report.legacySlugs++;
  if (data.layout === 'travel') {
    const expected = raw.split('\n').filter(line => /^-?\d{1,2}\.\d+\s*[,，]\s*-?\d{1,3}\.\d+\s*$/.test(line.trim())).length;
    const actual = [...html.matchAll(/data-travel-stop="\d+"/g)].length;
    assert.equal(actual, expected, `Coordinate parser regression: ${id}`);
    assert.ok(actual > 0);
    report.travel.push({ id, stops: actual });
  }
}
const postFiles = await readdir('dist/posts', { recursive: true, withFileTypes: true });
const exportedPostFiles = postFiles.filter(file => file.isFile() && /\.(html|md)$/.test(file.name))
  .map(file => relative('dist/posts', resolve(file.parentPath, file.name)));
assert.deepEqual(exportedPostFiles.sort(), expectedPostFiles.sort(), 'Published files differ from the committed snapshot');
const math = await readFile('dist/posts/2019-08-02-learning-sklearn-via-theory-1.html', 'utf8');
assert.ok(math.includes('class="katex"'), 'Math must be pre-rendered');
assert.ok(!math.includes('katex-error'), 'Math rendering errors found');
const albumIndex = JSON.parse(await readFile('public/albums/index.json', 'utf8'));
for (const album of albumIndex.albums) {
  const manifest = JSON.parse(await readFile(resolve('public', `.${album.manifest_path}`), 'utf8'));
  const html = await readFile(`dist/albums/${album.slug}.html`, 'utf8');
  const expected = manifest.photos.filter(photo => photo.preview_path).length;
  const actual = [...html.matchAll(/class="argus-album-grid__item"/g)].length;
  assert.equal(actual, expected, `Album must be server-rendered: ${album.slug}`);
  report.albums.push({ slug: album.slug, photos: actual });
}
for (const [file, tag] of [['atom.xml', 'entry'], ['feed.xml', 'item']]) {
  const xml = await readFile(`dist/${file}`, 'utf8');
  const count = [...xml.matchAll(new RegExp(`<${tag}>`, 'g'))].length;
  assert.equal(count, report.posts, 'Feed count mismatch');
  report.feeds[file] = count;
}
const jsonFeed = JSON.parse(await readFile('dist/feed.json', 'utf8'));
assert.deepEqual(jsonFeed.items.map(({ url }) => new URL(url).pathname).sort(), publicPostPaths.sort(), 'JSON Feed membership differs');
report.feeds['feed.json'] = jsonFeed.items.length;
const search = JSON.parse(await readFile('dist/search-index.json', 'utf8'));
assert.deepEqual(search.map(({ href }) => href).sort(), publicPostPaths, 'Search membership differs');
const listPages = await Promise.all(['index.html', 'archives.html', 'tech.html', 'notes.html', 'tags.html', 'categories.html', 'sitemap.xml', 'atom.xml', 'feed.xml'].map(file => readFile(`dist/${file}`, 'utf8')));
for (const draft of draftPostPaths) {
  assert.ok(listPages.every(page => !page.includes(draft)), `Draft link leaked: ${draft}`);
}
report.excludedDrafts = draftPostPaths.length;
assert.ok((await readFile('dist/index.html', 'utf8')).includes('field-latest-row'), 'Homepage list must render without JS');
const files = await readdir('dist', { recursive: true });
report.htmlPages = files.filter(file => file.endsWith('.html')).length;
await mkdir('.validation', { recursive: true });
await writeFile('.validation/compatibility.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
