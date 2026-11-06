import { copyFileSync, existsSync, mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { readAlbumDetail, readAlbumIndex } from '../src/lib/album-manifests.ts';
import { siteConfig } from '../src/site.config.ts';

const [source, ...extra] = process.argv.slice(2);
if (!source || extra.length) {
  console.error('Usage: node scripts/import-argus-albums.mjs <Argus staging site directory | --empty>');
  process.exit(1);
}
const publicRoot = resolve('public');
const { indexPath } = siteConfig.albums;
const destination = resolve(publicRoot, `.${dirname(indexPath)}`);
const sourceRoot = source === '--empty' ? null : realpathSync(resolve(source, 'public'));
if (sourceRoot === realpathSync(publicRoot)) {
  throw new Error('Export to a separate staging site before importing.');
}

const index = sourceRoot ? readAlbumIndex(sourceRoot, indexPath) : { schema_version: 1, albums: [] };
const manifestPaths = index.albums.map((summary) => {
  readAlbumDetail(sourceRoot, summary);
  return summary.manifest_path;
});

const lock = resolve('.argus-albums-import');
mkdirSync(lock);
let temporary;
let preserveBackup = false;
try {
  if (index.albums.length && existsSync(resolve(publicRoot, `.${indexPath}`))) {
    const previousIndex = readAlbumIndex(publicRoot, indexPath);
    const previousById = new Map(previousIndex.albums.map(album => [album.id, album]));
    const previousBySlug = new Map(previousIndex.albums.map(album => [album.slug, album.id]));
    for (const album of index.albums) {
      const previous = previousById.get(album.id);
      const slugOwner = previousBySlug.get(album.slug);
      if (slugOwner && slugOwner !== album.id) {
        throw new Error(`Published album slug already belongs to another album: ${album.slug}`);
      }
      if (previous && (previous.slug !== album.slug || previous.manifest_path !== album.manifest_path)) {
        throw new Error(`Existing public route changed for album ${album.id}. Export with --slug ${previous.slug} and the original public base.`);
      }
    }
  }

  // Keep both generations on the same filesystem so rename never crosses devices.
  temporary = mkdtempSync(resolve(lock, 'stage-'));
  const previous = resolve(temporary, 'previous');
  const next = resolve(temporary, 'next');
  mkdirSync(next);
  const stagePath = path => resolve(next, `.${path.slice(dirname(indexPath).length)}`);
  if (sourceRoot) {
    for (const path of [indexPath, ...manifestPaths]) {
      const target = stagePath(path);
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(resolve(sourceRoot, `.${path}`), target);
    }
  } else {
    writeFileSync(stagePath(indexPath), JSON.stringify(index, null, 2) + '\n');
  }

  const hadPrevious = existsSync(destination);
  if (hadPrevious) renameSync(destination, previous);
  try {
    renameSync(next, destination);
  } catch (error) {
    if (hadPrevious) {
      try {
        renameSync(previous, destination);
      } catch (restoreError) {
        preserveBackup = true;
        throw new AggregateError([error, restoreError], `Restore the previous album directory from ${previous}`);
      }
    }
    throw error;
  }
  console.log(`Imported ${index.albums.length} Argus albums (${index.albums.reduce((count, album) => count + album.photo_count, 0)} photos).`);
} finally {
  if (!preserveBackup) rmSync(lock, { recursive: true, force: true });
}
