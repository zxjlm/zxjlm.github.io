---
layout: post
cid: 124
title: No.65 有效数字
slug: 124
date: 2019/10/12 08:55:00
updated: 2019/11/04 07:59:39
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

[No.65 有效数字](https://leetcode-cn.com/problems/valid-number/)

**难度：困难**

验证给定的字符串是否可以解释为十进制数字。

<!-- more -->

例如:

    "0" => true
    " 0.1 " => true
    "abc" => false
    "1 a" => false
    "2e10" => true
    " -90e3   " => true
    " 1e" => false
    "e3" => false
    " 6e-1" => true
    " 99e2.5 " => false
    "53.5e93" => true
    " --6 " => false
    "-+3" => false
    "95a54e53" => false

说明:  我们有意将问题陈述地比较模糊。在实现代码之前，你应当事先思考所有可能的情况。这里给出一份可能存在于有效十进制数字中的字符列表：

数字 0-9  
指数 - "e"  
正/负号 - "+"/"-"  
小数点 - "."  
当然，在输入中，这些字符的上下文也很重要。

## 结果

![res](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/387135797.png?Expires=1602310817&)

## 分析

如 tag 所标注的那样，这是一道很烦人的题目，因为有各种各样的情况需要考虑。

同样，这是一道适合心情不好的时候做的题目。他需要冷静而清晰的思路去梳理种种的情况，所以，当这道题目做完，心情也就平复了。

主要是集几种特殊情况的考虑。比如".-","-.","+e"等等。通过条件判断语句的约束，就可以解决这道问题。在官方没有给出具体的需要考虑的情况的前提下，主要还是看做题人的数学素养如何。

## 代码

```cpp
class Solution {
public:
    bool isNumber(string s) {
        s.erase(0,s.find_first_not_of(" "));
        s.erase(s.find_last_not_of(" ") + 1);

        int n = s.size();
        bool point_exist = s[0] == '.' ? false : true , e_exist = true;

        if(!(isdigit(s[0]) || (s[0] == '-' || s[0] == '+' && n > 1) || (s[0] == '.' && n >1)) || s == "+." || s == "-.")
            return false;


        for(int i = 1;i < n; i++){
            if(isdigit(s[i]))
                continue;
            else if(s[i] == 'e'  && (isdigit(s[i-1]) || (s[i-1] == '.' && isdigit(s[i-2]))) && e_exist){
                if(isdigit(s[i+1]))
                    i++;
                else if((s[i+1] == '-' || s[i+1] == '+') && i <= n-3 && isdigit(s[i+2]))
                    i+=2;
                else
                    return false;
                point_exist = false;
                e_exist = false;
            }
            else if(s[i] == '.' && point_exist)
                point_exist = false;
            else
                return false;
        }
        return true;
    }
};
```
