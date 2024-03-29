---
layout: post
cid: 94
title: No.34 在排序数组中查找元素的第一个和最后一个位置:二分法
slug: 94
date: 2019/09/26 15:23:00
updated: 2019/10/13 08:52:34
status: publish
author: harumonia
categories:
  - 源流清泉
  - leetcodeの解题日志
tags:
  - 算法
  - LeetCode
  - 二分法
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

[No.34 在排序数组中查找元素的第一个和最后一个位置](https://leetcode-cn.com/problems/find-first-and-last-position-of-element-in-sorted-array/)

给定一个按照升序排列的整数数组 nums，和一个目标值 target。找出给定目标值在数组中的开始位置和结束位置。

你的算法时间复杂度必须是 O(log n) 级别。

如果数组中不存在目标值，返回 [-1, -1]。

<!-- more -->

## 结果

![result.jpg](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/663092629.png?Expires=1602302080)

## 思路

No.34 是一个典型的二分法问题，不过在二分法的基础上做出了一个延伸。

这里有两种选择。

第一种是使用二段二分法，分别求出两点，这样的算法复杂度是常数\*log(N)

第二种，也就是我所使用的方法，是先使用二分法求出 target 所在的位置，然后再使用双指针法去锁定区间。这个方法的复杂度最差是 N+log(N)，最好可以是常数+log(N)，这一题考虑到 target 的区间以小区间为主，所以选用此方法。

个人认为，二分法是非常简单但是高效的一个方法，但是重点在于因为太容易了所以忽略一些细节方面的东西，比如+1，比如+1，比如+1。。。

## 具体代码

```c++
class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int size = nums.size(), l = 0, r = size-1;
        if(l == r && nums[0]==target){
            return vector<int>{0,0};
        }
        while(l<=r){
            int mid = (l+r)/2;
            if(nums[mid] == target){
                int left=mid,right=mid;
                while(left - 1 >= 0 && nums[left-1] == target){
                    left--;
                }
                while(right + 1 < size && nums[right+1] == target){
                    right++;
                }
                return vector<int>{left,right};
            }
            else if(nums[mid]>target){
                r = mid-1;
            }
            else{
                l = mid+1;
            }
        }
        return vector<int>{-1,-1};
    }

};
```
