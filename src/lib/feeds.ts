import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import { Feed } from 'feed';
import { readFile } from 'node:fs/promises';
import { posts, postUrl } from './posts';
import { siteConfig } from '../site.config';

export const escapeXml = (text: unknown) => String(text ?? '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);
const markdown = new MarkdownIt({ html: true, breaks: true, linkify: true });
const author = { name: siteConfig.author, email: 'i@valaxy.site', link: 'https://valaxy.site' };

export async function feed(kind: 'atom' | 'rss' | 'json', site: URL) {
  const all = (await posts()).sort((a, b) => +b.data.feedDate - +a.data.feedDate || a.id.localeCompare(b.id));
  const url = (path: string) => new URL(path, site).href;
  const output = new Feed({
    id: site.href, link: site.href, title: siteConfig.title, description: 'lazy',
    author, image: 'https://harumona-blog.oss-cn-beijing.aliyuncs.com/blog/Ocabe.webp',
    favicon: url('/pwa-192x192.png'),
    copyright: `CC BY-NC-SA 4.0 ${new Date().getUTCFullYear()} © ${siteConfig.author}`,
    updated: all[0]?.data.feedDate ?? new Date(0),
    feedLinks: { atom: url('/atom.xml'), rss: url('/feed.xml'), json: url('/feed.json') },
  });
  for (const post of all) {
    const link = url(postUrl(post));
    // Match the legacy gray-matter excerpt separator and MarkdownIt options.
    const raw = await readFile(post.filePath!, 'utf8');
    const parsed = matter(raw, { excerpt_separator: '<!-- more -->', engines: { yaml: () => ({}) } });
    const excerpt = parsed.excerpt || parsed.content.slice(0, 100);
    const html = markdown.render(excerpt).replace(/src="([^"]+)"/g, (attribute, src) => {
      if (/^(?:https?:|data:)/i.test(src)) return attribute;
      return `src="${escapeXml(new URL(src, link).href)}"`;
    });
    const content = `${html}<br/><p>访问 <a href="${escapeXml(link)}" target="_blank">${escapeXml(link)}</a> 阅读全文。</p>`;
    output.addItem({
      id: post.data.id == null ? link : String(post.data.id),
      title: post.data.title, link, content, author: [author],
      description: post.data.description ?? undefined,
      image: post.data.image ? url(post.data.image) : undefined,
      // The old serializer uses the publication date for both fields.
      date: post.data.feedDate, published: post.data.feedDate,
    });
  }
  const formats = {
    atom: { serialize: () => output.atom1(), mime: 'application/atom+xml' },
    rss: { serialize: () => output.rss2(), mime: 'application/rss+xml' },
    json: { serialize: () => output.json1(), mime: 'application/feed+json' },
  };
  const { serialize, mime } = formats[kind];
  return new Response(serialize(), { headers: { 'Content-Type': `${mime}; charset=utf-8` } });
}
