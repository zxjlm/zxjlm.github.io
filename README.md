# Zaxon

Personal blog for harumonia, migrated from Hexo to [Valaxy](https://valaxy.site/) with `valaxy-theme-zaxon`.

## Usage

```bash
pnpm install
pnpm dev
pnpm build
```

The local dev server runs at `http://localhost:4859/` by default.

## Deployment

The primary deployment target is Cloudflare Pages via Git integration.

- Production branch: `source`
- Build command: `pnpm run build`
- Build output directory: `dist`
- Root directory: `/`
- Node.js: `22.16.0`
- pnpm: `10.17.1`
- Custom domain: `blog.harumonia.moe`

Cloudflare owns the custom domain binding. Do not rely on `public/CNAME` for deployment.

Legacy fallback configs remain in the repository:

- `netlify.toml` publishes `dist/` and uses Node 22.16.0.
- `vercel.json` keeps `cleanUrls: true`.
- `Dockerfile` and `nginx.conf` remain available for self-hosting.

See `docs/cloudflare-pages.md` for the Cloudflare setup checklist and `docs/external-image-inventory.md` for the image acceleration backlog.

## Structure

- `pages/posts`: migrated blog posts.
- `pages`: custom pages such as about, archives, tags, categories, links, and schedule.
- `public`: static assets copied by Valaxy, including images, `_headers`, and `robots.txt`.
- `site.config.ts`: site metadata, author, social links, search, and sponsor config.
- `valaxy.config.ts`: Zaxon theme config.
- `MIGRATION.md`: migration notes and intentionally skipped legacy content.
