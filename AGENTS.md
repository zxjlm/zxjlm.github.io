# Astro 博客

## 命令

- `pnpm dev` 启动 Astro 开发服务。
- `pnpm validate` 执行单元、类型、静态构建、内容和链接验证。
- `pnpm preview` 在 4860 端口提供构建产物和真实 404。
- 在预览运行时执行 `pnpm verify:paths` 和 `pnpm verify:browser`。浏览器检查依赖 Playwright Chromium。
- `pnpm new <slug> [title]` 创建草稿。
- `pnpm travel:maps` 生成静态地图，`pnpm travel:maps:check` 检查静态模式缓存。

使用 `.node-version` 和 `package.json` 指定的 Node/pnpm 版本，冻结锁文件安装。

## 内容与路由

文章在 `src/content/posts/`，ID 取自文件相对路径，保留大小写。公开正文地址为 `/posts/<id>`，Markdown 为 `/posts/<id>.md`。日期按 Asia/Shanghai 展示，`draft: true` 从全部公开出口排除。关于页在 `src/content/about.md`。页面由 Astro 静态生成，按需交互使用 Vue。

公开相册从 `public/albums/index.json` 及其 Argus manifests 生成。通过 `node scripts/import-argus-albums.mjs <staging-site>` 导入，操作步骤见 [Argus](docs/migration/argus-albums.md)。地图配置见 `src/site.config.ts` 和 [地图说明](docs/migration/travel-maps.md)。没有地图的页面不得启动 MapLibre 或加载其 Worker。

## 发布

Cloudflare Pages 通过 Git 构建 `source` 的 `dist`。`codex/astro-migration` 用于迁移预览。环境、域名、部署状态和回滚步骤见 [切换清单](docs/migration/cutover-checklist.md) 和 [回滚手册](docs/migration/rollback-runbook.md)。
