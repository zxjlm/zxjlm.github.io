---
title: 从 GitHub Pages 到 Cloudflare Pages：一次静态博客部署迁移
date: 2026-06-28 11:11:41
updated: 2026-06-28 11:11:41
status: publish
author: harumonia
categories:
  - 源流清泉
tags:
  - Cloudflare
  - Cloudflare Pages
  - Valaxy
  - GitHub Pages
  - ai-assisted
customSummary: 记录一次将 Valaxy 静态博客从 GitHub Pages 迁移到 Cloudflare Pages 的过程，包括仓库配置、Pages Git 集成、DNS 切换、缓存头、图片优化计划，以及迁移过程中遇到的实际问题。
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
---

这次把博客的部署链路从 GitHub Pages 迁到了 Cloudflare Pages。

说是从 GitHub 迁移到 Cloudflare，其实更准确的说法是：GitHub 继续作为代码仓库和触发源，真正负责构建、发布、域名接入、缓存和 TLS 的部分交给 Cloudflare Pages。这样一来，GitHub 不再承担静态站点托管的职责，而是回到它更擅长的位置：保存源码、记录变更、触发部署。

这篇记录一下迁移的背景、具体改动、部署时踩到的坑，以及迁移之后能得到什么好处。

<!-- more -->

## 为什么要迁

这个博客经历过几轮变化：早期是 Hexo，后来迁到 Valaxy，再从 `valaxy-theme-yun` 换到了现在的 `valaxy-theme-zaxon`。内容已经很稳定，部署形态也很简单，本质上就是一个纯静态站点：

```bash
pnpm run build
```

构建完成后得到 `dist/`，把它丢到静态托管平台即可。

如果只是“能访问”，GitHub Pages 已经足够。但随着站点继续维护，会有几个更实际的问题冒出来。

一方面，域名、DNS、TLS、缓存最好能放在同一个地方管理。之前域名解析、静态托管、自定义域名绑定是分散的，遇到问题时需要在几个平台之间来回确认。Cloudflare 本来就在负责 DNS，把 Pages 也放进来之后，域名、证书、CDN、缓存规则就归到了一条链路里。

另一方面，博客里的历史图片来源比较复杂。仓库内的图片并不大，`public/images` 只有 1.3 MB 左右；真正麻烦的是旧文章里的外链图片，分散在 OSS、GitHub raw、jsDelivr、i.loli.net、旧域名等来源。迁移到 Cloudflare Pages 不能一步解决所有历史图片问题，但至少可以先把本站资源吃到 Cloudflare 的缓存策略，后面再把高风险外链逐步迁到 R2 或 Cloudflare Images。

还有一个好处是部署过程更接近现在的工程习惯。Cloudflare Pages 支持 Git 集成，push 到生产分支后自动构建，也能保留 preview deployment。对于静态博客来说，这比自己写 Worker、Wrangler 脚本或者维护额外 CI 流水线更轻。

## 先确认项目形态

迁移前最重要的一步不是去 Cloudflare 点按钮，而是先确认项目到底需要什么。

这个项目是 Valaxy 静态博客，构建输出目录是 `dist/`，生产分支是 `source`。因此第一阶段不需要 Worker，不需要 KV，不需要 R2 绑定，也不需要 Wrangler 部署脚本。Pages Git 集成已经足够。

最终确定的 Pages 配置如下：

```text
Production branch: source
Build command: pnpm run build
Build output directory: dist
Root directory: /
NODE_VERSION=22.16.0
PNPM_VERSION=10.17.1
Custom domain: blog.harumonia.moe
```

这里有一个差点误判的点：旧文档里还写着主题是本地 link 的 `../haru-theme/theme`，但实际 `package.json` 和 lockfile 里已经变成了 npm 包 `valaxy-theme-zaxon@0.1.2`。这对云端构建很关键。如果还是本地 link，Cloudflare 构建环境看不到本机旁边的 sibling 目录，部署一定会失败。确认实际依赖之后，这个风险就不存在了。

Node 版本也需要单独固定。当前 Valaxy 依赖要求较新的 Node，所以仓库里新增了 `.node-version`：

```text
22.16.0
```

同时在 Cloudflare Pages 里设置：

```text
NODE_VERSION=22.16.0
PNPM_VERSION=10.17.1
```

