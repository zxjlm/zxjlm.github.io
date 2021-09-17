---
title: pdfplumber内存泄露问题解决方案(施工中)
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2021-09-14 10:47:01
updated: 2021-09-14 10:47:01
categories:
  - 源流清泉
  - Python
tags:
  - solution
customSummary:
thumb:
thumbDesc:
thumbSmall:
---

在使用 __pdfplumber__ 时会出现内存递增的情况, 最终导致内存的爆炸, 这一点在高频率地调用时尤为明显.
本篇主要解决的就是 __pdfplumber__ 这个依赖包所导致的内存泄露问题.

<!-- more -->

## TL;DR

解决方案在官方的issue中有提到, [Memory issues on very large PDFs](https://github.com/jsvine/pdfplumber/issues/193) 和 [Alto uso de memória/memory leak](https://github.com/CodeForManaus/vacina-manaus-backend/issues/70), 添加如下的代码即可.

```python
with pdfplumber.open("data/my.pdf") as pdf:
    for page in pdf.pages:
        run_my_code()
        page.flush_cache()
```

另外, 在Stack Overflow的一篇中有提到, 使用 `del pdf` 来手动清理pdf的残留.

结合以上两种方法, 在实际使用中确实解决了内存不断增加的问题.

## Why

现在知道了如何解决这个问题, 但是这个问题又是如何产生的呢? 这是本篇真正需要探索的.

__施工中__