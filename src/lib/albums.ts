import { siteConfig } from '../site.config';
import { mediaUrl, readAlbumDetail, readAlbumIndex } from './album-manifests';
import type { ArgusAlbumManifest, ArgusAlbumPhoto, ArgusAlbumSummaryManifest } from '../types/albums';

const str = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const tags = (value: unknown) => Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === 'string') : [];
const positive = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;

export function albums() {
  try {
    const index = readAlbumIndex('public', siteConfig.albums.indexPath);
    return { available: true, entries: index.albums.toSorted((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) };
  } catch (error) {
    console.warn('[albums] 相册目录无法加载。', error);
    return { available: false, entries: [] };
  }
}

export function albumDetail(summary: ArgusAlbumSummaryManifest) {
  try {
    return readAlbumDetail('public', summary);
  } catch (error) {
    console.warn(`[albums] 相册 ${summary.slug} 无法加载。`, error);
    return null;
  }
}

export const albumUrl = (slug: string) => `/albums/${slug}`;

export function albumPhotos(album: ArgusAlbumManifest): ArgusAlbumPhoto[] {
  return album.photos.flatMap((photo) => {
    const previewPath = mediaUrl(photo.preview_path);
    const thumbnailPath = mediaUrl(photo.thumbnail_path);
    if (!previewPath && !thumbnailPath) return [];
    const videoPath = mediaUrl(photo.live_photo?.video_path);
    return [{
      id: photo.id, originalFilename: str(photo.original_filename), width: positive(photo.width), height: positive(photo.height),
      capturedAt: str(photo.captured_at), city: str(photo.city),
      camera: [str(photo.camera_make), str(photo.camera_model)].filter(Boolean).join(' '), lens: str(photo.lens_model),
      focalLength: str(photo.focal_length), aperture: str(photo.aperture), shutterSpeed: str(photo.shutter_speed), iso: str(photo.iso),
      tags: [...new Set([...tags(photo.ai_tags), ...tags(photo.manual_tags)])],
      previewPath: previewPath || thumbnailPath, thumbnailPath: thumbnailPath || previewPath,
      livePhoto: videoPath ? { videoPath, durationMs: positive(photo.live_photo?.duration_ms) } : null,
      featured: photo.featured === true, featuredOrder: typeof photo.featured_order === 'number' ? photo.featured_order : null,
      journalExcerpt: str(photo.journal_excerpt),
    }];
  });
}

export function albumDate(value?: string | null) {
  if (typeof value !== 'string') return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat(siteConfig.lang, { dateStyle: 'medium', timeZone: siteConfig.timeZone }).format(date);
}

export function albumDateSummary(photos: ArgusAlbumPhoto[], updatedAt?: string | null) {
  const dates = photos.map(photo => photo.capturedAt.slice(0, 10)).filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
  if (!dates.length) return albumDate(updatedAt);
  return [...new Set([albumDate(dates[0]), albumDate(dates.at(-1))])].filter(Boolean).join(' - ');
}

export function albumCoverSources(album: ArgusAlbumSummaryManifest) {
  const thumbnails = Array.isArray(album.preview_thumbnails) ? album.preview_thumbnails : [];
  return [...new Set([album.cover, ...thumbnails].map(mediaUrl).filter(Boolean))];
}

export function homeAlbumPhotos(entries: ArgusAlbumSummaryManifest[]) {
  const { featured } = siteConfig.albums;
  if (featured.enable) {
    const curated = entries.flatMap((album) => {
      const detail = albumDetail(album);
      if (!detail) return [];
      return albumPhotos(detail).filter(photo => photo.featured).map(photo => ({
        href: albumUrl(album.slug), title: album.title, src: photo.thumbnailPath, fallback: photo.previewPath,
        order: photo.featuredOrder ?? Number.MAX_SAFE_INTEGER,
      }));
    }).toSorted((first, second) => first.order - second.order).slice(0, featured.limit);
    if (curated.length) return { photos: curated, random: false };
  }

  const seen = new Set<string>();
  const photos = entries.flatMap((album) => {
    const sources = albumCoverSources(album);
    return sources.flatMap((src) => {
      if (seen.has(src)) return [];
      seen.add(src);
      return [{ href: albumUrl(album.slug), title: album.title, src, fallback: sources.find(url => url !== src) }];
    });
  });
  return { photos, random: true };
}
