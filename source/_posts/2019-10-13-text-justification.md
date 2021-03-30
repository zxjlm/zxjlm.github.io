---
layout: post
cid: 126
title: No.68 文本左右对齐:字符串题目总结(1)
slug: 126
date: 2019/10/13 08:50:00
updated: 2019/11/04 07:59:20
status: publish
author: harumonia
categories:
  - 源流清泉
  - leetcodeの解题日志
tags:
  - 算法
  - 字符串
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

[No.68 文本左右对齐](https://leetcode-cn.com/problems/text-justification/)

**难度：困难**

给定一个单词数组和一个长度  maxWidth，重新排版单词，使其成为每行恰好有  maxWidth  个字符，且左右两端对齐的文本。

你应该使用“贪心算法”来放置给定的单词；也就是说，尽可能多地往每行中放置单词。必要时可用空格  ' '  填充，使得每行恰好有 maxWidth  个字符。

要求尽可能均匀分配单词间的空格数量。如果某一行单词间的空格不能均匀分配，则左侧放置的空格数要多于右侧的空格数。

文本的最后一行应为左对齐，且单词之间不插入额外的空格。

<!-- more -->

说明:

单词是指由非空格字符组成的字符序列。  
每个单词的长度大于 0，小于等于  maxWidth。  
输入单词数组 words  至少包含一个单词。

示例:

输入:  
words = ["This", "is", "an", "example", "of", "text", "justification."]  
maxWidth = 16  
输出:

    [
       "This    is    an",
       "example  of text",
       "justification.  "
    ]

示例  2:

输入:
words = ["What","must","be","acknowledgment","shall","be"]  
maxWidth = 16  
输出:

    [
      "What   must   be",
      "acknowledgment  ",
      "shall be        "
    ]

解释: 注意最后一行的格式应为 "shall be " 而不是 "shall be",  
  因为最后一行应为左对齐，而不是左右两端对齐。  
 第二行同样为左对齐，这是因为这行只包含一个单词。

示例  3:

输入:
words = ["Science","is","what","we","understand","well","enough","to", "explain",
  "to","a","computer.","Art","is","everything","else","we","do"]  
maxWidth = 20  
输出:

    [
      "Science  is  what we",
    "understand      well",
      "enough to explain to",
      "a  computer.  Art is",
      "everything  else  we",
      "do                  "
    ]

## 结果

![res](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/220978777.png?Expires=1602310896&)

## 分析

到现在做了很多的字符串处理的题目了。这是现有的标记为困难的字符串题，所以拿出来作为对字符串题目的一个小结。

大多数的字符串处理都是数学题，最重要的是找到对应的处理流程。

No.65 中的处理方式是 **有限状态机（DFA）** ，这一题的处理方式是 **逻辑分析** 。这些被标记为 _"困难"_ 的字符串题目，只要找到对应的处理方式，解起来就丝滑无比。

方法归总(第一阶段)：

- 双指针法。双指针法可以极大地降低搜索的时间。
- 滑块法。滑块法在对于 substr 类的字符串题目有着很高的适用性。
- 二分法。这是基础中的基础了，不做赘述。
- 有限状态机（DFA）。DFA 重在思路，实际上这么多题做下来，DFA 直接套用的也就一题= =
- 哈希表。万能的哈希表，在处理记数类型的问题时可以极大地压缩时间消耗。
- STL 库的基本应用。这是半基础吧，不熟悉也能做题目，但是很多方法直接调用库里的比手写一遍要节约很多时间。
- Algorithm \ Data Structure 库。同上。

## 代码

```cpp
class Solution {
public:
    vector<string> fullJustify(vector<string>& words, int maxWidth) {
        int n = words.size(), sum = 0, start_word = 0;
        vector<string> res;

        for(int i = 0; i < n; i++){
            sum += words[i].length();

            if(sum > maxWidth){
                int interval = i - start_word - 1;
                string tmp_s = "";
                if(i == start_word + 1)
                    res.push_back(words[i-1]+blank_generate(maxWidth-words[i-1].length()));
                else if(interval == 0){
                    for(int j = start_word; j < i; j++)
                        tmp_s += words[j] + " ";
                    res.push_back(tmp_s.substr(0,maxWidth));
                }

                else{
                    int now_sum = sum - words[i].length() - interval - 1, blank_h = (maxWidth - now_sum) % interval, blank_low = (maxWidth - now_sum) / interval;
                    for(int j = start_word; j <= blank_h + start_word; j++)
                        tmp_s += words[j] + blank_generate(blank_low + 1);
                    tmp_s = tmp_s.substr(0 , tmp_s.length() - 1);
                    for(int j = start_word+blank_h+1 ; j < i; j++)
                        tmp_s += words[j] + blank_generate(blank_low);
                    tmp_s = tmp_s.substr(0 , tmp_s.length() - blank_low);
                    res.push_back(tmp_s);
                }

                sum = -1;
                start_word = i--;
            }
            sum++;
        }

        string tmp_s = "";
        for(int i = start_word;i < n; i++)
            tmp_s += words[i] + " ";
        tmp_s += blank_generate(maxWidth - tmp_s.length());
        res.push_back(tmp_s.substr(0,maxWidth));

        return res;
    }

    string blank_generate(int x){
        string res = "";
        for(int i = 0;i < x ; i++)
            res += " ";
        return res;
    }
};
```

## 后记

“汪汪汪”。
