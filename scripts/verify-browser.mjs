import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:4860/');
const browser = await chromium.launch({ args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const at = path => new URL(path, base).href;
const isolated = process.env.REAL_EXTERNAL !== '1';
if (isolated) {
  const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XhXcAAAAASUVORK5CYII=', 'base64');
  await context.route('**/*', route => {
    if (route.request().url().startsWith(base.origin + '/')) return route.continue();
    if (route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: pixel });
    return route.abort();
  });
}
const page = await context.newPage();
const ordinaryMapRequests = [];
const hydrationErrors = [];
page.on('console', message => {
  if (/hydration .*mismatch/i.test(message.text())) hydrationErrors.push(message.text());
});
const mapResources = /maplibre|\/styles\/(positron|fiord)/i;
const trackOrdinary = request => { if (mapResources.test(request.url())) ordinaryMapRequests.push(request.url()); };
page.on('request', trackOrdinary);
try {
  await page.goto(at('/'));
  const menu = page.getByRole('button', { name: '打开导航菜单' });
  await menu.click();
  assert.equal(await page.locator('#field-mobile-nav').getAttribute('data-open'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', { name: '切换明暗主题' }).click();
  assert.equal(await page.locator('html').evaluate(el => el.classList.contains('dark')), false);
  await page.reload();
  assert.equal(await page.locator('html').evaluate(el => el.classList.contains('dark')), false);

  await page.goto(at('/posts/2019-08-02-learning-sklearn-via-theory-1'));
  assert.ok(await page.locator('#article-content .katex').count());
  assert.ok(await page.getByRole('navigation', { name: '文章目录' }).getByRole('link').count());
  await page.goto(at('/posts/2026-07-14-vps-proxy'));
  await page.getByRole('link', { name: '标题直链：问题背景' }).waitFor();
  const copy = page.getByRole('button', { name: '复制代码' }).first();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base.origin });
  const sample = await page.locator('.field-code-block code').first().textContent();
  await copy.click();
  await page.getByRole('status').filter({ hasText: '已复制' }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), sample);
  await context.clearPermissions();
  await page.goto(at('/posts/2026-07-10-nl-to-sql'));
  await page.locator('.field-mermaid svg').nth(1).waitFor();

  await page.goto(at('/albums/7ce239de-a92b-4bd1-bbc7-a9fa2ed62074'));
  const photo = page.locator('.argus-album-grid__item').first();
  assert.equal(await page.locator('.argus-album-grid__item').count(), 8);
  await page.locator('astro-island[component-url*="AlbumGallery"]:not([ssr])').waitFor({ state: 'attached' });
  await photo.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  const close = dialog.locator('.argus-lightbox__close');
  assert.equal(await close.evaluate(el => document.activeElement === el), true);
  assert.equal(await page.locator('.field-shell').evaluate(el => el.inert), true);
  assert.equal(await page.locator('body').evaluate(el => el.classList.contains('argus-lightbox-open')), true);
  const image = dialog.locator('.argus-lightbox__image img');
  const first = await image.getAttribute('src');
  await page.keyboard.press('ArrowRight');
  assert.notEqual(await image.getAttribute('src'), first);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await dialog.locator('.argus-lightbox__nav--next').evaluate(el => document.activeElement === el), true);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await photo.evaluate(el => document.activeElement === el), true);
  assert.deepEqual(ordinaryMapRequests, [], 'Ordinary pages requested map resources');
  assert.deepEqual(hydrationErrors, [], 'Vue hydration must match the static HTML');
  page.off('request', trackOrdinary);

  assert.equal((await page.goto(at('/does-not-exist-for-migration'))).status(), 404);
  await page.getByRole('heading', { name: '这里已经超出地图范围。' }).waitFor();
  console.log('Chromium: mobile menu, persisted theme, static math/TOC, Mermaid, lightbox keys and focus, ordinary-page map isolation, real 404.');
} finally {
  await browser.close();
}
