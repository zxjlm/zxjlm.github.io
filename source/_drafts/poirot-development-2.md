---
title: Poirot 开发记录(2) - 字体抽取和OCR的优化方案
date: 2021-08-25 21:27:55
tags:
---

承接前面两篇, [字体反爬虫解决方案](https://blog.harumonia.moe/font-antispider-cracker/) 和 [进度条方案](https://blog.harumonia.moe/poirot-development-progressbar/), 本篇是对旧版本的 Poirot 部分内容的性能优化.

主要优化内容为:

- 使用 `Pillow` 从字体文件中抽取出字形图片
- 使用 `Tesseract` 进行 OCR 识别

<!-- more -->
