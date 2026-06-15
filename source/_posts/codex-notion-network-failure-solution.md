---
title: Codex 调用 Notion 失败：从 wham/apps 报错定位网络链路
date: 2026-06-10 16:05:00
updated: 2026-06-15 10:30:00
status: publish
author: harumonia
categories:
  - 源流清泉
tags:
  - Codex
  - Notion
  - MCP
  - Clash
  - 网络排查
customSummary: Codex 调用 Notion 插件时出现 wham/apps 请求失败，问题未必出在 Notion。本篇记录如何区分沙箱网络、本机网络、插件通道与 Notion 查询，并给出 Clash TUN 和 fake-ip 环境下的排查顺序。
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

最近在 Codex 里调用 Notion 插件时遇到一个容易误判的问题：Notion 搜索失败，报错指向的却不是页面权限、数据库或查询语法，而是 Codex App 与插件 worker 之间的传输链路。

典型错误如下：

```text
HTTP request failed: https://chatgpt.com/backend-api/wham/apps
```

这个报错看起来像 Notion 不可用，但从失败地址判断，请求很可能还没有进入 Notion 查询逻辑，而是卡在了 Codex / ChatGPT 的插件通道上。

<!-- more -->

## 问题背景

当时的任务很简单：让 Codex 随机搜索一篇 Notion 笔记。连续尝试 3 次后，失败点都落在同一个地址：

```text
https://chatgpt.com/backend-api/wham/apps
```

这时还不能判断 Notion 连接已经损坏。更准确的描述是：Codex 启动或访问 Notion 插件时，调用 `wham/apps` 接口失败了。

因此排查目标从“为什么 Notion 没有搜到内容”变成了：

1. `chatgpt.com` 是否可达？
2. `wham/apps` 接口是否在线？
3. Codex shell、本机终端、Codex App 插件 worker 是否使用同一套网络？
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

这个结果只能说明当前 Codex shell 处在禁网或受限网络上下文中，不能说明本机网络一定不通。继续用本机终端探测同一个地址，结果返回：

```text
HTTP/2 405
allow: POST
```

这里的 `405 Method Not Allowed` 不是坏信号。因为 `curl -I` 发的是 `HEAD` 请求，而 `wham/apps` 要求的是 `POST`。它能返回 `405` 并带上 `allow: POST`，至少说明几件事：

- DNS 能解析到入口。
- TLS 握手成功。
- Cloudflare / OpenAI 网关可达。
- 失败不是纯粹的公网断连。

这一步把排查范围从“本机无法访问 ChatGPT”缩小到了 Codex App 的插件 worker、登录态或代理链路。

## 第二层判断：接口在线，但需要正确方法和登录态

继续测试 `GET /backend-api/wham/apps`，也会看到类似结果：

```text
HTTP/2 405
{"detail":"Method Not Allowed"}
```

接口存在，但不接受 GET。再用匿名 POST 测试时，接口会进入另一类结果：未携带有效会话时会返回未授权，而不是 DNS 或连接层错误。

不同响应对应不同的排查方向：

- `405 + allow: POST`：接口在线，方法不对。
- `401 Unauthorized`：接口在线，但没有有效登录态。
- `HTTP request failed` 或握手超时：继续检查插件 worker 和传输链路。
- Notion 查询结果为空：这是进入 Notion 之后的业务结果，和上面三类不是一层问题。

## 第三层判断：Clash TUN 与 fake-ip 的影响

排查过程中还看到一个现象：`chatgpt.com` 被解析到了 `198.18.0.18`。

乍看这个 IP 很奇怪，但后来确认它来自 Clash 的 TUN + fake-ip 模式。`198.18.0.18` 本身不一定是错误，它可能只是 Clash 用来接管连接的 fake-ip 地址。

浏览器、桌面客户端、WebView 和 MCP worker 的代理、Cookie、挑战页面与跳转处理方式可能不同。浏览器能访问 ChatGPT，并不能证明插件 worker 使用的链路也正常。

