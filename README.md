# Zaxon

Personal blog for harumonia, migrated from Hexo to [Valaxy](https://valaxy.site/) with `valaxy-theme-yun`.

## Usage

```bash
pnpm install
pnpm dev
pnpm build
```

The local dev server runs at `http://localhost:4859/` by default.

## Structure

- `pages/posts`: migrated blog posts.
- `pages`: custom pages such as about, archives, tags, categories, links, and schedule.
- `public`: static assets copied by Valaxy, including images, `CNAME`, and `robots.txt`.
- `site.config.ts`: site metadata, author, social links, search, and sponsor config.
- `valaxy.config.ts`: Yun theme config.
- `MIGRATION.md`: migration notes and intentionally skipped legacy content.
