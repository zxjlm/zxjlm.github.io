import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { useTravelMapFixture } from './fixtures/travel-map-style.mjs';

const base = new URL(process.env.BASE_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4860').origin;
const realExternal = process.env.REAL_EXTERNAL === '1';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

async function blockExternal(context) {
  await context.route('**/*', route => (
    new URL(route.request().url()).origin === base ? route.continue() : route.abort()
  ));
}

try {
  for (const [article, count, viewport] of [
    ['kyoto', 45, { width: 1280, height: 900 }],
    ['osaka', 43, { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    if (!realExternal) {
      await blockExternal(context);
      await useTravelMapFixture(context);
    }
    const page = await context.newPage();
    const mapErrors = [];
    const requests = [];
    page.on('console', message => {
      if (/(?:circle-11|dynamic travel map (?:resource )?unavailable)/.test(message.text())) mapErrors.push(message.text());
    });
    page.on('request', request => requests.push(request.url()));
    const styles = () => requests.filter(url => url.startsWith('https://tiles.openfreemap.org/styles/'))
      .map(url => new URL(url).pathname.split('/').at(-1));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    await page.goto(`${base}/posts/2019-08-02-learning-sklearn-via-theory-1`, { waitUntil: 'load' });
    assert.ok(!requests.some(url => /(?:TravelMapBackdrop|maplibre-gl)/.test(url)), 'Home and ordinary posts must not load map assets');

    await page.goto(`${base}/posts/2024-06-${article}`);
    const itinerary = page.getByRole('navigation', { name: '行程', exact: true });
    assert.equal(await itinerary.getByRole('link').count(), count);
    assert.equal(await page.locator('[data-travel-stop]').count(), count);
    await page.locator('.travel-map--ready .maplibregl-canvas').waitFor({ timeout: 30000 });
    assert.match(await page.locator('.travel-map__attribution').textContent(), /OpenStreetMap/);
    assert.ok(requests.some(url => /maplibre-gl-worker.*\.js$/.test(url)), 'Travel pages load the Worker entry');
    assert.ok(requests.some(url => /maplibre-gl.*\.css$/.test(url)), 'Travel pages load the map stylesheet');
    assert.ok(page.workers().length > 0, 'MapLibre starts a Worker on the travel page');
    assert.deepEqual(styles(), ['fiord']);

    const link = itinerary.getByRole('link').nth(5);
    await link.focus();
    await page.keyboard.press('Enter');
    await page.locator('#travel-stop-5.travel-stop--active').waitFor();
    assert.equal(await link.getAttribute('aria-current'), 'location');
    assert.equal(new URL(page.url()).hash, '#travel-stop-5');

    await Promise.all([
      page.waitForResponse(response => response.url() === 'https://tiles.openfreemap.org/styles/positron' && response.ok()),
      page.locator('#theme-toggle').click(),
    ]);
    await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
    await page.waitForLoadState('networkidle');
    assert.deepEqual(styles(), ['fiord', 'positron']);
    assert.deepEqual(mapErrors, []);
    console.log(`[travel] ${article} ${viewport.width}px, ${count} anchors, scroll sync, both styles, attribution and lazy Worker passed.`);
    await context.close();
  }

  const context = await browser.newContext({ javaScriptEnabled: false });
  if (!realExternal) await blockExternal(context);
  const page = await context.newPage();
  await page.goto(`${base}/posts/2024-06-kyoto`, { waitUntil: 'domcontentloaded' });
  const itinerary = page.getByRole('navigation', { name: '行程', exact: true });
  assert.equal(await itinerary.getByRole('link').count(), 45);
  await itinerary.getByRole('link').nth(2).click();
  assert.equal(new URL(page.url()).hash, '#travel-stop-2');
  await context.close();
  console.log('[travel] Itinerary anchors remain functional with JavaScript disabled.');
}
finally {
  await browser.close();
}
