---
layout: post
cid: 141
title: No.85 最大矩形
slug: 141
date: 2019/10/25 11:01:29
updated: 2019/10/25 11:01:29
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

[No.85 最大矩形](https://leetcode-cn.com/problems/maximal-rectangle/)

难度：**困难**

给定一个仅包含 0 和 1 的二维二进制矩阵，找出只包含 1 的最大矩形，并返回其面积。

<!-- more -->

```plain_text
示例:

输入:

    [
        ["1","0","1","0","0"],
        ["1","0","1","1","1"],
        ["1","1","1","1","1"],
        ["1","0","0","1","0"]
    ]

输出: 6
```

## 结果

> 执行用时 :  
> 24 ms, 在所有 cpp 提交中击败了 85.19%的用户  
> 内存消耗 :  
> 11.9 MB, 在所有 cpp 提交中击败了 28.90%的用户

## 分析

这也是一个多解法问题，先写一篇占个坑吧。
目前的这个解法相当于是动态规划和 No.84 的缝合怪。。。

## 代码

```cpp
class Solution {
public:
    int maximalRectangle(vector<vector<char>>& matrix) {
        if(matrix.size() == 0 || matrix[0].size() == 0) return 0;
        int n = matrix.size(), m = matrix[0].size(),res=0;
        vector<vector<int> > vec(n,vector<int>(m,0));
        for(int i = 0; i < m; ++i)
            if(matrix[0][i] == '1') vec[0][i] = 1;
        for(int i = 0; i < m; ++i)
            for(int j = 1; j < n; ++j)
                if(matrix[j][i] == '1')
                    vec[j][i] = vec[j-1][i] + 1;
        for(int i = 0; i < n; ++i)
            res = max(largestRectangleArea(vec[i]),res);
        return res;

    }


    int largestRectangleArea(vector<int>& heights) {
        if(heights.size() == 0) return 0;
        int n = heights.size(),res = heights[0],record;
        stack<int> st;
        st.push(-1);
        for(int i = 0; i < n; ++i){
            while(st.top()!=-1 && heights[i] < heights[st.top()]){
                int tmp = st.top();
                st.pop();
                res = max(heights[tmp] * (i - st.top() - 1),res);
            }
            st.push(i);
        }
        while(st.top()!=-1){
            int tmp = st.top();
            st.pop();
            res = max(heights[tmp] * (n - st.top() - 1),res);
        }
        return res;
    }
};
```

## 后记

有些话，说出来就好了。
