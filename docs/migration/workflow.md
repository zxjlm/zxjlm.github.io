# 阶段 1 · 工程与同步约定

Astro 已成为正式写作来源。文章在 `src/content/posts/`，相册从 Argus 导入到 `public/albums/`。通过 `source` 分支发布，开发分支可走 Cloudflare 预览。

## 迁移来源记录

Valaxy 到 Astro 的过渡快照固定在旧生产提交 `4bf6b5fad30e78f1530cfecd7f25b62a6ff936f5`。迁移期的同步脚本直接读取 Git 提交树和 blob，覆盖文章、关于页、相册 JSON 和本地内容图片。已验证新增、修改、删除、重复运行和草稿排除。`validation/source-snapshot.json` 保存该次迁移的 SHA-256。同步入口随切换退役，历史实现可从 `astro-migration-rc2` 读取。

`src/assets/`、`src/components/`、`src/styles/` 和 `vendor/` 属于 Astro 独立维护范围。 [素材和许可](../../THIRD_PARTY.md)

## 正式仓库和运行环境

迁移从固定 Valaxy 提交创建 `codex/astro-migration` 工作树，保留原仓库历史。预览和回滚通过后，`source` 快进到 Astro。实施时按下列范围审核。

| 同步范围 | 路径 |
| --- | --- |
| Astro 源码与依赖 | `src/`、`public/`、`vendor/`、`astro.config.mjs`、`tsconfig.json`、`package.json`、`pnpm-lock.yaml`、`.node-version` |
| 维护和迁移材料 | 审核后合入 `scripts/`、`docs/migration/`、`validation/source-snapshot.json`、`README.md`、`THIRD_PARTY.md`、`MIGRATION_PLAN.md` |
| 排除 | `.git`、`node_modules/`、`dist/`、`.astro/`、`.baseline/`、`.validation/`、临时截图/日志、个人配置、未跟踪文稿及绝对路径缓存 |
| 部署配置 | 在阶段 5 单独审查 GitHub 工作流、Cloudflare 构建参数及回滚，生产切换由 Cloudflare Git 集成完成 |

Astro 7.4.4 与 Vue 集成 7.1.2 要求 Node `>=22.23.4`。Astro 采用已在本地与隔离目录验证的 Node `24.13.1` 和 pnpm `10.17.1`，后续 CI 和 Cloudflare 预览使用同一版本。站点、导航、内容归属、hero、相册和地图设置集中在 `src/site.config.ts`。

隔离验证在独立临时目录复制源码与受控快照，使用空 pnpm store 安装并执行 `pnpm validate`。类型检查、166 个 HTML 页面、155 篇正文和 Markdown 导出、两种原型订阅源、4 个相册和 88 个坐标均通过。正式分支和 Pages 环境仍需各自重跑。
