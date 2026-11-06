# Zaxon 博客

Astro 生成静态内容，Vue 承载地图、灯箱和主题交互。主题素材与字体许可见 [THIRD_PARTY.md](THIRD_PARTY.md)。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm validate
pnpm preview
```

Node `24.13.1`，pnpm `10.17.1`。本地预览地址为 <http://127.0.0.1:4860/>。运行浏览器检查前安装 Chromium，启动本地预览后运行验证。

```sh
pnpm exec playwright install chromium
pnpm verify:paths
pnpm verify:browser
```

## 写作与资源

`pnpm new <slug> [title]` 在 `src/content/posts/` 建立日期前缀的草稿。准备发布时将 `draft` 设为 `false` 或移除该字段，保留已有文章文件名。修改相册时使用 [Argus 导入步骤](docs/migration/argus-albums.md)。静态地图与动态地图使用同一份游记坐标，见 [地图说明](docs/migration/travel-maps.md)。

构建同时生成 `/atom.xml`、`/feed.xml`、`/feed.json`、搜索索引、站点地图和原文下载。

## 托管与迁移

Cloudflare Pages 的 Git 集成构建 `source`，命令 `pnpm run build`、产物 `dist`。预览禁止抓取，生产构建使用 Pages 的 `CF_PAGES_BRANCH=source` 识别环境。本地可用 `SITE_ENV=production pnpm build` 检查正式构建的 robots 和元数据。

- [部署切换清单](docs/migration/cutover-checklist.md)
- [回滚手册](docs/migration/rollback-runbook.md)
- [迁移计划和状态](MIGRATION_PLAN.md)
- [Valaxy 基线](docs/migration/baseline.md)
