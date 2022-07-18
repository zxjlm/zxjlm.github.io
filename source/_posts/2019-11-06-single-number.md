---
layout: post
cid: 157
title: 136-137 出现的数字问题:位运算
slug: 157
date: 2019/11/06 14:22:00
updated: 2019/11/06 17:12:26
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

[No. 136 出现的数字问题(简单)](https://leetcode-cn.com/problems/single-number/)

给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。

说明：
你的算法应该具有线性时间复杂度。 你可以不使用额外空间来实现吗？

[No. 137 出现的数字问题 II(中等)](https://leetcode-cn.com/problems/single-number-ii/)

给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现了三次。找出那个只出现了一次的元素。

<!-- more -->

## 分析

![p1](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/3372957076.png?Expires=1602313168&)

![p2](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/576730388.png?Expires=1602313184&)

![p3](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/259591578.png?Expires=1602313198&)

## 代码和结果

### 136 方法 2

> 执行用时 :
> 12 ms, 在所有 cpp 提交中击败了 95.53%的用户
> 内存消耗 :
> 9.7 MB, 在所有 cpp 提交中击败了 49.44%的用户

```c++
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int res = 0;
        for(auto i:nums)
            res ^= i;
        return res;
    }
};
```

### 137 方法 2-1

> 执行用时 :
> 12 ms, 在所有 cpp 提交中击败了 82.45%的用户
> 内存消耗 :
> 9.8 MB, 在所有 cpp 提交中击败了 11.11%的用户

```c++
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int a = 0, b = 0;
        for (auto x : nums) {
            b = (b ^ x) & ~a;
            a = (a ^ x) & ~b;
        }
        return b;
    }
};
```

### 137 方法 2-2

> 执行用时 :12 ms, 在所有 cpp 提交中击败了 82.45%的用户
> 内存消耗 :9.6 MB, 在所有 cpp 提交中击败了 60.86%的用户

```c++
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int s[32] = {0},i,j;

        for(i = 0; i < nums.size(); i++)
            for (j = 0; j < 32; j++) {
                s[j] += (((unsigned int)nums[i])>>j) % 2;
                if(s[j] == 3)
                    s[j] = 0;
            }

        int res = s[0];
        unsigned int tag = 1;

        for(j = 0; j < 32; j++)
            if(s[j])
                res |= tag<<j;

        return res;
    }
};
```

## 后记

梦到了老年的 zxj。
在一个本应该光怪陆离的世界里，他这样就坐在门前的台阶上，捧着一盏白雾蒸腾的茶，在不知道是夕阳还是朝阳的辉光里，眺望。
没有什么鸟语花香，也没有什么秋风萧瑟。渐渐地，一切的背景都在淡化，最终归于虚无。
甚至有一瞬间，
我感觉，
不是我梦到了他，
而是，
他在追忆我。
