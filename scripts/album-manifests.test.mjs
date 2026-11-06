import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { mediaUrl, readAlbumDetail, readAlbumIndex } from '../src/lib/album-manifests.ts';

const indexPath = '/albums/index.json';
const importer = fileURLToPath(new URL('./import-argus-albums.mjs', import.meta.url));
const summary = (id, slug, title = slug) => ({
  id, slug, title, manifest_path: `/albums/${slug}/album.json`, photo_count: 0,
});

function temporary(testContext) {
  const root = mkdtempSync(join(tmpdir(), 'zaxon-albums-'));
  testContext.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function writeJson(root, path, value) {
  const file = join(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value));
}

function writeSnapshot(root, albums) {
  writeJson(root, indexPath, { schema_version: 1, albums });
  for (const album of albums) {
    writeJson(root, album.manifest_path, {
      schema_version: 1, album_id: album.id, slug: album.slug, title: album.title, photos: [],
    });
  }
}

test('validates the v1 index, paths and matching detail identity', t => {
  const root = temporary(t);
  const album = summary('first-id', 'first-album');
  writeSnapshot(root, [album]);
  assert.deepEqual(readAlbumIndex(root, indexPath).albums, [album]);
  assert.deepEqual(readAlbumDetail(root, album).photos, []);

  writeJson(root, indexPath, { schema_version: 2, albums: [album] });
  assert.throws(() => readAlbumIndex(root, indexPath), /schema_version 1/);
  writeJson(root, indexPath, { schema_version: 1, albums: [album, album] });
  assert.throws(() => readAlbumIndex(root, indexPath), /Duplicate album identity/);
  writeJson(root, indexPath, { schema_version: 1, albums: [{ ...album, manifest_path: '/albums/../secret.json' }] });
  assert.throws(() => readAlbumIndex(root, indexPath), /Invalid album summary/);
  assert.throws(() => readAlbumDetail(root, { ...album, photo_count: 1 }), /mismatched index/);
  assert.throws(() => readAlbumDetail(root, { ...album, id: 'other-id' }), /mismatched index/);

  assert.equal(mediaUrl('https://assets.example.test/photo.jpg'), 'https://assets.example.test/photo.jpg');
  assert.equal(mediaUrl('/images/photo.jpg'), '/images/photo.jpg');
  assert.equal(mediaUrl('javascript:alert(1)'), '');
  assert.equal(mediaUrl('/\\evil.example.test'), '');
});

test('imports complete Argus snapshots and guards existing public paths', t => {
  const root = temporary(t);
  const site = join(root, 'astro');
  const publicRoot = join(site, 'public');
  mkdirSync(publicRoot, { recursive: true });
  const initial = join(root, 'initial');
  const update = join(root, 'update');
  const renamed = join(root, 'renamed');
  const reused = join(root, 'reused');
  const first = summary('first-id', 'first-album');
  const second = summary('second-id', 'second-album');
  writeSnapshot(join(initial, 'public'), [first, second]);
  writeSnapshot(join(update, 'public'), [{ ...first, title: 'Revised title' }]);
  writeSnapshot(join(renamed, 'public'), [summary('first-id', 'renamed-album')]);
  writeSnapshot(join(reused, 'public'), [summary('different-id', 'first-album')]);
  writeFileSync(join(initial, 'private-route.md'), 'Valaxy route placeholder');

  const run = source => spawnSync(process.execPath, [importer, source], { cwd: site, encoding: 'utf8' });
  const read = path => JSON.parse(readFileSync(join(publicRoot, path), 'utf8'));

  for (const source of [initial, initial, update]) {
    const result = run(source);
    assert.equal(result.status, 0, result.stderr);
  }
  assert.equal(read(first.manifest_path).title, 'Revised title');
  assert.ok(!existsSync(join(publicRoot, second.manifest_path)));
  assert.ok(!existsSync(join(site, 'private-route.md')));

  const rejected = run(renamed);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /Existing public route changed/);
  assert.match(run(reused).stderr, /slug already belongs to another album/);
  assert.equal(read(first.manifest_path).title, 'Revised title');

  const emptied = run('--empty');
  assert.equal(emptied.status, 0, emptied.stderr);
  assert.deepEqual(read(indexPath).albums, []);
  assert.ok(!existsSync(join(publicRoot, first.manifest_path)));
});
