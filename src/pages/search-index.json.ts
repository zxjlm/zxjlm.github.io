import type { APIRoute } from 'astro';
import { postCategories } from '../lib/collections';
import { formatDate, posts, postUrl } from '../lib/posts';
import { htmlToSearchText } from '../lib/search-text';
import type { SearchEntry } from '../lib/search';

export const GET: APIRoute = async () => {
  const index: SearchEntry[] = (await posts()).map(post => ({
    title: post.data.title,
    href: postUrl(post),
    date: formatDate(post.data.date),
    keywords: [...postCategories(post), ...post.data.tags].join(' '),
    text: htmlToSearchText(post.rendered?.html ?? ''),
  }));
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
