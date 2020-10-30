---
layout: post
cid: 104
title: No.49 字母异位词分组:哈希表
slug: 104
date: 2019/09/30 18:32:00
updated: 2019/10/13 08:51:49
status: publish
author: harumonia
categories:
  - 源流清泉
  - leetcodeの解题日志
tags:
  - 算法
  - LeetCode
  - 哈希表
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

[No.49 字母异位词分组](https://leetcode-cn.com/problems/group-anagrams/)

**难度:中等**

给定一个字符串数组，将字母异位词组合在一起。字母异位词指字母相同，但排列不同的字符串。

<!-- more -->

示例:

输入: ["eat", "tea", "tan", "ate", "nat", "bat"]

输出:  
 [  
 ["ate","eat","tea"],  
 ["nat","tan"],  
 ["bat"]  
 ]

说明：

所有输入均为小写字母。  
不考虑答案输出的顺序。

## 结果

![p1-res](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/1697465325.png?Expires=1602302176&)

## 思路

![p1](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/1451376165.png?Expires=1602302195&)
![p2](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/2143093241.png?Expires=1602302202&)

时间复杂度为 O(n)

## 代码

```cpp
vector<vector<string>> groupAnagrams(vector<string>& strs) {
        map<string,vector<string> > ma;
        vector<vector<string>> res;
        for(auto str:strs){
            string tmp = str;
            sort(tmp.begin(),tmp.end());
            ma[tmp].push_back(str);
        }
        for(const auto& m:ma)
            res.push_back(m.second);
        return res;
    }
```

## 后续

理论上这是 c++的最少代码的实现方式吧（我所能想到的）

极简的代价是数据结构的滥用，代码量的减少并不意味着性能的飞跃，这一点从运行的结果可以看出，时间和空间的消耗都没有达到最佳的程度。

其中的取舍请自行判断。
