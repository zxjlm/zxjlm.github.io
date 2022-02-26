---
layout: post
cid: 132
title: No.72 编辑距离:动态规划
slug: 132
date: 2019/10/17 20:37:00
updated: 2019/11/04 07:56:30
status: publish
author: harumonia
categories:
  - 源流清泉
  - leetcodeの解题日志
tags:
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

[No.72 编辑距离](https://leetcode-cn.com/problems/edit-distance/)

难度：**困难**

给你两个单词 word1 和 word2，请你计算出将 word1 转换成 word2 所使用的最少操作数 。

你可以对一个单词进行如下三种操作：

插入一个字符  
删除一个字符  
替换一个字符

<!-- more -->

示例 1：

输入：word1 = "horse", word2 = "ros"  
输出：3  
解释：

    horse -> rorse (将 'h' 替换为 'r')
    rorse -> rose (删除 'r')
    rose -> ros (删除 'e')

示例 2：

输入：word1 = "intention", word2 = "execution"  
输出：5  
解释：

    intention -> inention (删除 't')
    inention -> enention (将 'i' 替换为 'e')
    enention -> exention (将 'n' 替换为 'x')
    exention -> exection (将 'n' 替换为 'c')
    exection -> execution (插入 'u')

## 结果

![p1](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/1349495973.png?Expires=1602312517&)

## 思路

![72.md.png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/1028368401.png?Expires=1602312573&)
