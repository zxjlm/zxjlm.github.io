import type { APIRoute } from 'astro';
import { collectionAliases } from '../lib/collections';
import { legacyPostPaths } from '../lib/legacy-post-paths';
import { posts, postUrl } from '../lib/posts';
import { publicPaths } from '../lib/site-paths';

export const GET: APIRoute = async () => {
  const all = await posts();
  const rules = new Map<string, string>();
  for (const { from, to } of collectionAliases(all)) {
    const target = to.replace(/\/$/, '');
    rules.set(from, target);
    rules.set(from.slice(0, -1), target);
    rules.set(`${from.slice(0, -1)}.html`, target);
  }
  const byId = new Map(all.map(post => [post.id, postUrl(post)]));
  for (const [from, id] of Object.entries(legacyPostPaths)) {
    const to = byId.get(id);
    if (!to) continue;
    rules.set(from, to);
    rules.set(from.slice(0, -1), to);
  }
  for (const path of publicPaths(all)) {
    if (path !== '/') rules.set(`${path}/`, path);
  }
  // Avoid exceeding Cloudflare Pages' limit or publishing a partial redirect table.
  if (rules.size > 2000) throw new Error('Cloudflare Pages allows at most 2000 static redirects');
  return new Response([...rules].map(([from, to]) => `${from} ${to} 301\n`).join(''));
};
