import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { productionBuild } from '../src/lib/deployment.mjs';

const root = process.env.ASTRO_DIST || 'dist';
const production = productionBuild();
const robot = await readFile(`${root}/robots.txt`, 'utf8');
assert.equal(robot, production
  ? 'User-agent: *\nAllow: /\nSitemap: https://blog.harumonia.moe/sitemap.xml\n'
  : 'User-agent: *\nDisallow: /\n');
const names = await readdir(root, { recursive: true });
for (const name of names.filter(file => file.endsWith('.html'))) {
  const html = await readFile(`${root}/${name}`, 'utf8');
  assert.equal(html.includes('<meta name="robots" content="noindex, nofollow">'), !production || name === '404.html', name);
  for (const [type, url] of [['application/atom+xml', 'atom.xml'], ['application/rss+xml', 'feed.xml'], ['application/feed+json', 'feed.json']]) {
    assert.ok(html.includes(`<link rel="alternate" type="${type}" href="/${url}"`), `${name}: ${url}`);
  }
  assert.ok(html.includes('property="og:image"'), `${name}: Open Graph image`);
}
const headers = await readFile(`${root}/_headers`, 'utf8');
assert.match(headers, /\/_astro\/\*\n +Cache-Control: public, max-age=31536000, immutable/);
assert.equal([...headers.matchAll(/immutable/g)].length, 1, 'Only hashed assets can use immutable caching');
assert.ok(names.includes('_redirects') && !names.includes('hosting-redirects.txt'));
console.log(`Build metadata: ${production ? 'production' : 'preview'} robots, OG, feed discovery and Pages metadata verified.`);
