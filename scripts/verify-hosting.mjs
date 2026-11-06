import assert from 'node:assert/strict';
import { productionBuild } from '../src/lib/deployment.mjs';

const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4860/');
const production = productionBuild();
const get = async path => {
  const response = await fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(20_000) });
  assert.equal(response.status, 200, path);
  return response;
};
const home = await (await get('/')).text();
assert.match(home, /<link rel="canonical" href="https:\/\/blog\.harumonia\.moe\/">/);
assert.equal(home.includes('<meta name="robots" content="noindex, nofollow">'), !production);
const robots = await (await get('/robots.txt')).text();
assert.equal(robots.includes('Disallow: /'), !production);
assert.equal(robots.includes('Sitemap: https://blog.harumonia.moe/sitemap.xml'), production);
const asset = home.match(/(?:src|href)="(\/_astro\/[^"]+\.(?:js|css))"/)?.[1];
assert.ok(asset, 'Home must reference a hashed asset');
const cache = async path => {
  const response = await get(path);
  await response.body?.cancel();
  return response.headers.get('cache-control') || '';
};
assert.match(await cache(asset), /max-age=31536000/);
assert.match(await cache(asset), /\bimmutable\b/);
for (const path of ['/albums/index.json', '/search-index.json', '/atom.xml', '/feed.xml', '/feed.json', '/posts/2026-07-14-vps-proxy.md']) {
  const policy = await cache(path);
  assert.match(policy, /max-age=0/);
  assert.doesNotMatch(policy, /\bimmutable\b/);
}
console.log(`Cloudflare hosting: ${base.origin}, ${production ? 'production' : 'preview'} crawl policy and asset/cache headers verified.`);
