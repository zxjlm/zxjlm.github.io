---
layout: post
cid: 129
title: No.71 简化路径:shashasha
slug: 129
date: 2019/10/14 20:17:00
updated: 2019/11/04 07:57:11
status: publish
author: harumonia
categories:
  - 源流清泉
  - leetcodeの解题日志
tags:
  - 算法
  - 字符串
  - LeetCode
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

[No.71 简化路径](https://leetcode-cn.com/problems/simplify-path/)

以 Unix 风格给出一个文件的绝对路径，你需要简化它。或者换句话说，将其转换为规范路径。

在 Unix 风格的文件系统中，一个点（.）表示当前目录本身；此外，两个点 （..）  表示将目录切换到上一级（指向父目录）；两者都可以是复杂相对路径的组成部分。更多信息请参阅：Linux / Unix 中的绝对路径 vs 相对路径

请注意，返回的规范路径必须始终以斜杠 / 开头，并且两个目录名之间必须只有一个斜杠 /。最后一个目录名（如果存在）不能以 / 结尾。此外，规范路径必须是表示绝对路径的最短字符串。

<!-- more -->

示例 1：

输入："/home/"  
输出："/home"  
解释：注意，最后一个目录名后面没有斜杠。

示例 2：

输入："/../"  
输出："/"  
解释：从根目录向上一级是不可行的，因为根是你可以到达的最高级。

示例 3：

输入："/home//foo/"  
输出："/home/foo"  
解释：在规范路径中，多个连续斜杠需要用一个斜杠替换。

示例 4：

输入："/a/./b/../../c/"  
输出："/c"

示例 5：

输入："/a/../../b/../c//.//"  
输出："/c"

示例 6：

输入："/a//b////c/d//././/.."  
输出："/a/b/c"

## 前言

放在诸多的字符串题目中，这一题可以说平平无奇。
不过在优化答案的过程中，有了一些很有意思的感想，所以就把它单独列为一篇 blog 吧。

** 我们应该俯视问题，而不是仰视问题。同样推广到人生之中也是在这样，眼界决定境界，布局决定结局。 by. 日常犯二的 zxj **

## 结果

![res](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/3050857160.png?Expires=1602312305&)

## 分析

经典的栈使用法。
关键是思路要正确。
如果选择每次校验是"." 还是".."还是"///",那么恭喜你，掉进坑里了。
所以，我选择每次去找两个"/"之间的字符串，注意，是所有字符串，然后对比已知的特殊情况".."和"."。
实际上这是非常巧妙的一种方法，这里建议自己先做一遍在看下面的代码。

## 代码

```cpp
class Solution {
public:
    string simplifyPath(string path) {
        stack<string> st;
        string res = "";
        int n = path.size();

        while(path[--n] == '/')
            continue;
        path = path.substr(0,n+1) +"/";

        for(int i = 0; i <= n; i++){
            if(path[i] == '/'){
                while(i <= n && path[i] == '/') i++;
                int left = i;
                while(i <= n && path[i] != '/') i++;

                string tmp = path.substr(left,i-left);
                if(tmp == "..") {
                    if(!st.empty())
                        st.pop();
                }
                else if(tmp == ".") tmp = "wakaka,woshicaidan";
                else st.push(tmp);
                i--;
            }
        }

        while(!st.empty()){
            res = "/" + st.top() + res;
            st.pop();
        }
        if(res == "") return "/";
        return res;
    }
};
```

## 后记

- 很麻烦的一道题目，从结果的那种图片可以看出，我做了几次优化，最后时间从击败 44%升到 91% ，很有成就感。
