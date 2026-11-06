import { rename } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import { siteConfig } from './src/site.config.ts';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkLegacyMarkdown } from './src/lib/remark-legacy-markdown.mjs';
import { remarkTravelStops } from './src/lib/remark-travel-stops.mjs';

export default defineConfig({
  site: siteConfig.url,
  output: 'static',
  prerenderConflictBehavior: 'error',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [vue(), {
    name: 'pages-hosting-rules',
    hooks: {
      // Astro treats underscore-prefixed source files as private routes.
      'astro:build:done': ({ dir }) => rename(new URL('hosting-redirects.txt', dir), new URL('_redirects', dir)),
    },
  }],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
    processor: unified({
      remarkPlugins: [remarkMath, remarkLegacyMarkdown, remarkTravelStops],
      rehypePlugins: [[rehypeKatex, { strict: false, throwOnError: false }]],
    }),
  },
  vite: { build: { assetsInlineLimit: 0 } },
});
