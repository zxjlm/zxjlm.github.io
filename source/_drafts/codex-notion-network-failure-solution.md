---
title: Codex 与 Notion 网络访问失败排查记录
date: 2026-06-10 16:05:00
updated: 2026-06-10 16:05:00
status: draft
author: harumonia
categories:
  - 源流清泉
tags:
  - Codex
  - Notion
  - MCP
  - Clash
  - 网络排查
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumb:
thumbChoice: default
thumbDesc:
thumbSmall:
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
---

最近在 Codex 里调用 Notion 插件时，遇到了一类很容易误判的问题：Notion 搜索失败，报错却不是 Notion 本身的权限、页面、数据库或查询语法，而是 Codex App 与插件 worker 之间的传输链路失败。

典型错误如下：

```text
HTTP request failed: https://chatgpt.com/backend-api/wham/apps
```

这个报错看起来像是 Notion 不可用，但真正的问题发生在 Notion MCP 启动或转发阶段。也就是说，请求还没有进入 Notion 查询逻辑，就已经卡在了 Codex / ChatGPT 的插件通道上。

<!-- more -->

## 问题背景

当时的任务很简单：让 Codex 随机搜索一篇 Notion 笔记。连续尝试 3 次后，失败点都落在同一个地址：

```text
https://chatgpt.com/backend-api/wham/apps
```

这时不能直接下结论说“Notion 连接坏了”。更准确的描述是：Codex 想启动或访问 Notion 插件时，需要先经过 `wham/apps` 这个 ChatGPT 后端接口，而这个接口在当前环境里没有稳定返回。

因此排查目标从“为什么 Notion 没有搜到内容”变成了：

1. `chatgpt.com` 是否可达？
2. `wham/apps` 接口是否在线？
3. Codex shell、非沙箱 shell、Codex App 插件 worker 是否使用同一套网络？
4. 如果使用 Clash TUN / fake-ip，代理配置是否会影响 ChatGPT 插件通道？
5. 如果网络可达，是否还存在登录态或插件会话问题？

## 第一层判断：区分沙箱网络和本机网络

在 Codex 的普通 shell 里直接访问：

```bash
curl -I --max-time 10 https://chatgpt.com/backend-api/wham/apps
```

得到的是：

```text
curl: (6) Could not resolve host: chatgpt.com
```

这个结果只能说明当前 Codex shell 处在禁网或受限网络上下文中，不能说明本机网络一定不通。于是继续用非沙箱网络探测同一个地址，结果返回：

```text
HTTP/2 405
allow: POST
```

这里的 `405 Method Not Allowed` 不是坏信号。因为 `curl -I` 发的是 `HEAD` 请求，而 `wham/apps` 要求的是 `POST`。它能返回 `405` 并带上 `allow: POST`，至少说明几件事：

- DNS 能解析到入口。
- TLS 握手成功。
- Cloudflare / OpenAI 网关可达。
- 失败不是纯粹的公网断连。

这一步很关键，因为它把问题从“本机完全无法访问 ChatGPT”缩小到了“Codex App 的插件 worker、登录态或代理链路不稳定”。

## 第二层判断：接口在线，但需要正确方法和登录态

继续测试 `GET /backend-api/wham/apps`，也会看到类似结果：

```text
HTTP/2 405
{"detail":"Method Not Allowed"}
```

这说明接口存在，但是不接受 GET。再用匿名 POST 测试时，接口会进入另一类结果：未携带有效会话时会返回未授权，而不是 DNS 或连接层错误。

因此这里可以得到一个排查结论：

- `405 + allow: POST`：接口在线，方法不对。
- `401 Unauthorized`：接口在线，但没有有效登录态。
- `HTTP request failed` 或握手超时：插件 worker 启动或传输层没有稳定连上。
- Notion 查询结果为空：这是进入 Notion 之后的业务结果，和上面三类不是一层问题。

这几个状态一定要分开看，否则很容易把传输层问题误判成 Notion 权限问题。

## 第三层判断：Clash TUN 与 fake-ip 的影响

排查过程中还看到一个现象：`chatgpt.com` 被解析到了 `198.18.0.18`。

乍看这个 IP 很奇怪，但后来确认它来自 Clash 的 TUN + fake-ip 模式。也就是说，`198.18.0.18` 本身不一定是错误，它可能只是 Clash 用来接管连接的 fake-ip 地址。

真正的问题在于：浏览器通常能比较好地处理代理、Cookie、Cloudflare challenge 和跳转；但桌面客户端、WebView、MCP worker 这类进程的网络上下文不一定完全一致。对于 Codex + Notion 插件来说，TUN/fake-ip 配置会让链路更脆弱。

当时建议重点检查三处配置。

### 1. 给 OpenAI 域名加 fake-ip-filter

如果 Clash 配置里启用了：

```yaml
dns:
  enhanced-mode: fake-ip
```

