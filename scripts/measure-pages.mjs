import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { useTravelMapFixture } from './fixtures/travel-map-style.mjs';

const builds = {
  valaxy: process.env.VALAXY_BASE_URL ?? 'http://127.0.0.1:4861',
  astro: process.env.BASE_URL ?? 'http://127.0.0.1:4860',
};
const cases = {
  home: '/',
  article: '/posts/2019-08-02-learning-sklearn-via-theory-1',
  album: '/albums/7ce239de-a92b-4bd1-bbc7-a9fa2ed62074',
  travel: '/posts/2024-06-kyoto',
};
const viewport = { width: 390, height: 844 };
const network = { offline: false, latency: 75, downloadThroughput: 6_000_000 / 8, uploadThroughput: 750_000 / 8 };
const browser = await chromium.launch({ args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const samples = [];

async function sample(system, origin, label, path) {
  const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
  if (label === 'travel') await useTravelMapFixture(context);
  await context.addInitScript(() => {
    window.lab = { lcp: null, longTasks: [] };
    new PerformanceObserver(list => {
      window.lab.lcp = list.getEntries().at(-1)?.startTime ?? null;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => {
      window.lab.longTasks.push(...list.getEntries().map(entry => entry.duration));
    }).observe({ type: 'longtask', buffered: true });
  });
  const page = await context.newPage();
  const workers = [];
  page.on('worker', worker => workers.push(worker.url()));
  const cdp = await context.newCDPSession(page);
  const requests = new Map();
  cdp.on('Network.responseReceived', ({ requestId, response, type }) => {
    requests.set(requestId, { url: response.url, type, bytes: 0 });
  });
  cdp.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
    const request = requests.get(requestId);
    if (request) request.bytes = encodedDataLength;
  });
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', network);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Performance.enable');
  try {
    await page.goto(new URL(path, origin).href, { waitUntil: 'load', timeout: 75_000 });
    if (label === 'travel') {
      await page.locator('.travel-map--ready').waitFor({ timeout: 15_000, state: 'attached' }).catch(() => {});
    }
    await page.waitForTimeout(1000);
    const timings = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
        lcp: window.lab.lcp,
        load: nav.loadEventEnd,
        longTasks: [...window.lab.longTasks],
      };
    });
    let interaction = null;
    const toggle = page.locator('#theme-toggle, .field-theme-toggle, .field-nav__theme-toggle, button[aria-label*="主题"], button[aria-label*="模式"]').first();
    if (await toggle.isVisible()) {
      interaction = await toggle.evaluate(button => new Promise(resolve => {
        const start = performance.now();
        (/** @type {HTMLElement} */ (button)).click();
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(performance.now() - start)));
      }));
    }
    const { metrics } = await cdp.send('Performance.getMetrics');
    const value = name => metrics.find(metric => metric.name === name)?.value ?? null;
    return {
      system, label, ...timings, interaction,
      scriptMs: value('ScriptDuration') * 1000,
      mapReady: label === 'travel' ? Boolean(await page.locator('.travel-map--ready').count()) : null,
      workers, requests: [...requests.values()],
    };
  } finally {
    await context.close();
  }
}

try {
  for (let run = 1; run <= 3; run++) {
    for (const [label, path] of Object.entries(cases)) {
      for (const [system, origin] of Object.entries(builds)) {
        const result = await sample(system, origin, label, path);
        samples.push({ run, ...result });
        console.log(`${system} ${label} #${run}: FCP ${Math.round(result.fcp)}ms, LCP ${Math.round(result.lcp)}ms, ${result.requests.length} responses`);
      }
    }
  }
} finally {
  await browser.close();
  await mkdir('.validation', { recursive: true });
  await writeFile('.validation/performance.json', JSON.stringify({
    browser: browser.version(), viewport, network, cpuThrottle: 4,
    external: 'External requests blocked. Travel map style and vector tile use the same local fixture.',
    samples,
  }, null, 2) + '\n');
}
