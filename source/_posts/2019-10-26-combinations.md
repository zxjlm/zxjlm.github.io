---
layout: post
cid: 144
title: No.77 组合:回溯法
slug: 144
date: 2019/10/26 14:47:00
updated: 2019/10/26 14:50:24
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

[No.77 组合](https://leetcode-cn.com/problems/combinations/)

给定两个整数 n 和 k，返回 1 ... n 中所有可能的 k 个数的组合。

<!-- more -->

示例:

输入: n = 4, k = 2
输出:

    [
    [2,4],
    [3,4],
    [2,3],
    [1,2],
    [1,3],
    [1,4],
    ]

## 结果

> 执行用时 :636 ms, 在所有 cpp 提交中击败了 15.29%的用户
> 内存消耗 :167.7 MB, 在所有 cpp 提交中击败了 8.43%的用户

时间消耗和空间消耗有点高，不过在使用回溯法的前提下，这是最优解吧。

## 思路

![77.png](http://harumonia.top/usr/uploads/2019/10/892638645.png)

## 代码

```cpp
class Solution {
public:
    vector<vector<int>> ret;
    vector<vector<int>> combine(int n, int k) {
        backtracking(1,n,k,vector<int>());

        return ret;
    }

    void backtracking(int start,int n,int k,vector<int> tmp){
        if(tmp.size() == k){
            ret.push_back(tmp);
            return;
        }

        for (; start<=n ;start++){
            tmp.push_back(start);
            backtracking(start+1,n,k,tmp);
            tmp.pop_back();
        }
    }
};
```

## 后记

呼儿将出换美酒，与尔同销万古愁。
