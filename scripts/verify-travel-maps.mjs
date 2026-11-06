import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderTravelMap } from './travel-map-tooling/render.ts';
import { copyTravelMap, travelMapImages, verifiedTravelMap } from '../src/lib/travel-maps/cache.ts';
import { travelMapConfig } from '../src/lib/travel-maps/config.ts';

const root = await mkdtemp(join(tmpdir(), 'zaxon-travel-test-'));
const cli = fileURLToPath(new URL('./travel-maps.mjs', import.meta.url));
const points = [{ lat: 35.0116, lng: 135.7681 }];
const config = { ...travelMapConfig(), mode: 'static' };
const publicRoot = join(root, 'public');
const cacheRoot = join(root, '.cache', 'zaxon');
const post = join(root, 'src/content/posts/test.md');
const cliOptions = { env: { ...process.env, TRAVEL_MAP_MODE: 'static' }, encoding: 'utf8' };
const check = () => spawnSync(process.execPath, [cli, '--root', root, '--check'], cliOptions);
const expectSuccess = () => {
  const result = check();
  assert.equal(result.status, 0, result.stderr);
};
const expectFailure = () => {
  const result = check();
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /static travel map missing, stale, or corrupt/);
};
const source = (coordinate, draft = false) => `---\nlayout: travel\ndraft: ${draft}\n---\n\n京都　**行程**\n${coordinate}\n`;

try {
  await mkdir(dirname(post), { recursive: true });
  await writeFile(post, source('35.0116，135.7681'));
  await writeFile(join(dirname(post), 'draft.md'), source('34.6, 135.5', true));
  expectFailure();

  // A deterministic, local basemap exercises real Native and WebP rendering.
  const resource = url => Promise.resolve(Buffer.from(JSON.stringify({
    version: 8,
    sources: {},
    layers: [{
      id: 'background', type: 'background',
      paint: { 'background-color': url === config.darkStyle ? '#26323c' : '#d7dac9' },
    }],
  })));
  const manifest = await renderTravelMap(publicRoot, points, config, 'fixture', resource);
  assert.equal(manifest.version, 2);
  assert.ok(travelMapImages(manifest).length >= 4);
  for (const path of travelMapImages(manifest)) {
    const image = await readFile(join(publicRoot, path));
    assert.equal(image.toString('ascii', 0, 4), 'RIFF');
    assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  }
  assert.deepEqual(await verifiedTravelMap(publicRoot, points, config), manifest);
  expectSuccess();

  await copyTravelMap(manifest, publicRoot, cacheRoot);
  const damaged = join(publicRoot, travelMapImages(manifest)[0]);
  await writeFile(damaged, 'corrupt');
  expectFailure();
  await rm(publicRoot, { recursive: true });
  const restored = execFileSync(process.execPath, [cli, '--root', root], cliOptions);
  assert.match(restored, /Restored src\/content\/posts\/test\.md/);
  expectSuccess();

  await writeFile(post, source('35.0117, 135.7681'));
  expectFailure();
  console.log('[travel] Native generation, WebP, clean cache restore, draft filtering, corruption and changed coordinates passed.');
}
finally {
  await rm(root, { recursive: true, force: true });
}
