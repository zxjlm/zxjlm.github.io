---
title: alfred 工作流开发
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2022-11-15 15:12:24
updated:
categories:
tags:
customSummary:
thumb:
thumbDesc:
thumbSmall:
---


## 前言

[Alfred](https://www.alfredapp.com/alfred-5-whats-new/) 是一款 _MacOS_ 上用户基数较大的软件, 笔者主要是用它来取代原生的 _聚焦搜索_, 除此之外, 最近开始研究它的 __工作流(workflow)__ 相关的功能.

本篇就是实际展示一下如何开发一个 workflow. 使用的脚本语言是 _Python_ , 不过实际上任何脚本语言都可以完成开发工作.

<!-- more -->

## 需求

计划是开发两个搜索用的 workflow, 一个是 confluence 的, 一个是 notion 的. 这两者的搜索都是比较麻烦的, confluence 在页面上默认是内容搜索, 会比较慢, 而且它提供的查询语言实际上能够做到更多形式的搜索. notion 的搜索放在页面的左上角, 每次使用都需要大幅度地移动鼠标, 并且没有纯键盘的操作方案.

## 开发

需求并不复杂, 所以也就没有什么设计阶段了, 直接开干.

### notion search

开发主要是三步.

1. notion 接口
2. alfred 接口
3. 接口对接

__notion__ 的搜索主要是通过开发文档提供的 [search](https://developers.notion.com/reference/post-search) 接口来实现. 实际上这个接口是 __标题搜索__ 而非 __内容搜索__, 不过如果笔记的接口比较科学的话, 大多数情况下标题搜索也是足够使用的.

__alfred__ 提供了很多的 workflow 范例 (workflow -> 右侧边栏). 这里选择的是 _Script Filter_ 这个模板. 点开配置模块, __Script__ 一栏中的内容就是平时在使用的脚本命令, 形如 `/Users/.pyenv/shims/python notion.py {query}` , 其中的 `query` 将会作为参数项传递给脚本程序.

在对接的时候需要注意的就是输入内容和输出内容, workflow 脚本的输入内容就是上一段提到的 `query`, 对应的就是 `cmd+space` 之后, 在输入框中输入的内容 (不包含 `Keyword`). 输出内容则是有固定的格式, 这里使用 `dataclass` 来进行锚定.

```python
@dataclass
class AlfredItem:
    title: str = ""  # 标题, 即主要展示的内容
    subtitle: str = ""  # 副标题, 即 title 下方的补充内容
    arg: str = ""  # 传递给后续 work 的内容, 对于搜索结果而言, 就是需要浏览器打开的 url.
    icon: dict = field(default_factory=dict)  # 搜索结果的图标
    mods: dict = field(default_factory=dict)  # 搜索结果的补充修改. 使用方式可以参见 https://www.alfredforum.com/topic/9037-junction-with-modifiers/
    text: dict = field(default_factory=dict)  
```

接下来就是脚本的代码, 有了输入输出, 实际上脚本并没有什么技术难度或者亮点了, 有需要的可以阅读 [notion search](https://github.com/zxjlm/AlfredWorkflows/blob/main/notion_search.py). 可以注意一下, notion 是支持唤醒 _notion app_ 的, 将 `link` 中的 `https` 替换为 `notion` 即可.

### confluence search

confluence 的编写过程与 _notion search_ 相类似, 区别在于 confluence 支持更加多样化的搜索, 也就是 [CQL](https://developer.atlassian.com/cloud/confluence/advanced-searching-using-cql/), 对此笔者采用的方案是使用同族的多个 keyword 来触发不同的脚本逻辑.

## Reference

- [notion doc](https://developers.notion.com/reference/intro)
- [Demo workflow: Mods and filters](https://www.deanishe.net/post/2018/12/demo-workflow-mods-and-filters/)
- [confluence CQL](https://developer.atlassian.com/cloud/confluence/advanced-searching-using-cql/)
