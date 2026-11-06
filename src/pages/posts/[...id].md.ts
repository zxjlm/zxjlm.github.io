import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { posts, postUrl, articleNotice, type Post } from '../../lib/posts';
export async function getStaticPaths() { return (await posts()).map(post => ({ params: { id: post.id }, props: { post } })); }
export const GET: APIRoute = async ({ props, site }) => {
  const post = props.post as Post;
  const raw = await readFile(post.filePath!, 'utf8');
  const url = new URL(postUrl(post), site).href;
  return new Response(`${raw.trimEnd()}\n\n## 文章声明\n\n${articleNotice(url)}\n`, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
