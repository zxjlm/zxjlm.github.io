# 正文、订阅与地址对照

原始 Valaxy 基线为 `4bf6b5fad30e78f1530cfecd7f25b62a6ff936f5`。Astro 保留 155 份已跟踪文章和 155 个 Markdown 导出，另有 4 个相册和 111 个分类/标签详情。来源快照以 Git blob 的 SHA-256 核对，未跟踪的鸬鸟游记留在旧项目。

- YAML 加载测试覆盖历史日期、显式时区、空更新时间、重复文件 ID 和错误 frontmatter。独立工作树加入一篇测试草稿后构建，验证页面、原文、首页、栏目、搜索、三种订阅和 sitemap 的发布集合。
- Valaxy 与 Astro 的 155 篇文章标题 ID 序列完全相同。KaTeX 在构建期渲染内联公式、块公式和 math 围栏，旧代码语言别名归一化。旧 Markdown 中两张 Mermaid 图按需渲染，失败时保留原始图源。
- 原 `atom.xml`、`feed.xml`、`feed.json` 各 155 条逐条相同，包含标题、ID/GUID、链接、发布时间、更新时间和摘要 HTML。订阅顶层构建时间改用最新条目的发布时间，以便稳定重建。两个旧游记的 frontmatter 摘要仍用于页面，订阅保持旧正文截取规则。
- 历史正文中的 10 个同域旧路径由 301 连接到现有文章。4 个手写锚点通过补充 ID 恢复。正文源文件和原有标题 ID 保持不变。
- 本地核对已覆盖原公开页面、文件、栏目/详情尾斜线、`.html`、大小写、编码和负向 404。Cloudflare 路由和响应头以实际预览复核。

```sh
VERIFY_SNAPSHOT=1 pnpm validate
python3 scripts/compare-valaxy.py /path/to/valaxy/dist dist
pnpm preview
pnpm verify:paths
```

分类、标签、搜索和阅读交互结果见 [基础页面验证](collections-search.md)。
