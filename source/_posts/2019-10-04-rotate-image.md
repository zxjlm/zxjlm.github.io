---
layout: post
cid: 110
title: No.48 旋转图像:数学
slug: 110
date: 2019/10/04 09:14:00
updated: 2019/10/13 08:51:15
status: publish
author: harumonia
categories:
  - 源流清泉
  - leetcodeの解题日志
tags:
  - 算法
  - LeetCode
  - 数学
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

[No.48 旋转图像](https://leetcode-cn.com/problems/rotate-image/)

给定一个 n × n 的二维矩阵表示一个图像。

将图像顺时针旋转 90 度。

<!-- more -->

说明：

你必须在原地旋转图像，这意味着你需要直接修改输入的二维矩阵。请不要使用另一个矩阵来旋转图像。

示例 1:

    给定 matrix =
    [
        [1,2,3],
        [4,5,6],
        [7,8,9]
    ],

    原地旋转输入矩阵，使其变为:
    [
        [7,4,1],
        [8,5,2],
        [9,6,3]
    ]

示例 2:

    给定 matrix =
    [
        [ 5, 1, 9,11],
        [ 2, 4, 8,10],
        [13, 3, 6, 7],
        [15,14,12,16]
    ],

    原地旋转输入矩阵，使其变为:
    [
        [15,13, 2, 5],
        [14, 3, 4, 1],
        [12, 6, 8, 9],
        [16, 7,10,11]
    ]

## 结果

![res](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/4061840715.png?Expires=1602302278&)

## 思路

这一题只要找对了思路，就非常的简单。

一开始，我是想使用洋葱循环法来实现的，不过，C++这个语言不像 python，思路越是复杂往往就意味着代码量会呈几何倍增加。

所以，毫无疑问，洋葱循环是可以实现的，但是我比较懒。

于是想换一个思路。这一题的 tag 是数学，那么，如何从数学的角度来解决这个问题呢？

学过线性代数的应该还是有些印象的，矩阵旋转 90°，可以通过转置和翻转来达成相同的目的。这样一来，代码量无疑就简化了很多了。（洋葱法我大概构想了一下，会用到一个三重的 for 循环。。。）

这也是一个很浅显的道理，**做事情不要总想着一蹴而就，换个角度，找对跳板，往往能够事半功倍** 。

## 代码

```cpp
void rotate(vector<vector<int>>& matrix) {
	int len = matrix.size();
	for(int i = 0 ; i < len ; i++){
		for(int j = 0; j < i; j++){
			swap(matrix[i][j],matrix[j][i]);
		}
	}
	for(int i = 0 ; i < len ; i++){
		reverse(matrix[i].begin(),matrix[i].end());
	}
}
```

## 后记

附上 5 月份以来的提交记录。
一天提交 12 次是真的疯狂啊。。。不知道这一次的刷题能够坚持多久呢？

![p1](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/3392892346.png?Expires=1602302292&)

![p2](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/1441194081.png?Expires=1602302327&)