这一步看起来很普通，但它能避免“本地能跑，云端构建失败”的一大类问题。

## 仓库侧做了哪些改动

迁移时仓库里的改动不多，但每一项都和部署链路有关。

第一项是移除 `public/CNAME`。GitHub Pages 依赖这个文件来声明自定义域名，但迁到 Cloudflare Pages 后，自定义域名应该由 Pages Custom Domains 管理。继续保留 `CNAME` 反而会让部署职责变得混乱。

第二项是补充 `public/_headers`。Cloudflare Pages 会在构建后读取输出目录里的 `_headers`，而 Valaxy 会把 `public/` 原样复制到 `dist/`。因此缓存策略可以直接写在 `public/_headers` 里。

关键规则大致是：

```text
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=31536000, immutable

/manifest.webmanifest
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=3600

/atom.xml
  Cache-Control: public, max-age=1800

/feed.xml
  Cache-Control: public, max-age=1800

/feed.json
  Cache-Control: public, max-age=1800

/robots.txt
  Cache-Control: public, max-age=86400
```

静态构建产物里的 hashed assets 可以走一年 immutable；feed 更新频率更高，所以给 30 分钟；manifest 给 1 小时；robots 给 1 天。这个策略不复杂，但比全部交给默认缓存更可控。

第三项是更新部署文档。`README.md`、`AGENTS.md`、`CLAUDE.md` 和 `docs/cloudflare-pages.md` 都改成以 Cloudflare Pages 为主部署方式，Netlify、Vercel、Docker 则保留为 fallback 或历史方案。

第四项是整理图片治理清单。第一阶段不搬迁所有外链图片，只记录风险来源和后续顺序：

- 旧的 `http://www.harumonia.top` 和 `http://harumonia.top`，优先级最高，因为有明文 HTTP 和失效风险。
- 带 `Expires=` 参数的 OSS 图片，需要检查是否仍然可用。
- `raw.githubusercontent.com` 和 jsDelivr 可以先保留，但它们不受本站缓存策略控制。
- `i.loli.net`、`tva1.sinaimg.cn` 等第三方图床需要抽样检查。

这个决策比较务实。历史文章图片很多，如果一次性迁完，很容易变成一个没有边界的清理工程。先把站点迁好，再分批治理图片，更适合个人博客。

## Cloudflare 侧的配置

Cloudflare 侧先创建 Pages 项目，项目名用了 `zxjlm-github-io`，对应仓库 `zxjlm/zxjlm.github.io`。Pages 项目名不能带点号，所以没有直接照搬仓库名。

理论上，创建 Pages 项目后连接 GitHub 仓库，选择生产分支 `source`，填入构建命令和输出目录，就可以等第一次部署。

实际过程没有这么顺。

一开始 Git 集成创建失败，Cloudflare API 返回的是：

```text
8000011: There is an internal issue with your Cloudflare Pages Git installation
```

这个错误不是项目配置导致的。即使用 GitHub numeric repo ID 和 owner ID 重试，返回仍然一样。最后需要到 Cloudflare Dashboard 里重新修复 Pages 的 GitHub integration，并授权仓库。

这也是迁移时比较值得注意的地方：如果 Pages 项目配置看起来都对，但 Git 集成报内部错误，不要一直在仓库里找问题。它可能就是 Cloudflare 账号和 GitHub App 的授权状态坏了。

GitHub integration 修好之后，又遇到了一次比较诡异的失败。Cloudflare 首次 deployment 实际拉取的是 `master` 上的一个 ad-hoc commit，里面没有 `package.json`，所以 `pnpm install` 直接报：

```text
ERR_PNPM_NO_PKG_MANIFEST
```

项目本身的生产分支配置是 `source`，仓库默认分支也对，但这次 deployment 的元数据里显示触发分支是 `master`。处理方式是手动从 `source` 分支触发一次新的 Pages deployment。新的 deployment 绑定到正确 commit 后，构建和部署都成功了。

这一步完成后，才切正式域名。

## DNS 不要急着切

迁移静态站点时，最容易犯的错是太早切 DNS。

这次在 Pages 项目还没有成功 deployment 前，没有把 `blog.harumonia.moe` 的 CNAME 从旧的 `zxjlm.github.io` 切走。这样即使 Cloudflare Pages 项目还在失败状态，线上访问也不会受到影响。

