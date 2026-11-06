import { access, readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { createMarkdownProcessor, parseFrontmatter } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import { remarkTravelStops } from '../src/lib/remark-travel-stops.mjs';
import { copyTravelMap, prepareCachedTravelMap, verifiedTravelMap } from '../src/lib/travel-maps/cache.ts';
import { travelMapConfig } from '../src/lib/travel-maps/config.ts';

async function main() {
  const { values } = parseArgs({
    options: {
      root: { type: 'string', default: '.' },
      file: { type: 'string' },
      force: { type: 'boolean' },
      check: { type: 'boolean' },
      'cache-dir': { type: 'string' },
      help: { type: 'boolean' },
    },
  });
  if (values.help) {
    console.log('pnpm travel:maps [--root <content workspace>] [--file <path relative to workspace>] [--force | --check] [--cache-dir <directory>]');
    return;
  }
  if (values.check && values.force) throw new Error('--check and --force are mutually exclusive');

  const config = travelMapConfig();
  if (values.check && config.mode === 'dynamic') {
    console.log('[travel] Dynamic maps enabled. Static resources are optional.');
    return;
  }
  const root = resolve(values.root);
  const postsRoot = join(root, 'src/content/posts');
  const publicRoot = join(root, 'public');
  const cacheRoot = resolve(values['cache-dir'] || join(root, '.cache', 'zaxon'));
  if (cacheRoot === publicRoot || cacheRoot.startsWith(publicRoot + sep))
    throw new Error('--cache-dir must be outside the public directory');

  const files = values.file
    ? [resolve(root, values.file)]
    : (await readdir(postsRoot, { recursive: true, withFileTypes: true }))
      .filter(entry => entry.isFile() && !entry.name.startsWith('_') && /\.md$/i.test(entry.name))
      .map(entry => join(entry.parentPath, entry.name)).sort();
  const parser = await createMarkdownProcessor({ syntaxHighlight: false, remarkPlugins: [remarkMath, remarkTravelStops] });
  let generated = 0;
  let renderer;
  for (const file of files) {
    const { frontmatter, content } = parseFrontmatter(await readFile(file, 'utf8'));
    if (frontmatter.layout !== 'travel' || frontmatter.draft === true) continue;
    const { metadata } = await parser.render(content, { frontmatter, fileURL: pathToFileURL(file) });
    const points = metadata.frontmatter.travelStops.map(({ lat, lng }) => ({ lat, lng }));
    if (!points.length) continue;
    const label = relative(root, file);
    if (points.some(({ lat }) => Math.abs(lat) > 85.051129))
      throw new Error(`${label}: static maps require latitude within ±85.051129°`);

    if (values.check) {
      if (!await verifiedTravelMap(publicRoot, points, config))
        throw new Error(`${label}: static travel map missing, stale, or corrupt. Run pnpm travel:maps.`);
      console.log(`[travel] Verified ${label}`);
      continue;
    }

    const cached = !values.force && await prepareCachedTravelMap(publicRoot, cacheRoot, points, config);
    if (cached) {
      console.log(`[travel] ${cached === 'restored' ? 'Restored' : 'Cached and verified'} ${label}`);
      continue;
    }
    if (!renderer) {
      try {
        await access(new URL('./travel-map-tooling/node_modules/@maplibre/maplibre-gl-native/', import.meta.url));
        const { renderTravelMap } = await import('./travel-map-tooling/render.ts');
        const { createMapResourceLoader } = await import('./travel-map-tooling/resources.ts');
        const resource = createMapResourceLoader();
        renderer = (points, label) => renderTravelMap(publicRoot, points, config, label, resource);
      }
      catch (cause) {
        throw new Error('Install the static renderer with pnpm --dir scripts/travel-map-tooling install --frozen-lockfile.', { cause });
      }
    }

    const manifest = await renderer(points, label);
    if (!await verifiedTravelMap(publicRoot, points, config))
      throw new Error(`${label}: generated static map failed verification`);
    await copyTravelMap(manifest, publicRoot, cacheRoot);
    generated += 1;
  }
  if (!values.check) console.log(`[travel] Generated ${generated} route(s). Commit the referenced public/travel-maps assets when publishing in static mode.`);
}

main().catch(error => {
  console.error('[travel]', error);
  process.exitCode = 1;
});
