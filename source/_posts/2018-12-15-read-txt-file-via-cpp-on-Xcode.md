---
layout: post
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
thumb:
thumbStyle: default
hidden: false
---

# 路径

Product ->Scheme ->Edit Scheme->左边选择 Run 选择->选择 Option->在 Working Dictionary 选项里面，打钩 Using cusom working dictionary
这样就解决了 Xcode 读取路径的问题

# txt 文件

一般使用文本编辑创建后默认是 rtf 文件，将 rtf 文件保存为纯文本文件就可以了
