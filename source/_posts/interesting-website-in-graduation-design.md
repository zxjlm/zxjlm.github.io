---
layout: post
title: 毕业设计过程中的一些有趣/有用的网站
date: 2021-04-13 08:19:19
updated: 2021-04-13 08:19:19
status: publish
author: harumonia
categories:
  - 见闻录
tags:
  - 毕业设计
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
---

本篇将会介绍一些笔者在完成毕设的过程中所发现的一些有趣的网站或者工具.包括:

- 代码着色网站
- 流程图\架构图等工程图片的绘图网站
- 公式识别工具
- 数据库文档
- 翻译工具
- 免费的论文查重

<!-- more -->

## 代码着色

[代码着色网站](https://highlightcode.com/)能够将代码直接转变为包含行号的高亮代码.

其最终的结果如下图所示.

![code-highlist](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/code-highlight-website.png)

## 图片绘制

图片绘制网站主要有两个, 一个是国内的 [process on](https://www.processon.com/), 另外一个是国外的[diagrams.net](https://app.diagrams.net/),也就是大家所熟悉的 _draw.io_ .

**process on** 拥有中文界面, 并且国内网络环境能够直接访问, 它所提供的大部分功能足够毕设绘图所需, 它的缺点在于, 非会员只能画 9 张图, 这在图片很多时就很难受了. 某个[憨憨](https://space.bilibili.com/167679424/)的解决方案是利用 **画布不限制大小** 的特性去按需截取.

于是这次毕设我又找了一个替代方案,就是 **draw.io**, 它的唯一缺点也许就是需要科学上网方案了. 这里来说一下它的优点吧.

- 文件可以存放于 _OneDriver_ \ _Google Driver_ 等网盘中, 还可以存放于 _GitHub_ \ _GitLab_ 这样的平台上.
- 存放于 GitHub 上面时通过版本控制方法来管理.
- 不限制画布的数量
- 多元化的绘图组件(甚至能使用 **LaTeX**)

## 公式识别

公式识别强推[mathpix](https://mathpix.com/ocr/), 它每个月有 50 次的免费使用次数, 对于毕业论文这种体量的文章还是够用了的.

对于识别的结果, 它支持 _MathML_/_AsciiMath_/_SVG_ 等多种的导出形式, 并且针对 word 文档还有 (MS Word) 专门的配置.

对于原始的图片, 它会将其上传到 cdn 上, 用户可以直接使用 cdn 连接进行图片的访问, 这一点在写算法性质的技术博客时也十分有用.

同时, 软件可以把识别的结果放到网上进行针对性搜索, 找到同样适用这个公式的网页/文章.

## 数据库文档

[数据库文档生成](https://github.com/alicfeng/mysql_markdown) 这款工具通过链接数据库然后获取数据表配置信息.

比起其它的工具, 它的优势在于能够直接在 Windows\macOS\Linux 上面运行而不需要安装对于的编译环境, 并且转换为 markdown 之后也可以进一步转为 word 等文档形式.

缺点也很明显, 那就是格式损坏, 不是标准的 word 数据库设计规范格式, 需要进行手动的调整.

另外, 它默认输出的是 名称/描述/类型/键/为空/额外/默认值 等字段属性,如果需要增加其它的属性或者删掉一些属性, 可以直接进入代码文件进行修改, 整体的代码量并不是很大.

## 摘要翻译工具

[deepl](https://www.deepl.com/translator) 在结合上下文语境的翻译上表现很棒, 应该算是我所使用过的最赞的工具了, 摘要翻译完之后基本上不需要做过多的修改. 当然, 一些领域专业名词还是要注意一下的 😁.

## 论文查重网站

[笔杆](https://www.bigan.net/)和[大雅](http://dsa.dayainfo.com/)是我目前使用的两个查重网站, 通过学校的 ip 登录之后就能获得免费的查重次数, 笔杆是每天每个微信号两次, 基本上就足够使用了, 并且导师也说笔杆的查重结果相对比较接近知网.

吐槽氵, 技术概念类的查重

## 待续
