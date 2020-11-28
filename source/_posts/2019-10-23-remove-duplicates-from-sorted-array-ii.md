---
layout: post
cid: 135
title: No. 80 删除排序数组中的重复项 II
slug: 135
date: 2019/10/23 09:51:00
updated: 2019/11/04 07:58:43
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

[No.80 删除排序数组中的重复项 II](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-array-ii/)

给定一个排序数组，你需要在原地删除重复出现的元素，使得每个元素最多出现两次，返回移除后数组的新长度。

不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。

<!-- more -->

示例  1:

给定 nums = [1,1,1,2,2,3],

函数应返回新长度 length = 5, 并且原数组的前五个元素被修改为 1, 1, 2, 2, 3 。

你不需要考虑数组中超出新长度后面的元素。
示例  2:

给定 nums = [0,0,1,1,1,1,2,3,3],

函数应返回新长度 length = 7, 并且原数组的前五个元素被修改为  0, 0, 1, 1, 2, 3, 3 。

你不需要考虑数组中超出新长度后面的元素。
说明:

为什么返回数值是整数，但输出的答案是数组呢?

请注意，输入数组是以“引用”方式传递的，这意味着在函数里修改输入数组对于调用者是可见的。

你可以想象内部操作如下:

// nums 是以“引用”方式传递的。也就是说，不对实参做任何拷贝  
int len = removeDuplicates(nums);

// 在函数里修改输入数组对于调用者是可见的。  
// 根据你的函数返回的长度, 它会打印出数组中该长度范围内的所有元素。

    for (int i = 0; i < len; i++) {
        print(nums[i]);
    }

## 结果

![截屏2019-10-23上午9.35.58.png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/3423227357.png?Expires=1602312599&)

![截屏2019-10-23上午9.35.25.png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/1180591066.png?Expires=1602312613&)

## 分析

如结果所示，本题我使用了两种解法。
解法一的重点在于对 INT_MAX 的使用，这是一个很实用的 C++内置变量。
解法二的重点在于算法思路的梳理。新的解法可以省略一次 sort 排序的时间，减少了时间消耗和内存消耗。

## 代码

解一：

```cpp
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if(nums.size() <= 2) return nums.size();
        int l = 0,r = nums.size()-1,nowl = nums[0],count = 1,res = 1;
        for(int i = 1; i <= r; i++){
            if(nums[i] != nowl){
                count = 1;
                nowl = nums[i];
                res++;
            }
            else if(nums[i] == nowl && count < 2){
                count++;
                res++;
            }else{
                nums[i] = INT_MAX;
            }
        }
        sort(nums.begin(),nums.end());

        return res;
    }
};
```

解二：

```cpp
class Solution {
public:
    int removeDuplicates(vector<int>& nums)
    {
        if (nums.size() <= 1)
            return nums.size();
        int res = 1;
        for (int i = 2; i < nums.size(); i++)
            if (nums[i] != nums[res - 1])
                nums[++res] = nums[i];
        return res + 1;
    }
};
```

## 后记

我一直以为的解脱，到头来不过是懦弱者的逃避。
