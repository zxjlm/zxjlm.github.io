# Valaxy Migration Notes

This repository was migrated from Hexo + hexo-theme-yun to Valaxy + valaxy-theme-yun.

## Scope

- Posts from `source/_posts` were moved to `pages/posts`.
- Non-post pages from `source/about`, `source/schedule`, `source/categories`, and `source/tags` were moved to `pages`.
- Static assets from `source/images`, `source/CNAME`, and `source/robots.txt` were moved to `public`.
- Hexo runtime files, generated `public` output, Hexo scaffolds, and Hexo theme/plugin config were moved to local `legacy-hexo/` backup and ignored by git.

## Not Migrated

- Douban-related pages, generated data, and plugin output were intentionally excluded.
- Hexo-only generators and deploy plugins were not ported.
- Old Hexo theme scripts and generated HTML were not carried into the Valaxy site.

## Follow-up

- Review post rendering for older articles with external image links.
- Recreate any previously generated plugin pages as native Valaxy pages only if they are still needed.
