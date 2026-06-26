# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # dev server (default http://localhost:4859/)
pnpm build        # SSG build → dist/
pnpm build:spa    # SPA build (no pre-render)
pnpm rss          # regenerate RSS/Atom feeds
pnpm serve        # preview the built dist/
```

No lint or test commands are configured.

## Architecture

This is a **Valaxy** static blog (Vue 3, Vite, UnoCSS). The framework generates pages from Markdown files and composes layouts from the active theme.

### Config split

| File | Purpose |
|------|---------|
| `site.config.ts` | Site-wide metadata: title, author, social links, search, sponsor |
| `valaxy.config.ts` | Theme selection and theme-specific options (`themeConfig`) |

Both files are typed — `site.config.ts` uses `defineSiteConfig`, `valaxy.config.ts` uses `defineValaxyConfig<ThemeConfig>`.

### Theme

The active theme is **`valaxy-theme-zaxon`**, linked locally via `package.json`:

```json
"valaxy-theme-zaxon": "link:../haru-theme/theme"
```

This means `../haru-theme/theme` (the sibling project) is the live source of the theme. Any changes there take effect immediately without reinstalling. If the haru-theme directory moves, run `pnpm install` to re-create the symlink.

The theme exposes `ThemeConfig` (see `../haru-theme/theme/types/index.d.ts`) with these top-level fields:
- `colors.primary` — accent color
- `nav` — top navigation items `{ text, link, icon? }[]`
- `footer` — `since`, `icon`, `beian`, `powered`

Features from the previous `valaxy-theme-yun` (banner, bg_image, fireworks, say, notice, google_analytics, creative_commons) are **not available** in zaxon — do not add them to `themeConfig`.

### Overriding theme layouts and components

- `layouts/` — place a `.vue` file here with the same name as a theme layout to override it (e.g. `layouts/post.vue`)
- `components/` — Vue components here are auto-registered globally and override theme components of the same name

Both directories are currently empty (placeholder READMEs only).

### Pages and routing

All content lives under `pages/`. Valaxy generates routes from the file tree:

- `pages/posts/*.md` — blog posts
- `pages/about/`, `pages/links/`, `pages/schedule/` — standalone pages
- `pages/archives/`, `pages/categories/`, `pages/tags/` — collection index pages

**Critical:** Collection index pages (archives, categories, tags) must declare their layout with `layout:` in frontmatter, not `type:`. Using the Hexo-style `type:` field will produce an empty page because Valaxy does not map it to a layout.

```md
---
layout: archives   # correct
# type: archives   # wrong — Hexo legacy, ignored by Valaxy
---
```

### Post frontmatter

Migrated posts carry Hexo-era fields (`cid`, `slug`, `status`) that Valaxy ignores. The fields Valaxy reads are: `title`, `date`, `updated`, `categories`, `tags`, `excerpt`, `draft`, `layout`.

### Styles

`styles/index.scss` is the project-level stylesheet, applied on top of the theme. Use it for blog-specific overrides only — theme-wide style changes belong in `../haru-theme/theme/styles/layout.scss`.

### Locales

`locales/zh-CN.yml` and `locales/en.yml` can add or override i18n keys for this blog instance without touching the theme.

### Static assets

`public/` is copied verbatim to `dist/`. It contains `CNAME` (GitHub Pages domain), `robots.txt`, favicons, and legacy feed files.

## Deployment

- **Netlify** is the primary deployment target (`netlify.toml`): publishes `dist/`, builds with `pnpm run build`, Node 20.
- A `vercel.json` is also present with `cleanUrls: true` as a fallback option.
- A `Dockerfile` and `nginx.conf` exist for self-hosted container deployment.

## Migration context

The blog was migrated from Hexo + hexo-theme-yun → Valaxy + valaxy-theme-yun → (current) valaxy-theme-zaxon. Old Hexo files are archived in `legacy-hexo/` (git-ignored). The `MIGRATION.md` documents what was and wasn't ported.
