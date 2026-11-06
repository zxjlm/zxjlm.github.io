import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPostIds, readPostMetadata } from './lib/post-metadata.mjs';

const postDirectory = fileURLToPath(new URL('./content/posts/', import.meta.url));
const strings = z.union([z.string(), z.array(z.string())]).nullish()
  .transform(value => (typeof value === 'string' ? [value] : value ?? []).filter(Boolean));

const loader = glob({
  base: './src/content/posts',
  pattern: '**/*.[mM][dD]',
  generateId: ({ entry, base, data }) => {
    const file = new URL(entry, base);
    // Astro parses YAML timestamps before validation. Read their original calendar values.
    Object.assign(data, readPostMetadata(readFileSync(file, 'utf8'), entry));
    return entry.replace(/\.md$/i, '');
  },
});

const posts = defineCollection({
  loader: {
    ...loader,
    load: context => {
      const entries = readdirSync(postDirectory, { recursive: true, withFileTypes: true })
        .filter(entry => entry.isFile() && !entry.name.startsWith('_') && /\.md$/i.test(entry.name))
        .map(entry => relative(postDirectory, resolve(entry.parentPath, entry.name)));
      checkPostIds(entries);
      return loader.load(context);
    },
  },
  schema: z.object({
    title: z.string().trim().min(1),
    date: z.date(), updated: z.date().optional(), feedDate: z.date(),
    categories: strings, tags: strings,
    layout: z.string().default('post'),
    excerpt: z.string().nullish(), cover: z.string().nullish(),
    author: z.string().nullish(), gravatar: z.string().nullish(), twitter: z.string().nullish(),
    type: z.string().nullish(), description: z.string().nullish(), image: z.string().nullish(),
    top: z.union([z.number(), z.boolean()]).nullish().transform(value => Number(value ?? 0)),
    draft: z.boolean().nullish().transform(value => value ?? false),
    id: z.union([z.string(), z.number()]).nullish(),
    // The Hexo slug remains metadata. The filename is the route key.
    slug: z.union([z.string(), z.number()]).nullish(),
  }),
});
export const collections = { posts };
