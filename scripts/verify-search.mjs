import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = new URL(process.argv[2] ?? process.env.BASE_URL ?? 'http://127.0.0.1:4860/');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === base.origin ? route.continue() : route.abort();
  });
  let requests = 0;
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/search-index.json') requests++;
  });
  const search = page.getByRole('link', { name: '搜索文章' });
  const input = page.getByRole('searchbox', { name: '文章关键词' });
  const status = page.getByRole('status');
  const results = page.getByRole('list', { name: '搜索结果' });

  await page.goto(base.href);
  assert.equal(requests, 0, 'Homepage must not request the search index');
  await search.click();
  await input.waitFor();
  assert.equal(requests, 0, 'Search must wait for a nonempty query');

  await input.fill('京都');
  await input.press('Enter');
  const first = results.getByRole('link').first();
  await first.waitFor();
  assert.match(await first.getAttribute('href'), /\/posts\/2024-06-kyoto$/);
  assert.equal(requests, 1, 'First query must load the index once');

  await input.press('ArrowDown');
  assert.equal(await first.evaluate(link => document.activeElement === link), true);
  await first.press('Escape');
  assert.equal(await input.evaluate(field => document.activeElement === field), true);

  await input.fill('雨后抵达');
  await input.press('Enter');
  await first.waitFor();
  assert.match(await first.getAttribute('href'), /\/posts\/2024-06-kyoto$/);
  assert.equal(requests, 1, 'Repeated queries reuse the fetched index');

  await input.fill('wham/apps');
  await input.press('Enter');
  await results.getByRole('link', { name: /Codex 调用 Notion 失败/ }).waitFor();
  assert.equal(new URL(page.url()).searchParams.get('q'), 'wham/apps');
  await page.reload();
  await results.getByRole('link', { name: /Codex 调用 Notion 失败/ }).waitFor();

  await input.fill('zx-absent-query-regression-32592');
  await input.press('Enter');
  await status.filter({ hasText: '没有找到相关文章。' }).waitFor();
  assert.equal(await results.getByRole('link').count(), 0);

  await input.fill('京都');
  await input.press('Enter');
  await first.waitFor();
  await input.press('ArrowDown');
  await Promise.all([
    page.waitForURL(url => url.pathname === '/posts/2024-06-kyoto'),
    first.press('Enter'),
  ]);
  await page.getByRole('heading', { level: 1, name: '2024.6 关西游记 京都', exact: true }).waitFor();

  console.log('Search: lazy load, Chinese title and body, English body, deep link, empty result, keyboard navigation');
} finally {
  await browser.close();
}
