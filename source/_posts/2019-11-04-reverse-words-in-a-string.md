---
layout: post
cid: 152
title: N0.151 翻转字符串里的单词:多解法
slug: 152
date: 2019/11/04 17:16:00
updated: 2019/11/04 18:51:57
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

[N0.151 翻转字符串里的单词](https://leetcode-cn.com/problems/reverse-words-in-a-string/)

给定一个字符串，逐个翻转字符串中的每个单词。

<!-- more -->

## 结果

> 执行用时 :  
> 执行用时 :  
> 8 ms, 在所有 cpp 提交中击败了 90.75%的用户  
> 内存消耗 :  
> 11.6 MB, 在所有 cpp 提交中击败了 30.30%的用户

## 分析

两种思路。

### 法一：标准的栈思路

这里我发现了一个很有趣的现象，就是如果使用了栈结构，然后对输出的 res 进行正向的相加，结果比不使用栈结构，对 res 进行逆向的相加，时间消耗和空间消耗都要低很多。
逆向相加省去了使用栈结构，并且理论上空间消耗只在 O(n)。
初步推测是因为逆向增加的移位字符会随着 res 的增加而迅速上升，进而拖慢了整体的进度。

以下是逆向增加的执行结果。

> 执行用时 :
> 28 ms, 在所有 cpp 提交中击败了 18.55%的用户
> 内存消耗 :
> 66.8 MB, 在所有 cpp 提交中击败了 18.94%的用户

### 法二:stringstream

stringstream 法可以用于分割被空格、制表符等符号分割的字符串。
但是由于 stringstream 的构造函数会特别消耗内存，所以最终的结果（无论是时间还是空间）十分难看。

![IMG_8CC94A1E421C-1.jpeg](http://www.harumonia.top/usr/uploads/2019/11/1846534912.jpeg)

### 法三:Python 一行解法

很鲨雕的解法。。。python 果然还是简单啊

```python
class Solution:
    def reverseWords(self, s: str) -> str:
        return ' '.join(re.split(' *',s.strip())[::-1])
```

## 代码

```c++
# 栈
class Solution {
public:
    string reverseWords(string s) {
        int len = s.size();
        s += " ";
        stack<string> ss;
        for(int i = 0; i < len; ++i){
            if(s[i] == ' ') continue;
            int left = i;
            while(s[i] != ' ') ++i;
            ss.push(s.substr(left,i-left));
        }
        string res = "";
        while(!ss.empty()){
            res += ss.top() + " ";
            ss.pop();
        }
        return res.substr(0,res.length()-1);
    }
};


# 流
class Solution {
public:
    string reverseWords(string s) {
        stringstream ss;
        string ans="",temp;
        ss<<s;
        while(ss>>temp)
            ans=" "+temp+ans;
        if(ans!="")
            ans.erase(ans.begin());
        return ans;
    }
};
```

## 后记

时隔一周，再临 LeetCode。
这一周干了一件很没有意义的事情，无论从那个方面来说都非常地没有意义。
这段经历让我更深刻地认识到一件事情，不是所有的人都值得托付信任。