但没有给 OpenAI / ChatGPT 相关域名做豁免，那么插件 worker 可能会遇到比浏览器更难处理的 fake-ip 映射、会话或挑战链路问题。

建议在 `dns:` 下增加：

```yaml
  fake-ip-filter:
    - "chatgpt.com"
    - "*.chatgpt.com"
    - "openai.com"
    - "*.openai.com"
    - "oaistatic.com"
    - "*.oaistatic.com"
    - "auth.openai.com"
```

### 2. 给 OpenAI 域名单独配置境外 DNS

如果通用 `nameserver` 优先使用国内 DNS，再通过 fallback 补救，对普通网站通常没什么问题；但对 ChatGPT / OpenAI 这类服务，最好让相关域名直接走境外 DNS，避免解析链路被污染或反复切换。

建议在 `nameserver-policy` 中增加：

```yaml
    'chatgpt.com':
      - tls://1.1.1.1:853
      - tls://8.8.8.8:853
    '+.chatgpt.com':
      - tls://1.1.1.1:853
      - tls://8.8.8.8:853
    'openai.com':
      - tls://1.1.1.1:853
      - tls://8.8.8.8:853
    '+.openai.com':
      - tls://1.1.1.1:853
      - tls://8.8.8.8:853
    'oaistatic.com':
      - tls://1.1.1.1:853
      - tls://8.8.8.8:853
    '+.oaistatic.com':
      - tls://1.1.1.1:853
      - tls://8.8.8.8:853
```

这里同时写根域和 `+.` 通配，是为了避免只命中 `chatgpt.com`，却漏掉 `auth.openai.com`、`chatgpt.com` 的子域或静态资源域名。

### 3. 显式把 OpenAI 域名钉到代理

如果规则里只是最后用：

```yaml
- GEOIP,CN,DIRECT
- MATCH,PROXY
```

理论上 OpenAI 域名最终会走 `PROXY`，但这仍然依赖 DNS、GEOIP、代理组当前选择等多个因素。如果 `PROXY` 组被手工切成了 `DIRECT`，就会出现浏览器看似还能打开，但插件链路不稳定的情况。

可以在 `GEOIP,CN,DIRECT` 之前增加：

```yaml
  - DOMAIN-SUFFIX,chatgpt.com,PROXY
  - DOMAIN-SUFFIX,openai.com,PROXY
  - DOMAIN-SUFFIX,oaistatic.com,PROXY
```

同时检查 Clash UI 里 `PROXY` 组当前是否误选成了 `DIRECT`。

## 实际恢复路径

这次最后并没有通过修改代码解决，而是通过“确认网络层可达 + 重试插件调用”恢复。

排查链路可以整理成下面这个顺序：

1. 在 Codex shell 里测试，确认是否是沙箱网络不可用。
2. 在非沙箱网络里测试 `https://chatgpt.com/backend-api/wham/apps`。
3. 如果返回 `405 Allow: POST`，说明入口在线。
4. 如果匿名 POST 返回 `401`，说明接口在线但需要有效登录态。
5. 回到 Codex 重试 Notion 插件调用。
6. 如果重试成功，说明前一次是插件启动/传输通道短暂不可用。
7. 如果持续失败，再检查 Clash 的 `fake-ip-filter`、`nameserver-policy` 和 OpenAI 代理规则。
8. 如果网络配置确认无误但仍失败，重新登录 ChatGPT / Codex，或者刷新 Notion 插件授权。

当时重新调用 Notion 搜索后，已经能够拿到页面结果，说明并不是 Notion 数据源或页面权限问题。

## 经验总结

这类问题最容易踩的坑，是把所有失败都归类成“Notion 连不上”。事实上这里至少有四层：

- Codex shell 网络：可能被沙箱禁网，`curl` 直接 DNS 失败。
- 本机终端网络：可能能访问 `chatgpt.com`，但不代表 Codex App 插件 worker 同样可用。
- ChatGPT 插件通道：`wham/apps` 负责插件启动/发现/转发，失败时还没进入 Notion。
- Notion 业务查询：只有插件通道成功后，才谈得上页面权限、数据库 schema、搜索结果为空等问题。

所以以后遇到：

```text
HTTP request failed: https://chatgpt.com/backend-api/wham/apps
```

我会按下面的规则处理：

- 先不要改 Notion 查询逻辑。
- 先看 `wham/apps` 是网络不可达、方法不对、未授权，还是插件 worker 临时失败。
- 对临时失败，重试 Notion MCP 调用，最多重试 3 次。
- 如果连续失败，把任务标记为环境阻塞，保留已生成内容和目标上下文，等连通性恢复后再继续。
- 如果本机使用 Clash TUN/fake-ip，优先检查 OpenAI 域名的 fake-ip 豁免、境外 DNS 和显式代理规则。

这个排查思路的核心不是“让 curl 成功”，而是分清楚：哪个进程、哪套网络、哪个协议阶段、哪个登录态在失败。分层之后，问题就没那么玄学了。
