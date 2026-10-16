---
cid: 31
title: 关于Mac Xcode上使用c++读取txt文件
slug: 31
date: 2018/12/15 16:34:28
updated: 2018/12/15 16:34:28
status: publish
author: harumonia
categories:
  - 源流清泉
  - Algorithm \ Data Structure
tags:
thumbStyle: default
hidden: false
---

# 路径

Product ->Scheme ->Edit Scheme->左边选择 Run 选择->选择 Option->在 Working Dictionary 选项里面，打钩 Using cusom working dictionary
这样就解决了 Xcode 读取路径的问题

# txt 文件

一般使用文本编辑创建后默认是 rtf 文件，将 rtf 文件保存为纯文本文件就可以了

## 文章声明

除特别注明外，本博客文章均为个人原创。转载、摘录、总结、改编或引用相关内容时，请注明作者及来源，并附原文链接：[https://blog.harumonia.moe/posts/2018-12-15-read-txt-file-via-cpp-on-Xcode](https://blog.harumonia.moe/posts/2018-12-15-read-txt-file-via-cpp-on-Xcode)。未经许可，不得用于商业用途或歪曲原意。
