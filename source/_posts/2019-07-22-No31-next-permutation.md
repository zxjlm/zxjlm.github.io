---
layout: post
cid: 47
title: No.31 下一个排列
slug: 47
date: 2019/07/22 09:10:00
updated: 2019/07/22 09:11:41
status: publish
author: harumonia
categories:
  - 源流清泉
  - leetcodeの解题日志
tags:
thumb:
thumbStyle: default
hidden: false
---

[No.31 下一个排列](https://leetcode-cn.com/problems/next-permutation/)

实现获取下一个排列的函数，算法需要将给定数字序列重新排列成字典序中下一个更大的排列。

如果不存在下一个更大的排列，则将数字重新排列成最小的排列（即升序排列）。

必须原地修改，只允许使用额外常数空间。

以下是一些例子，输入位于左侧列，其相应输出位于右侧列。

    1,2,3 → 1,3,2
    3,2,1 → 1,2,3
    1,1,5 → 1,5,1

<!-- more -->

# 题解

第一眼看到这个题目是很懵的，因为以往的全排列都是直接上全排列函数，并没有去仔细的了解过其中的一些算法机制。

于是，上[维基百科](https://zh.wikipedia.org/wiki/全排列生成算法)。

> 设 P 是集合{1，2，……n-1，n}的一个全排列：P=P1P2……Pj-1PjPj+1……Pn（1≤P1，P2，……，Pn≤n-1）
>
> 从排列的右端开始，找出第一个比右边数字小的数字的序号 j，即 j=max{i|Pi < Pi+1，i > j}
>
> 在 Pj 的右边的数字中，找出所有比 Pj 大的数字中最小的数字 Pk，即 k=min{i|Pi>Pj，i>j}
>
> 交换 Pj，Pk
>
> 再将排列右端的递减部分 Pj+1Pj+2……Pn 倒转，因为 j 右端的数字是降序，所以只需要其左边和右边的交换，直到中间，因此可以得到一个新的排列 P'=P1P2……Pj-1PkPn……Pj+2Pj+1。

以上是维基百科关于字典序法部分的算法步骤。

知道了这些之后解题就方便多了。

首先是选择遍历的顺序，根据全排列的算法机制，选择从右侧开始遍历（当然，从左侧也一样能够实现）。
然后就是按照算法步骤来完成，即可得到下一个全排列，唯一需要注意的是最后的翻转，这是很多人忘记的一步。

# 代码

```c++

class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        int size = nums.size();
        int index1 = size-2,index2 = size -1;
        while(index1>=0 && nums[index1]>=nums[index1+1])
            index1--;
        if(index1>=0){
            while(index2>=0 && nums[index2]<=nums[index1])
                index2--;
            swap(nums,index1,index2);
        }
        reserve(nums,index1+1,size-1);

    }

    void reserve(vector<int>& nums,int i,int j){
        while(i<j){
            swap(nums,i,j);
            i++;
            j--;
        }
    }

    void swap(vector<int>& nums,int index1,int index2){
        int temp = nums[index1];
        nums[index1] = nums[index2];
        nums[index2] = temp;
    }
};
```

# 执行结果

> 执行用时 :8 ms, 在所有 C++ 提交中击败了 98.48%的用户
> 内存消耗 :8.3 MB, 在所有 C++ 提交中击败了 99.55%的用户

# 总结

这一题在详细地了解了全排列的字典序法之后完全就称不上是一道*中等*题了，但是问题的关键就在很多人并不知道全排列的字典序法的实现机制。还是突出了平时积累和基础的重要性。
