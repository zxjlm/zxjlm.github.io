import { siteConfig } from '../site.config';
import type { Post } from './posts';

type EntryKind = 'article' | 'life' | 'note' | 'photo' | 'quote' | 'travel';

export function entryKind(post: Post): EntryKind {
  const { categories, layout, title, excerpt, tags, type } = post.data;
  const text = [title, excerpt, type, ...tags, ...categories].join(' ').toLowerCase();
  if (layout === 'travel') return 'travel';
  if (/photo|摄影|旅行|照片|胶片/.test(text)) return 'photo';
  if (/quote|摘录|引用|句子/.test(text)) return 'quote';
  if (/note|笔记|备忘|随记|灵感/.test(text)) return 'note';
  if (/life|生活|阅读|音乐|咖啡/.test(text)) return 'life';
  return 'article';
}

export function isLife(post: Post) {
  const { categories } = post.data;
  if (categories.some(category => siteConfig.content.lifeCategories.includes(category))) return true;
  if (categories.some(category => siteConfig.content.devCategories.includes(category))) return false;
  return ['life', 'photo', 'quote', 'travel'].includes(entryKind(post));
}

export function articleCardKind(post: Post) {
  const { categories, layout, title, excerpt, tags } = post.data;
  const text = [title, excerpt, ...tags, ...categories].join(' ').toLowerCase();
  if (layout === 'travel') return { kind: 'life', label: 'TRAVEL' };
  if (/photo|life|生活|旅行|摄影|阅读|随笔|音乐/.test(text)) return { kind: 'life', label: 'LIFE' };
  if (/note|笔记|memo|i18n|test/.test(text)) return { kind: 'note', label: 'NOTE' };
  return { kind: 'dev', label: 'DEV' };
}
