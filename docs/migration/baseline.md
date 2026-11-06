# 阶段 1 · Valaxy 发布基线

记录日期 2026-11-06（Asia/Shanghai）。

| 项目 | 记录 |
| --- | --- |
| 源码 | `source` 提交 `4bf6b5fad30e78f1530cfecd7f25b62a6ff936f5`，与本机 `origin/source` 一致 |
| 锁文件 | `pnpm-lock.yaml` SHA-256 `a0cf8e7f2a88bbffd735400fbe459071e0ec9f0e3d881c5be3b3e3e2d5cb3eb8` |
| 依赖 | Valaxy `0.28.11`，Zaxon `0.1.23`，主题发布提交 `6ea0709f7682ca42b42abb1b37aefc007caffb37` |
| 重建环境 | Node `24.13.1`、pnpm `10.17.1`、`TZ=Asia/Shanghai`。从 Git 归档和空 pnpm store 安装，执行默认 SSG 构建 |
| 内容 | 155 篇公开文章、155 个 Markdown 导出、4 个相册共 32 张照片、两篇游记共 88 个坐标 |
| SSG 输出 | 179 个 HTML 文件，对应 170 个页面路径。9 个栏目各生成两种文件形式 |
| 本地产物 | `.baseline/valaxy-4bf6b5fa.tar.gz`，包含完整 `dist/` 和三个订阅源。SHA-256 `2265490681c5b026bcab2b2cd1d8aa02f768db7e61c651b4ebebe6f355539fca`。构建日志在同目录 |
| 生产设置记录 | `source`，根目录 `/`，`pnpm run build` → `dist`，Node `22.16.0` / pnpm `10.17.1`。已通过 Cloudflare Pages API 核实 |
| Cloudflare 生产部署 | Pages 项目 `zxjlm-github-io`。生产 deployment ID `4ab61b7b-6dbd-4f33-ac9d-f4614bdcd5b0`，SHA `4bf6b5fad30e78f1530cfecd7f25b62a6ff936f5`，状态成功。自定义域名的命令行探测遇到 Cloudflare 403，独立部署 URL 可用。[旧生产部署](https://4ab61b7b.zxjlm-github-io.pages.dev/) |

原仓库的未跟踪文稿 `pages/posts/2026-07-02-luniao.md` 仍在原处，已从 Astro 受控快照移除。阶段 0 报告保留原型当时的 156 篇记录。

## 重建及回滚入口

在 Valaxy 仓库执行。使用默认输出目录，确保站点地图和订阅源写入同一产物。

```sh
commit=4bf6b5fad30e78f1530cfecd7f25b62a6ff936f5
baseline_dir=$(mktemp -d)
git archive "$commit" | tar -x -C "$baseline_dir"
(
  cd "$baseline_dir"
  pnpm install --frozen-lockfile --store-dir "$baseline_dir/store"
  TZ=Asia/Shanghai pnpm run build
)
```

回到 Astro 仓库，从原始产物重新生成 [URL 清单](url-inventory.json)。

```sh
python3 scripts/inventory-valaxy.py "$baseline_dir/dist" "$commit" docs/migration/url-inventory.json
```

生产回滚入口为 Cloudflare Pages 项目的 **Deployments → All deployments → 目标生产部署 → Rollback to this deployment**。执行记录与恢复步骤见 [回滚手册](rollback-runbook.md)。 [Cloudflare Pages 回滚文档](https://developers.cloudflare.com/pages/configuration/rollbacks/)

## URL 口径

- `pages[].path` 记录应用导航和文章链接的规范形式，`files` 记录真实落盘位置。文章与相册详情无尾斜线。栏目使用尾斜线，原产物同时有 `<section>.html` 与 `<section>/index.html`。大小写按文件名保留。
- 分类及标签首页输出 19 个分类链接和 92 个标签链接，详情均无 SSG 文件。清单同时保留 HTML `href` 和浏览器请求路径，后者编码中文与空格，并按 URL 规则将历史反斜线视为路径分隔符。原始链接中的 `#` 仍是浏览器片段分隔符。
- 旧 Hexo `slug` 是元数据。基线中未发现 slug 页面或 `_redirects`。在对应的生产独立部署做 HEAD 核验，155 条文章规范路径、9 条栏目路径、4 条相册路径及首页均为 200。文章、栏目、相册和首页的 HTML 文件路径返回 308。抽样确认文章尾斜线 308、错误大小写和不存在的路径 404。111 条分类、标签详情在旧部署全部返回 404。Astro 提供详情页并保留其入口。
- 155 条原文和 21 个公开文件均为 200。原文 MIME 为 `text/markdown`，旧 JSON Feed 为 `application/json`。从该部署下载的 Atom、RSS 和 JSON Feed 与 Astro 对照，155 条 ID/内容逐一一致。线上记录原始 JSON 见候选工作树的 `.validation/legacy-pages-online.json`。
- `/atom.xml`、`/feed.xml`、`/feed.json`、`/sitemap.xml`、`/robots.txt`、相册 JSON 和公开图片均有文件。`/assets/` 下的哈希资源和 Valaxy Fuse 数据是框架依赖，`_headers` 是部署配置。