等 `source` 分支的 deployment 成功后，先验证 Pages deployment URL：

- 首页能打开。
- `/archives/`、`/categories/`、`/tags/` 正常。
- `/atom.xml` 正常。
- `_headers` 里的缓存规则能生效。

确认这些都没问题，再把 `blog.harumonia.moe` 的 CNAME 指向：

```text
zxjlm-github-io.pages.dev
```

之后 Cloudflare Pages Custom Domain 状态从 pending 收敛到 active，正式域名也开始由 Pages 服务。

## 上线后补掉的小缺口

部署成功后又做了一轮正式域名抽检，发现 `/manifest.webmanifest` 返回 404。这个文件不影响主站访问，但既然 `_headers` 里已经写了 manifest 的缓存规则，生产环境就不应该缺它。

于是补了一个最小可用的 `public/manifest.webmanifest`：

```json
{
  "name": "Zaxon",
  "short_name": "Zaxon",
  "description": "Find the key of soul",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#d15b7c",
  "icons": [
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

同时修了 `site.config.ts` 里的 favicon 路径。之前它指向 `/yun.svg`，但当前仓库里实际存在的是 `/favicon.svg`。

补完后再次 push，Cloudflare Pages 通过 `github:push` 自动触发新的生产部署，新的部署成功后，`/manifest.webmanifest` 和 `/favicon.svg` 都能正常返回，并且缓存头也符合预期。

## 迁移后的收益

这次迁移最直接的收益，是部署职责变清楚了。

GitHub 负责源码，Cloudflare 负责发布。自定义域名、DNS、TLS、CDN、缓存头都在 Cloudflare 一侧收敛，排查时不用再跨多个平台拼链路。

第二个收益是缓存策略可控。以前静态资源能不能被长期缓存、feed 多久刷新，很容易依赖平台默认行为。迁到 Pages 后，`public/_headers` 进入仓库，缓存策略就变成了版本化配置。哪怕以后换机器、换账号、重新部署，也能从仓库里恢复同样的行为。

第三个收益是图片优化有了落点。第一阶段只是让 `/assets/*`、`/images/*`、favicon、PWA 图标这些本站资源走长期缓存。如果 Cloudflare 套餐支持 Polish，还可以进一步开启无损压缩和 WebP。历史外链图片则可以在第二阶段按优先级迁到 R2 或 Cloudflare Images，而不是继续散落在各种第三方图床里。

第四个收益是构建环境更明确。`.node-version`、`NODE_VERSION`、`PNPM_VERSION`、生产分支、构建命令、输出目录都写清楚之后，部署失败时更容易判断问题属于依赖、构建、分支，还是平台授权。

这次迁移也提醒我，个人博客这种项目不一定需要复杂的基础设施。它是静态站点，就让静态托管平台做静态托管；它需要图片治理，就先从缓存和清单开始；它需要可靠发布，就把构建和域名绑定放在同一条可验证的链路里。

## 如果再做一次

如果要复刻这次迁移，我会按下面的顺序来：

1. 先本地确认 `pnpm install --frozen-lockfile` 和 `pnpm run build` 能跑通。
2. 固定 Node 和 pnpm 版本，避免云端构建环境漂移。
3. 确认主题、插件、图片等依赖没有本地 link 或只存在于个人机器上的路径。
4. 新增 `_headers`，把静态资源、feed、manifest、robots 的缓存策略写进仓库。
5. 删除 GitHub Pages 专用的 `CNAME`，让 Cloudflare Pages 管理自定义域名。
6. 在 Cloudflare Pages 创建 Git 集成项目，生产分支选择 `source`。
7. 等 Pages deployment URL 验证通过后，再切正式域名 DNS。
8. 切完后用正式域名抽检首页、集合页、feed、manifest、favicon 和静态资源缓存头。
9. 最后再处理历史外链图片，不要把图片大迁移和部署迁移绑在同一天完成。

现在 `blog.harumonia.moe` 已经跑在 Cloudflare Pages 上。迁移本身不算复杂，但里面有几个容易被忽略的细节：GitHub App 授权状态、生产分支、构建环境版本、DNS 切换时机、manifest 和 favicon 这种小资源。把这些都补齐之后，整个博客的发布链路就清爽了很多。
