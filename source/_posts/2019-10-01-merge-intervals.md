---
layout: post
cid: 106
title: No.56 合并区间:双迭代器 && 国庆快乐
slug: 106
date: 2019/10/01 20:05:00
updated: 2019/10/13 08:51:39
status: publish
author: harumonia
categories:
  - 源流清泉
  - leetcodeの解题日志
tags:
  - 算法
  - LeetCode
  - 鲨雕青年欢乐多
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

[No.56 合并区间](https://leetcode-cn.com/problems/merge-intervals/)

**难度：中等**

给出一个区间的集合，请合并所有重叠的区间。

<!-- more -->

    示例 1:

    输入: intervals = [[1,3],[2,6],[8,10],[15,18]]
    输出: [[1,6],[8,10],[15,18]]
    解释: 区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].

    示例  2:

    输入: intervals = [[1,4],[4,5]]
    输出: [[1,5]]
    解释: 区间 [1,4] 和 [4,5] 可被视为重叠区间。

## 国庆快乐~

我有什么办法，国庆节又没人一起出去玩，只能做做题目杀杀时间这个样子。(碎碎念)

## 结果

![res](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/3185598335.png?Expires=1602302257&)

## 分析

因为实在是闲的，所以就有了这个效率奇低的代码（能这么慢也是一种本事好不好）。

那么问题来了，凭什么他的效率能这么低呢？

答案是 **使用了 erase()**

在看到这个题目的时候，我就有了使用双迭代器解决这个问题的构想。(双迭代器的解法堪称炫技,没有一定的基础不要轻易尝试。)
为什么不直接使用索引呢？因为使用索引必然会引入新的 vector 来装载。而使用双迭代器，一切都在原始的 vector 上完成，这几乎完全避免了开辟新空间所造成的消耗。
理论上是这样，不过在实际使用 erase 的时候，我发现似乎每一次 erase 都会造成数组的重排。这和我想象中的似乎不太一样，但是仔细一想，确实如此，这就是 **数组** 和 **链表** 的区别所在。
于是，引出这一题最佳的解法，链表+双迭代器解法。但是由于 LeetCode 给出的本身就是 vector，所以使用链表还是需要额外开辟空间，这岂不是与初衷背道而驰了（%>\_<%）。

所以就这样咯，下面的代码看个乐呵就行了，可以作为链表法的结构模板。

## 代码

```cpp
vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if(intervals.size() == 0) return intervals;

        sort(intervals.begin(),intervals.end(),cmp1);

        auto j = intervals.begin();
        auto i = j++;

        while(j!=intervals.end()){
            if((*i)[1] < (*j)[0]){
                i++;
                j++;
            }else{
                if((*i)[1]<(*j)[1]) (*i)[1] = (*j)[1];
                intervals.erase(j);
            }
        }
        return intervals;
    }
```

## 后记

- 烟花也没看成，国庆的安排了很多，结果又是窝在工作室敲代码= =
- 唉
- 《攀登者》体验一般般，不过吴京和章子怡的感情戏看得快哭了。。。完美戳中我的痛点。。。
- 胡歌天下第一！！！
