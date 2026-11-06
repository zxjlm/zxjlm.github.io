# Cloudflare 线上验收

## 预览

- 项目 `zxjlm-github-io`，预览分支 `codex/astro-migration`。候选 `320d576aa204cdf4fe690b471242b3833c706ddf`，deployment `cbbaa746-398b-45b4-af4d-77ceb04441e8`。 [预览](https://cbbaa746.zxjlm-github-io.pages.dev/)
- 首轮预览因 Pages 预览环境显式指定 Node 22.16.0 构建失败。用户授权后，仅将预览改为 Node 24.13.1，继续使用 pnpm 10.17.1。RC2 的日志记录冻结锁解析和 Pages 部署成功。旧生产 SHA 和设置在验收期保持原值。 [候选 CI](https://github.com/zxjlm/zxjlm.github.io/actions/runs/42228738808)
- 全量检查 788 项，448 项单次永久跳转。大小写、中文、空格、`.html`、尾斜线、原文 MIME、三个订阅 MIME 和真 404 均通过。预览 robots 拒绝抓取、HTML noindex、生产 canonical、版本资源 immutable 和稳定数据重新验证策略通过。
- 浏览器检查通过主题、导航、正文、标题直链、代码复制、Mermaid、搜索、灯箱键盘和京都/大阪真实 OpenFreeMap 样式与 Worker。字体响应为 `font/woff2`。
- 图床 HEAD 核验 32 个缩略图、32 个预览图和 8 个 hero 资源均为 200。缩略图全部约 0.96 MiB，预览图全部约 113.5 MiB。手机 hero 低清 14.9–30.6 KiB，高清 706.6–818.5 KiB，按主题及视口只加载对应图。用户 Chrome 会话确认地平线相册的 8 张图真实解码，灯箱原图解码至 2560px。工具网络的自动化浏览器对图床 GET 产生 ORB 拦截，真实 Chrome 和 HEAD 的结果分别记录。
- 视频分支用浏览器内存注入的公开测试视频验证真实预览代码的远程播放。当前四个相册没有公开 Live Photo 视频。预览以受控视频网络失败和固定图片响应验证了正确原图 URL 的回退。真实 Apple 配对的播放和失败回退已在隔离本地验证。相册和 Markdown 源文件未因此改动。
- 历史外部资源抽查 14 个 URL，两个旧 OSS 域名各有 2 个样本返回 403，另外 10 个为 200。图片地址来自同一份旧正文或旧资源，记入原有外链问题。

## 恢复演练

同一个预览别名完成 Astro → Valaxy → Astro。分支使用快进提交，两个恢复目标的 Git tree 分别与旧生产和 RC2 相同。对同一个预览别名验证框架、订阅条目和复原后的抓取及缓存。 [演练别名](https://codex-astro-rollback-rehears.zxjlm-github-io.pages.dev/)

| 步骤 | 部署 ID | Git SHA |
| --- | --- | --- |
| Astro 起始 | `f961ff27-1e07-4c10-9103-24e1302e95a5` | `320d576aa204cdf4fe690b471242b3833c706ddf` |
| Valaxy 恢复 | `5e1d1fc3-8fc3-4351-9c90-5912ac9dfa34` | `5028ff9d04af5c18e900059145ab967392d4de48` |
| Astro 恢复 | `9b0beb14-4860-4dbd-aeb9-194f91073551` | `e1d6f8fa7ceea42990da765f0383bec843b4392b` |

## 生产

切换前生产为 `4ab61b7b-6dbd-4f33-ac9d-f4614bdcd5b0`，构建命令、旧运行时和恢复步骤见 [回滚手册](rollback-runbook.md)。


- 2026-11-06 22:01:38（北京时间）完成部署。Cloudflare production ID `75207c3a-9645-4df9-98ab-ac819062c913`，`source` 指向已验证的 `320d576aa204cdf4fe690b471242b3833c706ddf`。生产 Node 24.13.1 / pnpm 10.17.1，部署记录确认绑定正式域名。 [生产独立地址](https://75207c3a.zxjlm-github-io.pages.dev/) · [正式域名](https://blog.harumonia.moe/)
- 切换前远端 `source` 与 Valaxy 基线相同，已提交内容增量为零。未跟踪鸬鸟游记留在原工作区。
- 正式独立地址通过 788 项 HTTP 检查，其中 448 项单次永久跳转。robots 允许抓取，首页无 noindex，canonical 指向正式域名，三个订阅与已验证候选文件逐字节一致。404 返回正确状态码。
- 正式域名的 Chrome 实际通过首页、普通文章、中文分类、历史标签、相册、京都与大阪实际地图与行程、404 页面和正文搜索。正文查询「雨后抵达」首项返回京都游记。正式域名已在 Chrome 核对生产 robots；命令行访问受到既有 Cloudflare 403，独立地址用于自动状态和响应头核验。

| 观察时点（北京时间） | 状态 |
| --- | --- |
| 上线即时 | 完成上述功能和内容核验 |
| 2026-11-07 22:10 | 同一会话已安排 24 小时复查 |
| 2026-11-13 22:10 | 同一会话已安排 7 天复查 |
| 正式内容写作演练 | 等待作者选择已准备内容 |

即时检查发现相册初次加载的 Vue hydration 警告。已在开发模式定位为关闭的灯箱 Teleport 初始化时机，调整为挂载后创建。预览复验通过后随维护交接上线。项目未配置 Cloudflare Pages Web Analytics，现场指标待有可用样本再评估。
