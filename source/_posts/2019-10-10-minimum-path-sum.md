---
layout: post
cid: 118
title: No.64 最小路径和:动态规划
slug: 118
date: 2019/10/10 09:31:00
updated: 2019/11/04 08:01:12
status: publish
author: harumonia
categories:
  - 源流清泉
  - leetcodeの解题日志
tags:
  - 算法
  - LeetCode
  - 动态规划
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

[No.64 最小路径和](https://leetcode-cn.com/problems/minimum-path-sum/)

给定一个包含非负整数的 m x n  网格，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。

<!-- more -->

说明：每次只能向下或者向右移动一步。

示例:

输入:

    [
      [1,3,1],
        [1,5,1],
        [4,2,1]
    ]

输出: 7

解释: 因为路径 1→3→1→1→1 的总和最小。

**偶然做到这一篇，发现这题极适合动态规划的入门。**

## 结果

![res](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/2569288342.png?Expires=1602310753&)

## 分析

![p1](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/3301511821.jpg?Expires=1602310771&)

![p2](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/455756629.jpg?Expires=1602310780&)

## 代码

```cpp
class Solution {
public:
    int minPathSum(vector<vector<int>>& grid) {
        int n = grid.size();
        int m = grid[0].size();
        if(n == 0 || m == 0)
            return 0;
        for(int i = 1; i < n; i++)
            grid[i][0] += grid[i-1][0];
        for(int i = 1; i < m; i++)
            grid[0][i] += grid[0][i-1];
        for(int i = 1;i < n; i++)
            for(int j = 1; j < m; j++)
                grid[i][j] += min(grid[i-1][j] , grid[i][j-1]);
        return grid[n-1][m-1];
    }
};
```

## 后记

慢慢来吧，饭后甜点。

![p3](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/847507095.png?Expires=1602310797&)
