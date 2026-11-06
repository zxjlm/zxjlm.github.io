import { readFileSync, realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { ArgusAlbumIndexManifest, ArgusAlbumManifest, ArgusAlbumSummaryManifest } from '../types/albums.d.ts';

function readJson(publicRoot: string, path: string): unknown {
  const root = realpathSync(publicRoot);
  const file = realpathSync(resolve(root, `.${path}`));
  if (!file.startsWith(root + sep)) throw new Error(`Manifest path escapes public directory: ${path}`);
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid album manifest: ${path}`, { cause: error });
  }
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

export function mediaUrl(value: unknown): string {
  if (!text(value) || /[\u0000-\u0020\\]/.test(value)) return '';
  if (/^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return value;
  } catch {
    return '';
  }
  return '';
}

export function readAlbumIndex(publicRoot: string, path: string): ArgusAlbumIndexManifest {
  const index = readJson(publicRoot, path);
  if (!object(index) || index.schema_version !== 1 || !Array.isArray(index.albums)) {
    throw new Error(`Expected Argus schema_version 1 album index at ${path}`);
  }

  const slugs = new Set<string>();
  const ids = new Set<string>();
  const paths = new Set<string>();
  for (const album of index.albums) {
    if (!object(album) || !text(album.id) || !text(album.slug)
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(album.slug) || album.slug === 'index'
      || !text(album.title) || !text(album.manifest_path)
      || !/^\/albums\/(?:[a-zA-Z0-9_-]+\/)+[a-zA-Z0-9_.-]+\.json$/.test(album.manifest_path)
      || typeof album.photo_count !== 'number' || !Number.isSafeInteger(album.photo_count) || album.photo_count < 0) {
      throw new Error(`Invalid album summary in ${path}: ${object(album) ? album.slug : '<unknown>'}`);
    }
    if (slugs.has(album.slug) || ids.has(album.id) || paths.has(album.manifest_path)) {
      throw new Error(`Duplicate album identity or manifest path: ${album.slug}`);
    }
    slugs.add(album.slug);
    ids.add(album.id);
    paths.add(album.manifest_path);
  }
  return index as unknown as ArgusAlbumIndexManifest;
}

export function readAlbumDetail(publicRoot: string, summary: ArgusAlbumSummaryManifest): ArgusAlbumManifest {
  const path = summary.manifest_path;
  const album = readJson(publicRoot, path);
  if (!object(album) || album.schema_version !== 1 || album.album_id !== summary.id
    || album.slug !== summary.slug || !text(album.title) || !Array.isArray(album.photos)
    || album.photos.length !== summary.photo_count) {
    throw new Error(`Invalid album details or mismatched index: ${path}`);
  }

  const ids = new Set<string>();
  for (const photo of album.photos) {
    if (!object(photo) || !text(photo.id) || ids.has(photo.id)) {
      throw new Error(`Invalid or duplicate photo identity in ${path}`);
    }
    ids.add(photo.id);
  }
  return album as unknown as ArgusAlbumManifest;
}
