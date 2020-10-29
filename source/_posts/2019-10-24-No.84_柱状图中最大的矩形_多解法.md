---
layout: post
cid: 139
title: No.84 柱状图中最大的矩形:多解法
slug: 139
date: 2019/10/24 20:34:00
updated: 2019/11/04 08:03:46
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

[No.84 柱状图中最大的矩形](https://leetcode-cn.com/problems/largest-rectangle-in-histogram/)

**难度：困难**

给定 n 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1 。

求在该柱状图中，能够勾勒出来的矩形的最大面积。

![p1](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2018/10/12/histogram.png)

以上是柱状图的示例，其中每个柱子的宽度为 1，给定的高度为  [2,1,5,6,2,3]。

![p2](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2018/10/12/histogram_area.png)

图中阴影部分为所能勾勒出的最大矩形面积，其面积为  10  个单位。

<!-- more -->

## 结果

法一:

![截屏2019-10-24下午8.23.47.png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/1045205236.png?Expires=1602312740&)

法二:

![截屏2019-10-24下午8.29.24.png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/230613868.png?Expires=1602312752&)

## 思路

![84.png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/2144508509.png?Expires=1602312838&)

## 代码

解法一：

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size(),res = 0;
        for(int i = 0; i < n; ++i){
            int left = i,right = i;
            while(left >= 0 && heights[left] >= heights[i]) left--;
            while(right < n && heights[right] >= heights[i]) right++;
            res = (right - left - 1) * heights[i] > res ? (right - left - 1) * heights[i] : res;
        }
        return res;
    }
};
```

解法二：

```cpp
class Solution {
public:
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

She was still too young to know that life never gives anything for nothing， and that a price is always exacted for what fate bestows。
