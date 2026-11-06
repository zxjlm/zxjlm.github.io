import { albums, albumUrl } from './albums';
import { buildCollections, collectionUrl } from './collections';
import { posts, postUrl, type Post } from './posts';

export const sectionPaths = ['/about', '/albums', '/archives', '/categories', '/links', '/notes', '/schedule', '/tags', '/tech', '/search'];

export function publicPaths(all: Post[]) {
  const { categories, tags } = buildCollections(all);
  return [
    '/', ...sectionPaths,
    ...all.map(postUrl),
    ...albums().entries.map(album => albumUrl(album.slug)),
    ...[...categories.values()].map(detail => collectionUrl('categories', detail.path).slice(0, -1)),
    ...[...tags.values()].map(detail => collectionUrl('tags', detail.path).slice(0, -1)),
  ];
}

export async function sitemapPaths() {
  return publicPaths(await posts()).sort();
}
