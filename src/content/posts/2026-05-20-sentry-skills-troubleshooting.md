---
title: 用 Sentry Skills 完成一次线上错误排查
date: 2026-05-20 17:00:00
updated: 2026-05-20 17:00:00
status: publish
author: harumonia
categories:
  - 源流清泉
tags:
  - Sentry
  - GlitchTip
  - Skills
  - Observability
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
---

后端服务接入 Sentry 或 GlitchTip 后，线上错误通常并不缺数据，真正缺的是一条稳定的排查路径：如何从 issue 进入，拿到事件详情、请求上下文、breadcrumbs 和异常栈，再回到代码里验证根因。

这次实验的重点不是 Grafana。关键证据全部来自 Sentry Skills 对 GlitchTip 事件的读取，因此这里记录一套通过 Sentry Skills 独立完成错误排查的方法。Grafana MCP 的使用可以参考 [用 Grafana MCP 排查 Redis 配置问题与迭代监控](/posts/grafana-mcp-usage/)。

<!-- more -->

## 案例背景

这次要分析的是生产环境中的一个 GlitchTip issue：

```text
NoSuchKey: The specified key does not exist.
```

错误发生在一个内容抽取接口中：

```text
POST /api/content/field_extract
```

issue 在几分钟内出现了多次。页面上第一眼能看到的信息很有限：异常类型是对象存储 SDK 的 `NoSuchKey`，报错函数指向 `oss_download`。

如果只看标题，很容易把它判断成“对象被删了”或“上传链路失败”。但这类结论太粗，无法指导修复。我们真正需要知道的是：

- 请求传入的到底是什么 URL 或对象 key。
- 代码为什么会把它当成对象存储文件下载。
- 这是正常业务对象缺失，还是输入校验放得太宽。
- 应该在调用对象存储前拦截，还是只处理 SDK 抛出的异常。

## 使用 Sentry Skills 的排查流程

### 1. 先确保能拿到 issue 信息

Sentry Skills 的第一条原则是：如果取不到 issue 信息，就不要继续猜。

实际操作时，先从项目环境变量中读取 GlitchTip 或 Sentry 配置：

```text
SENTRY_BASE_URL
SENTRY_ORG
SENTRY_PROJECT
SENTRY_AUTH_TOKEN
```

这里展示的只有变量名，token、组织名、项目名和内部域名都不应写入排查记录。

然后通过 skill 内置脚本验证项目是否存在，再读取 issue detail 和 event detail。这样可以避免两个常见问题：

- 查错项目，比如 API 和异步任务使用了不同 project。
- 使用了 Sentry upstream 的 API 路径，但 GlitchTip 实际需要兼容路径。

这一步可以拿到：

- issue id、short id、标题、状态和出现次数。
- 出错接口和环境标签。
- 事件 id 和接收时间。
- 异常类型、文件名和函数名。

### 2. 展开 event entries，而不是只看 issue 标题

issue 标题只能说明发生了什么异常，不能说明为什么发生。真正有价值的是 event entries 里的三类信息：

- exception stacktrace：异常从哪个业务函数一路抛出。
- breadcrumbs：异常前发生过哪些日志、HTTP、Redis 或 SQL 操作。
- request：请求方法、路径、请求体和必要的 header。

这次事件里，breadcrumbs 直接给出了关键线索：

```text
do_field_extract: html=, url=uploads_prod/<date>/, raw_url=<redacted>
oss get_object start: bucket=<bucket> key=uploads_prod/<date>/
HTTP GET OSS object -> 404 Not Found
```

同一个 issue 的其他事件里，还能看到类似输入：

```text
url=uploads_prod/../
```

这说明问题不是一个正常文件偶然不存在，而是接口允许客户端传入目录路径或异常对象路径，然后后端直接拿它访问对象存储。

### 3. 用 breadcrumbs 串起请求到异常的最短路径

这次排查中，最短路径非常清楚：

```text
/api/content/field_extract
  -> do_field_extract(req)
  -> req.url.startswith("uploads")
  -> resolve_file_url(req.url)
  -> oss_download(oss_url)
  -> bucket.get_object(key)
  -> OSS NoSuchKey
```

这一步排除了几个容易误判的方向：

- 不是模型抽取字段失败。
- 不是 HTML 转 Markdown 失败。
- 不是图片解析失败。
- 不是 quota 或 Redis 锁问题。
- 也不是对象存储鉴权失败。

错误发生在真正进入字段抽取前，属于内容准备阶段的输入校验问题。

### 4. 回到代码验证根因

对应代码有两个关键点。第一处根据 `uploads` 前缀决定是否访问对象存储：

```python
if req.url.startswith("uploads"):
    oss_url = resolve_file_url(req.url)
    raw_bytes = await oss_download(oss_url)
else:
    raw_bytes = await file_download(req.url, required=True)
```

第二处负责把相对路径转换成对象存储 URL：

