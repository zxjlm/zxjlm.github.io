import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig } from '../site.config';
export type Post = CollectionEntry<'posts'>;
export async function posts() {
  return (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.top - a.data.top || b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}
export const postUrl = (post: Post) => `/posts/${post.id.split('/').map(encodeURIComponent).join('/')}`;
export const formatDate = (date: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: siteConfig.timeZone }).format(date);
export function articleNotice(url: string) {
  return `除特别注明外，本博客文章均为个人原创。转载、摘录、总结、改编或引用相关内容时，请注明作者及来源，并附原文链接：[${url}](${url})。未经许可，不得用于商业用途或歪曲原意。`;
}
