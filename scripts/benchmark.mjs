import assert from 'node:assert/strict';
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { init, parse } from 'es-module-lexer';
await init();
const cases = [
  ['home', '/'], ['article', '/posts/2019-08-02-learning-sklearn-via-theory-1'],
  ['travel', '/posts/2024-06-kyoto'], ['albums', '/albums/'],
  ['album', '/albums/7ce239de-a92b-4bd1-bbc7-a9fa2ed62074'],
];
async function htmlFile(root, route) {
  const base = resolve(root, `.${route}`);
  for (const file of [`${base}.html`, resolve(base, 'index.html')]) if (await stat(file).then(s => s.isFile()).catch(() => false)) return file;
  throw new Error(`Missing route ${route} in ${root}`);
}
function localPath(specifier, importer = '/') {
  if (!specifier || /^(?:data:|https?:|node:)/.test(specifier)) return null;
  const url = new URL(specifier, `https://local${importer}`);
  return /\.(?:m?js)$/.test(url.pathname) ? decodeURIComponent(url.pathname) : null;
}
const results = [];
const builds = [];
if (process.env.VALAXY_DIST) builds.push(['valaxy', resolve(process.env.VALAXY_DIST)]);
if (process.env.VALAXY_OPTIMIZED_DIST) builds.push(['valaxy-optimized', resolve(process.env.VALAXY_OPTIMIZED_DIST)]);
builds.push(['astro', resolve(process.env.ASTRO_DIST || 'dist')]);
for (const [system, root] of builds) {
  for (const [name, route] of cases) {
    const html = await readFile(await htmlFile(root, route), 'utf8');
    const roots = new Set();
    let inlineScriptBytes = 0;
    const inlineScripts = [];
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      const src = match[1].match(/\bsrc="([^"]+)"/);
      if (src) { const path = localPath(src[1]); if (path) roots.add(path); }
      else if (!/application\/ld\+json|application\/json/.test(match[1])) { inlineScriptBytes += Buffer.byteLength(match[2]); inlineScripts.push(match[2]); }
    }
    for (const match of html.matchAll(/<link\b[^>]*>/g)) {
      if (!/rel="modulepreload"/.test(match[0])) continue;
      const href = match[0].match(/href="([^"]+)"/);
      if (href) { const path = localPath(href[1]); if (path) roots.add(path); }
    }
    // Idle islands count toward automatic hydration, even though they do not block paint.
    for (const match of html.matchAll(/(?:component-url|renderer-url)="([^"]+)"/g)) {
      const path = localPath(match[1]); if (path) roots.add(path);
    }
    const files = new Map();
    const deferred = new Set();
    const workerAssets = new Set();
    async function visit(path, graph = files) {
      if (files.has(path) || graph.has(path)) return;
      const source = await readFile(resolve(root, `.${path}`));
      graph.set(path, { path, bytes: source.length, gzipBytes: gzipSync(source).length });
      const code = source.toString();
      const [imports] = parse(code);
      for (const item of imports) {
        const next = localPath(item.specifier, path);
        if (!next) continue;
        if (item.type === 'static' || item.type === 'reexport-star' || (graph !== files && item.type === 'dynamic')) {
          await visit(next, graph);
        } else if (item.type === 'dynamic') {
          deferred.add(next);
        }
      }
      // The ?url wrapper exports a string rather than an ESM import.
      for (const match of code.matchAll(/["'`]((?:\/|\.\/)[^"'`\s]*maplibre-gl-worker\.[^"'`\s]+\.m?js)["'`]/g)) {
        const worker = localPath(match[1], path);
        if (worker) workerAssets.add(worker);
      }
    }
    for (const path of roots) await visit(path);
    const deferredFiles = [];
    for (const path of deferred) if (!files.has(path)) {
      const source = await readFile(resolve(root, `.${path}`));
      deferredFiles.push({ path, bytes: source.length, gzipBytes: gzipSync(source).length });
    }
    const row = {
      system, case: name, route, htmlBytes: Buffer.byteLength(html), htmlGzipBytes: gzipSync(html).length,
      jsFiles: files.size, inlineScriptBytes,
      autoJsBytes: [...files.values()].reduce((n, f) => n + f.bytes, 0) + inlineScriptBytes,
      autoJsGzipBytes: [...files.values()].reduce((n, f) => n + f.gzipBytes, 0) + inlineScripts.reduce((n, s) => n + gzipSync(s).length, 0),
      prerenderedPhotos: [...html.matchAll(/class="argus-album-grid__item"/g)].length,
      prerenderedTravelStops: [...html.matchAll(/data-travel-stop="\d+"/g)].length,
      files: [...files.values()], directDynamicImports: deferredFiles,
    };
    if (name === 'travel') {
      const staticMap = system === 'astro' && html.includes('/travel-maps/');
      const mapEntry = staticMap
        ? /\/TravelStaticBackdrop\./
        : /\/(?:TravelMapBackdrop|maplibre-gl(?:-worker)?)\./;
      const mapGraph = new Map();
      for (const path of deferred) {
        if (mapEntry.test(path)) await visit(path, mapGraph);
      }
      if (!staticMap) {
        for (const worker of workerAssets) await visit(worker, mapGraph);
      }
      const extra = [...mapGraph.values()];
      row.mapRenderer = staticMap ? 'static' : 'dynamic';
      row.mapScenarioJsGzipBytes = row.autoJsGzipBytes + extra.reduce((n, file) => n + file.gzipBytes, 0);
      row.mapScenarioExtraFiles = extra;
    }
    if (system === 'astro') {
      const autoLimit = ['album', 'travel'].includes(name) ? 60 : 55;
      assert.ok(row.autoJsGzipBytes <= autoLimit * 1024, `${name} automatic JS exceeds ${autoLimit} KiB gzip`);
      if (row.mapRenderer === 'dynamic') {
        assert.ok(row.mapScenarioJsGzipBytes <= 525 * 1024, 'Dynamic travel JS exceeds 525 KiB gzip');
      }
    }
    results.push(row);
    console.log(`${system.padEnd(6)} ${name.padEnd(7)} HTML ${(row.htmlGzipBytes / 1024).toFixed(1)} KiB gzip; auto JS ${(row.autoJsGzipBytes / 1024).toFixed(1)} KiB gzip; ${row.jsFiles} modules`);
  }
}
const output = process.env.BENCHMARK_OUTPUT || '.validation/benchmark.json';
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ method: 'Static analysis of production HTML and ESM imports (es-module-lexer). Roots: script src, modulepreload, Astro hydrated component and renderer URLs, plus inline executable scripts. Recursively follow static imports; list direct dynamic imports separately. For travel, follow nested imports from the selected map chunk and worker URL references. Includes idle islands; excludes images, CSS, fonts, interaction/route-triggered dynamic imports and workers not explicitly preloaded. Each resource gzip-compressed independently. This is a dependency budget, NOT observed network traffic or an LCP benchmark. Feature differences are documented in REPORT.md.', results }, null, 2) + '\n');
