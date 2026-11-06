# Cloudflare Pages 预览与切换清单

仓库为 `zxjlm/zxjlm.github.io`，生产分支为 `source`，自定义域名为 `blog.harumonia.moe`。Astro 构建保持根目录 `/`、命令 `pnpm run build`、输出 `dist`，运行时使用 Node `24.13.1`、pnpm `10.17.1`。预览分支为 `codex/astro-migration`。

## 本地候选门槛

- [x] 用 `astro-migration-rc1` 标记候选提交，记录受控内容 SHA、锁文件哈希和地图模式。
- [x] 使用空依赖目录和冻结锁安装，执行 `pnpm validate`、`pnpm verify:paths` 和 `pnpm verify:browser`。
- [x] 比较原始 Valaxy 基线的正文锚点、三个订阅及公开路径，汇总图像、浏览器、性能和失败回退证据。
- [x] 分别构建预览与生产，确认 robots、canonical、OG、订阅发现、sitemap、资源头与真 404。

## 真实预览

- [ ] 在 Cloudflare Pages 控制台核实项目、生产部署 ID、独立地址、Git SHA 和当前配置。确认旧部署可以恢复，记录至回滚清单。
- [ ] 为预览环境启用候选分支，使用 Node `24.13.1` 和 pnpm `10.17.1`。保留生产环境当前配置和部署。
- [ ] 推送候选分支后确认 Pages 实际检出的 SHA、冻结锁安装、构建日志、预览 deployment ID 和独立地址。
- [ ] 运行 `BASE_URL=<preview> pnpm verify:paths`、`BASE_URL=<preview> pnpm verify:hosting` 与 `BASE_URL=<preview> REAL_EXTERNAL=1 pnpm verify:browser`。检查 Cloudflare 缓存和 MIME、真实外链、字体、地图瓦片和 Worker。使用已授权样本检查视频。
- [ ] 验证预览 robots 拒绝抓取，HTML 有 noindex，canonical 指向生产。核实预览访问控制按当前项目约定工作。
- [ ] 演练恢复与再部署，并保存实际部署标识和时间。 [回滚手册](rollback-runbook.md)

## 生产与观察

- [ ] 更新 `source` 远端引用，比较发布基线后的已提交内容。切换窗口冻结发布，最终快照构建通过后才切换。未跟踪文稿留在原工作区。
- [ ] 检查 GitHub Actions、Pages 项目配置与回滚入口，把生产构建运行时调整至已验证版本。推送或合并已验证的候选树。
- [ ] 核实生产 deployment ID、Git SHA 和绑定域名。立即运行路径、浏览器、抓取及订阅检查。
- [ ] 在 24 小时和 7 天复查关键页面、可见反馈和错误记录，按手册处理阻断回归。
- [ ] 从新的内容来源演练一篇已准备文章或相册更新，核实公开页面、搜索、订阅和缓存刷新。演练素材须由作者准备。
- [ ] 观察完成后归档部署证据、旧站配置和回滚产物，关闭过渡同步入口。