当时建议重点检查三处配置。

### 1. 给 OpenAI 域名加 fake-ip-filter

如果 Clash 配置启用了：

```yaml
dns:
  enhanced-mode: fake-ip
```

可以尝试给 OpenAI / ChatGPT 相关域名增加豁免，排除 fake-ip 映射对插件链路的影响：

在 `dns:` 下增加：

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

如果通用 `nameserver` 优先使用国内 DNS，再通过 fallback 补救，可以尝试让 OpenAI 相关域名直接走境外 DNS，减少解析链路反复切换：

在 `nameserver-policy` 中增加：

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

这里同时写根域和 `+.` 通配，避免只命中根域却漏掉子域。不同 Clash 或 Mihomo 客户端支持的配置格式可能不同，修改前需要对照当前客户端文档。

### 3. 显式把 OpenAI 域名钉到代理

如果规则里只是最后用：

```yaml
- GEOIP,CN,DIRECT
- MATCH,PROXY
```

理论上 OpenAI 域名最终会走 `PROXY`，但结果仍然依赖 DNS、GEOIP 和代理组当前选择。如果 `PROXY` 组被手工切成了 `DIRECT`，插件链路仍可能失败。

可以在 `GEOIP,CN,DIRECT` 之前增加：

```yaml
  - DOMAIN-SUFFIX,chatgpt.com,PROXY
  - DOMAIN-SUFFIX,openai.com,PROXY
  - DOMAIN-SUFFIX,oaistatic.com,PROXY
```

同时检查 Clash UI 里 `PROXY` 组当前是否误选成了 `DIRECT`。

## 实际恢复路径

这次没有修改代码，确认网络层可达后重试插件调用，Notion 搜索恢复正常。

排查链路可以整理成下面这个顺序：

1. 在 Codex shell 里测试，确认是否是沙箱网络不可用。
2. 在本机终端里测试 `https://chatgpt.com/backend-api/wham/apps`。
3. 如果返回 `405 Allow: POST`，说明入口在线。
4. 如果匿名 POST 返回 `401`，说明接口在线但需要有效登录态。
5. 回到 Codex 重试 Notion 插件调用。
6. 如果重试成功，前一次失败大概率来自插件启动或传输通道短暂不可用。
7. 如果持续失败，再检查 Clash 的 `fake-ip-filter`、`nameserver-policy` 和 OpenAI 代理规则。
8. 如果网络配置确认无误但仍失败，重新登录 ChatGPT / Codex，或者刷新 Notion 插件授权。

## 经验总结

遇到 Notion 插件调用失败时，可以把链路分成四层：

- Codex shell 网络：可能被沙箱禁网，`curl` 直接 DNS 失败。
- 本机终端网络：可能能访问 `chatgpt.com`，但不代表 Codex App 插件 worker 同样可用。
- ChatGPT 插件通道：报错指向 `wham/apps` 时，应先排查这一层。
- Notion 业务查询：只有插件通道成功后，才谈得上页面权限、数据库 schema、搜索结果为空等问题。

以后再遇到：

```text
HTTP request failed: https://chatgpt.com/backend-api/wham/apps
```

可以按下面的顺序处理：

- 先不要改 Notion 查询逻辑。
- 先看 `wham/apps` 是网络不可达、方法不对、未授权，还是插件 worker 临时失败。
- 对临时失败，重试 Notion MCP 调用，连续失败后再深入检查网络配置。
- 如果连续失败，把任务标记为环境阻塞，保留已生成内容和目标上下文，等连通性恢复后再继续。
- 如果本机使用 Clash TUN/fake-ip，优先检查 OpenAI 域名的 fake-ip 豁免、境外 DNS 和显式代理规则。

`curl` 只是探针，排查目标是确认哪个进程、哪套网络、哪个协议阶段或登录态在失败。