```python
if candidate.startswith("/uploads"):
    return f"https://<bucket-host>{candidate}"
elif candidate.startswith("uploads"):
    return f"https://<bucket-host>/{candidate}"
```

问题就在这里：代码只校验了 `uploads` 前缀，却没有校验它是不是一个合法、具体的文件对象。于是下面这些输入都会被放行：

```text
uploads_prod/<date>/
uploads_prod/../
```

它们满足前缀条件，但并不代表一个可下载文件。

## 排查结论

最终结论是：内容抽取接口对对象 key 的校验过宽。客户端传入了目录路径或异常路径，后端仅凭 `uploads` 前缀判断为对象存储文件，并调用 `oss_download()`。对象存储返回 `NoSuchKey` 后，该 SDK 异常没有被转换成业务错误，于是被 GlitchTip 记录为未处理异常。

这个问题的本质不是“对象存储中缺少某个应该存在的文件”，而是“接口输入没有在访问对象存储前被收紧”。

## 解决方案

### 1. 收紧对象 key 校验

在 `resolve_file_url()` 中增加更严格的规则：

- 只允许指定上传目录下的相对对象路径。
- 拒绝 `..` 路径穿越。
- 拒绝以 `/` 结尾的目录路径。
- 拒绝空 basename。
- 根据业务需要，要求 basename 带允许的扩展名，例如 `.html`、`.pdf` 或 `.docx`。

这样非法输入会在访问对象存储前直接返回 400，并带上统一错误码：

```text
URL_VALIDATION_FAILED
```

### 2. 转换对象存储 SDK 异常

即使前置校验增强了，仍然应该在 `oss_download()` 中捕获 SDK 的典型异常，例如 `NoSuchKey`，并转换成业务异常：

```text
NoSuchKey -> 400 File does not exist / URL_VALIDATION_FAILED
```

这样调用方能拿到可理解的错误，Sentry 或 GlitchTip 也不会把用户输入导致的 404 当成未处理服务端异常。

### 3. 为异常输入补测试

至少补下面几类测试：

```text
uploads_prod/<date>/        -> 400，不调用 oss_download
uploads_prod/../            -> 400，不调用 oss_download
uploads_prod/<date>/a.html  -> 正常进入 oss_download
OSS NoSuchKey               -> 转换为业务异常
```

测试重点不是覆盖模型或 schema，而是覆盖 serializer 层的业务分支，因为这里正是决策发生的位置。

## Sentry Skills 的使用经验

### 不要只读 issue，要读 event

issue detail 通常只够定位异常类型。真正能分析根因的是 event detail，尤其是 entries 里的 stacktrace、breadcrumbs 和 request。

### breadcrumbs 往往比 stacktrace 更接近业务事实

stacktrace 告诉我们异常在哪里爆炸，breadcrumbs 告诉我们爆炸前发生了什么。这次就是 breadcrumbs 里的请求体和 `oss get_object start` 日志直接揭示了异常 key。

### 同一个 issue 要看多条事件

单条事件可能只是一个样本。多看几条同 issue events，可以判断这是偶发文件缺失，还是一类异常输入在反复触发。这里多条事件都指向异常对象 key，因此根因更可信。

### 敏感信息要在结论里主动收口

Sentry 或 GlitchTip 事件可能包含用户标识、IP、header、临时凭证、请求参数、HTML 或 Markdown 大字段。分析时可以读取，但输出时只应保留诊断必要的信息，避免暴露：

- 用户标识和 IP 地址。
- Sentry token 和内部域名。
- 对象存储临时凭证。
- 完整请求 header。
- 大段原始 HTML、文件内容或 payload。

## 一个可复用的提示词

以后遇到线上错误，可以直接这样唤起：

```text
请使用 Sentry / GlitchTip skill 分析这个 issue 的原因，并给出解决方案。

要求：
1. 如果无法获取 issue 信息，直接终止并报错，不要猜。
2. 先读取 issue detail，再读取 event detail 和同 issue 的其他 events。
3. 重点分析 exception entries、breadcrumbs、request body、tags 和 runtime context。
4. 回到代码中验证根因。
5. 最终输出根因、证据链、修复方案和测试建议。
6. 不要输出 token、IP、用户标识、临时凭证或大段原始 payload。
```

## 经验总结

这次实验说明，在已经接入 Sentry 或 GlitchTip 的项目里，Sentry Skills 可以独立完成一次相当完整的错误排查闭环：

1. 从 issue 页面进入，确认异常类型和影响范围。
2. 展开 event，提取请求上下文、breadcrumbs 和异常栈。
3. 用多条事件验证问题模式。
4. 回到代码确认真实决策点。
5. 给出可以落地的修复方案和测试边界。

Grafana MCP 更适合跨服务日志链路、监控指标和 dashboard 迭代；Sentry Skills 更适合从单个异常事件切入，快速拿到“一次请求为什么失败”的现场证据。两者可以互补，但这次案例里，Sentry Skills 已经足够完成定位。
