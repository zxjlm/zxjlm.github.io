---
layout: post
cid: 223
title: (打卡)接雨水
slug: 223
date: 2020/04/04 10:02:00
updated: 2020/05/05 16:06:41
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
thumbDesc:
thumbSmall:
thumbStyle: default
hidden: false
---

> 难得遇到一道困难的打卡题，就在这里写一下过程吧（虽然并不是很困难。。。）

给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

![p1](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/2824310140.png?Expires=1602313299&)

上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分表示雨水）

<!-- more -->

示例:

> 输入: [0,1,0,2,1,0,1,3,2,1,2,1]
> 输出: 6

## 结果

![p2](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/1989192964.png?Expires=1602313313&)

## 解

首先想到的应该就是暴力法。不过暴力法没有多少分析的价值，所以略过不谈。

个人认为，无论何时，暴力法都应该作为一个最后的保命手段来用比较好的。如果条件允许，还是去追求一些高效率的解法，这样每日的打卡才有意义。

这里用分解子问题的思路，将这个问题进行拆分。

两根柱子之间可以存放多少水？

1. 由范围内第二高的柱子决定
2. 去掉范围内的柱子占有的空间

如此一来，子问题的条件就集齐了。同时，这个问题具有迭代性质。

思路部分到这里就结束了。

以下为代码，这里首次尝试了全迭代器的写法，感觉还不错，有复健的感觉了。

```c++
int trap(vector<int>& height) {
        int res=0;
        if(size(height) == 1 or size(height) == 0) return 0;
        auto maxPosition = max_element(height.begin(), height.end());
        auto left = maxPosition;
        auto right = max_element(maxPosition+1,height.end());
        while(left != height.begin()){
            left = max_element(height.begin(),maxPosition);
            res+= (distance(left,maxPosition)-1)**left - accumulate(left+1,maxPosition,0);
            maxPosition = left;
        }
        maxPosition = max_element(height.begin(), height.end());
        while(right != height.end()){
            res+= (distance(maxPosition,right)-1)**right - accumulate(maxPosition+1,right,0);
            maxPosition = right;
            right = max_element(maxPosition+1,height.end());
        }
        return res;
    }
```
