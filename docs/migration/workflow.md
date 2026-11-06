# 阶段 1 · 工程与同步约定

过渡期继续在 Valaxy 仓库写作并提交。Astro 迁移副本以明确的 Valaxy 提交更新快照，生产切换时再将 Astro 内容目录设为唯一写作来源。

## 同步边界

在 Astro 项目根目录执行。

```sh
pnpm sync 4bf6b5fad30e78f1530cfecd7f25b62a6ff936f5
# 自定义仓库位置
BLOG_ROOT=/path/to/valaxy pnpm sync <commit>
pnpm validate
```

脚本直接读取提交树和 Git blob。同步范围是文章、关于页、公开相册数据和本地内容图片。 `validation/source-snapshot.json` 保存实际提交和文件 SHA-256；命令输出新增、修改和删除，重复运行同一提交应无文件差异。未提交的改动与工作区文稿不进入快照。独立 Git 样本已验证删除、新增、未提交改动、未跟踪稿件及重复同步，主题样式和 robots 保持原样。

同步目录中的内容以 Valaxy 为准。主题素材和 Vue 组件已导入 Astro，之后独立审阅上游差异，再手动更新适配。 `src/assets/`、`src/components/`、`src/styles/`、`vendor/`、托管规则及生成文件在同步范围之外。 [素材和许可](../../THIRD_PARTY.md)

## 正式仓库和运行环境

正式迁移分支采用原 Git 仓库中的 `codex/astro-migration`，从固定 Valaxy 提交创建独立 worktree，延续历史。当前实现和验证记录在 Astro sibling 目录，进入正式分支前按下列范围审核。

| 同步范围 | 路径 |
| --- | --- |
| Astro 源码与依赖 | `src/`、`public/`、`vendor/`、`astro.config.mjs`、`tsconfig.json`、`package.json`、`pnpm-lock.yaml`、`.node-version` |
| 维护和迁移材料 | 审核后合入 `scripts/`、`docs/migration/`、`validation/source-snapshot.json`、`README.md`、`THIRD_PARTY.md`、`MIGRATION_PLAN.md` |
| 排除 | `.git`、`node_modules/`、`dist/`、`.astro/`、`.baseline/`、`.validation/`、临时截图/日志、个人配置、未跟踪文稿及绝对路径缓存 |
| 部署配置 | 在阶段 5 单独审查 GitHub 工作流、Cloudflare 构建参数及回滚，保持 `source` 的 Valaxy 发布链路直至切换 |

Astro 7.4.4 与 Vue 集成 7.1.2 要求 Node `>=22.23.4`。Astro 采用已在本地与隔离目录验证的 Node `24.13.1` 和 pnpm `10.17.1`，后续 CI 和 Cloudflare 预览使用同一版本。站点、导航、内容归属、hero、相册和地图设置集中在 `src/site.config.ts`。

隔离验证在独立临时目录复制源码与受控快照，使用空 pnpm store 安装并执行 `pnpm validate`。类型检查、166 个 HTML 页面、155 篇正文和 Markdown 导出、两种原型订阅源、4 个相册和 88 个坐标均通过。正式分支和 Pages 环境仍需各自重跑。
