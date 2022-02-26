---
layout: post
cid: 46
title: numpy个人整理(初阶)
slug: 46
date: 2019/07/19 20:35:00
updated: 2019/07/22 08:13:11
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - datasci
thumb:
thumbStyle: default
hidden: false
---

NumPy 是 Python 语言的一个扩展程序库。支持高阶大量的维度数组与矩阵运算，此外也针对数组运算提供大量的数学函数库。

<!-- more -->

# numpy

shape
size
dtype

## 使用 numpy 的其他方法来创建 array

通常，数组的元素最初是未知的，但它的大小是已知的。因此，NumPy 提供了几个函数来创建具有初始占位符内容的数组。这就减少了数组增长的必要，因为 **数组增长的操作花费很大** 。

array, zeros, zeros_like, ones, ones_like, empty, empty_like, arange, linspace, numpy.random.rand, numpy.random.randn, fromfunction, fromfile

_配合 reshape 使用_
如果在 reshape 操作中将维度指定为-1，则会自动计算其他维度

reshape and resize `s return

将不同数组堆叠在一起
vstack,hstack

### 数组打印

- 最后一个轴从左到右打印，
- 倒数第二个从上到下打印，
- 其余的也从上到下打印，每个切片与下一个用空行分开。

### 注意事项

使用多个数值参数调用 array 函数，而不是提供一个数字列表（List）作为参数。

```python
>>> a = np.array(1,2,3,4)    # WRONG
>>> a = np.array([1,2,3,4])  # RIGHT
```

### array 的常用函数

dot
unique
sum
max\min

all, any, apply_along_axis, argmax, argmin, argsort, average, bincount, ceil, clip, conj, corrcoef, cov, cross, cumprod, cumsum, diff, dot, floor, inner, inv, lexsort, max, maximum, mean, median, min, minimum, nonzero, outer, prod, re, round, sort, std, sum, trace, transpose, var, vdot, vectorize, where

### I/O

np.save('one_array',x)
np.load('one_array.npz')

np.savez('two_array',a=x,b=y)
c = np.load('two_array.npz')
c['a'],c['b']

## 矩阵

### 创建矩阵

np.mat([[1,2,3],[4,5,6])
np.mat(array) # 数组转换

### 矩阵运算

满足基本的矩阵运算, _乘法运算时要注意行列约束_

## 访问

- 按位索引
- 切片访问(二维数组的切片)
  多维（Multidimensional） 数组每个轴可以有一个索引。

当提供比轴数更少的索引时，缺失的索引被认为是一个完整切片
e.g.

  b[-1]

迭代（Iterating） 多维数组是相对于第一个轴完成的

但是，如果想要对数组中的每个元素执行操作，可以使用 flat 属性，该属性是数组中所有元素的迭代器

```python
for element in b.flat:
     print(element)
```

Indexing, Indexing (reference), newaxis, ndenumerate, indices

# 形状操作

一个数组具有由每个轴上的元素数量给出的形状：

```python
>>> a = np.floor(10*np.random.random((3,4)))
>>> a
array([[ 2.,  8.,  0.,  6.],
       [ 4.,  5.,  1.,  1.],
       [ 8.,  9.,  3.,  6.]])
>>> a.shape
(3, 4)
```

对于任何输入数组，函数 row_stack 相当于 vstack。一般来说，对于具有两个以上维度的数组，hstack 沿第二轴堆叠，vstack 沿第一轴堆叠，concatenate 允许一个可选参数，给出串接应该发生的轴。

## 将一个数组分成几个较小的数组

使用 hsplit ，可以沿其水平轴拆分数组，通过指定要返回的均匀划分的数组数量，或通过指定要在其后进行划分的列：

vsplit 沿纵轴分割，并且 array_split 允许指定沿哪个轴分割。

# 深拷贝\浅拷贝

简单赋值不会创建数组对象或其数据的拷贝。

Python 将可变对象作为引用传递，所以函数调用不会复制。

不同的数组对象可以共享相同的数据。 view 方法创建一个新的数组对象，它查看相同的数据。

copy 方法生成数组及其数据的完整拷贝。

## fancy indexing

# 附录

## 数学运算 ufunc

| 方法                                            | 描述                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| add(x1, x2, /[, out, where, casting, order, …]) | 按元素添加参数。                               |
| subtract(x1, x2, /[, out, where, casting, …])   | 从元素方面减去参数。                           |
| multiply(x1, x2, /[, out, where, casting, …])   | 按元素计算多个参数。                           |
| divide(x1, x2, /[, out, where, casting, …])     | 逐个元素方式返回输入的真正除法。               |
| logaddexp(x1, x2, /[, out, where, casting, …])  | 输入的指数之和的对数。                         |
| logaddexp2(x1, x2, /[, out, where, casting, …]) | 以-2 为基的输入的指数和的对数。                |
| true_divide(x1, x2, /[, out, where, …])         | 以元素方式返回输入的真正除法。                 |
| floor_divide(x1, x2, /[, out, where, …])        | 返回小于或等于输入除法的最大整数。             |
| negative(x, /[, out, where, casting, order, …]) | 数字否定，元素方面。                           |
| positive(x, /[, out, where, casting, order, …]) | 数字正面，元素方面。                           |
| power(x1, x2, /[, out, where, casting, …])      | 第一个数组元素从第二个数组提升到幂，逐个元素。 |
| remainder(x1, x2, /[, out, where, casting, …])  | 返回除法元素的余数。                           |
| mod(x1, x2, /[, out, where, casting, order, …]) | 返回除法元素的余数。                           |
| fmod(x1, x2, /[, out, where, casting, …])       | 返回除法的元素余数。                           |
| divmod(x1, x2[, out1, out2], / [[, out, …])     | 同时返回逐元素的商和余数。                     |
| absolute(x, /[, out, where, casting, order, …]) | 逐个元素地计算绝对值。                         |
| fabs(x, /[, out, where, casting, order, …])     | 以元素方式计算绝对值。                         |
| rint(x, /[, out, where, casting, order, …])     | 将数组的元素舍入为最接近的整数。               |
| sign(x, /[, out, where, casting, order, …])     | 返回数字符号的元素指示。                       |
| heaviside(x1, x2, /[, out, where, casting, …])  | 计算 Heaviside 阶跃函数。                      |
| conj(x, /[, out, where, casting, order, …])     | 以元素方式返回复共轭。                         |
| exp(x, /[, out, where, casting, order, …])      | 计算输入数组中所有元素的指数。                 |
| exp2(x, /[, out, where, casting, order, …])     | 计算输入数组中所有 p 的 2\*\*p。               |
| log(x, /[, out, where, casting, order, …])      | 自然对数，元素方面。                           |
| log2(x, /[, out, where, casting, order, …])     | x 的基数为 2 的对数。                          |
| log10(x, /[, out, where, casting, order, …])    | 以元素方式返回输入数组的基数 10 对数。         |
| expm1(x, /[, out, where, casting, order, …])    | 计算数组中所有元素的 exp(x)-1。                |
| log1p(x, /[, out, where, casting, order, …])    | 返回一个加上输入数组的自然对数，逐个元素。     |
| sqrt(x, /[, out, where, casting, order, …])     | 以元素方式返回数组的正平方根。                 |
| square(x, /[, out, where, casting, order, …])   | 返回输入的元素方块。                           |
| cbrt(x, /[, out, where, casting, order, …])     | 以元素方式返回数组的立方根。                   |
| reciprocal(x, /[, out, where, casting, …])      | 以元素为单位返回参数的倒数。                   |
