---
layout: post
cid: 62
title: sklearn应用性学习(1)
slug: 62
date: 2019/08/04 11:29:00
updated: 2019/08/05 18:59:15
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - sklearn
thumb:
thumbStyle: default
hidden: false
---

应用性学习置于构造性学习之后，在理解 sklearn 的构造，各种参数的理论依据的基础上，进行实践性的学习。

本篇主要针对无监督学习进行浅尝。

<!-- more -->

# 无监督学习

## 聚类

Definition:根据数据的相似性将数据分为多类的过程.

### sklearn.cluster

sklearn.cluster 模块提供的各聚类算法函数可以使用不同的数据形式作为 输入:
标准数据输入格式:[样本个数，特征个数]定义的矩阵形式。
相似性矩阵输入格式:即由[样本数目，样本数目]定义的矩阵形式，矩阵中 的每一个元素为两个样本的相似度，如 DBSCAN， AffinityPropagation(近邻传 播算法)接受这种输入。如果以余弦相似度为例，则对角线元素全为 1. 矩阵中每 个元素的取值范围为[0,1]。

## 降维

降维是指在某些限定条件下，降低随机变量个数，得到一组“不相关”主变量的过程。 降维可进一步细分为变量选择和特征提取两大方法。

# 聚类

## kMeans

k-means 算法以 k 为参数，把 n 个对象分成 k 个簇，使簇内具有较高的相似 度，而簇间的相似度较低。
其处理过程如下: 1.随机选择 k 个点作为初始的聚类中心; 2.对于剩下的点，根据其与聚类中心的距离，将其归入最近的簇 3.对每个簇，计算所有点的均值作为新的聚类中心 4.重复 2、3 直到聚类中心不再发生改变

### 实战

调用 KMeans 方法所需参数:
• **n_clusters**:用于指定聚类中心的个数
• **init**:初始聚类中心的初始化方法
• **max_iter**:最大的迭代次数
• 一般调用时只用给出 n_clusters 即可，init
默认是 k-means++，max_iter 默认是 300
其它参数:
• **data**:加载的数据
• **label**:聚类后各数据所属的标签
• **axis**: 按行求和
• **fit_predict()**:计算簇中心以及为簇分配序号

> MacOS 在执行 open 命令时,添加 _encoding='gbk'_,避免编码错误

### 扩展和改进

计算两条数据相似性时，Sklearn 的 K-Means 默认用的是欧式距离。虽然还有余弦相
似度，马氏距离等多种方法，但没有设定计算距离方法的参数。

更改 [**euclidean_distances**](https://github.com/scikit-learn/scikit-learn/blob/581b0e1d73414f47ef6cde6cd282667b7e767a36/sklearn/metrics/pairwise.py#L163) 的源码
建 议 使 用 scipy.spatial.distance.cdist 方 法

> Considering the rows of X (and Y=X) as vectors, compute the

    distance matrix between each pair of vectors.
    For efficiency reasons, the euclidean distance between a pair of row
    vector x and y is computed as::
        dist(x, y) = sqrt(dot(x, x) - 2 * dot(x, y) + dot(y, y))
    This formulation has two advantages over other ways of computing distances.
    First, it is computationally efficient when dealing with sparse data.
    Second, if one argument varies but the other remains unchanged, then
    `dot(x, x)` and/or `dot(y, y)` can be pre-computed.
    However, this is not the most precise way of doing this computation, and
    the distance matrix returned by this function may not be exactly
    symmetric as required by, e.g., ``scipy.spatial.distance`` functions.
    Read more in the:`User Guide <metrics>`.

## DBSCAN 密度聚类

DBSCAN 算法是一种基于密度的聚类算法:
• 聚类的时候不需要预先指定簇的个数
• 最终的簇的个数不定

DBSCAN 算法将数据点分为三类:
• 核心点:在半径 Eps 内含有超过 MinPts 数目的点
• 边界点:在半径 Eps 内点的数量小于 MinPts，但是落在核心点的邻域内
• 噪音点:既不是核心点也不是边界点的点

### 算法流程

1.将所有点标记为核心点、边界点或噪声点; 2.删除噪声点; 3.为距离在 Eps 之内的所有核心点之间赋予一条边; 4.每组连通的核心点形成一个簇; 5.将每个边界点指派到一个与之关联的核心点的簇中(哪一个核心点的半径范围之内)。

### 实战

DBSCAN 主要参数:
eps: 两个样本被看作邻居节点的最大距离  min_samples: 簇的样本数
metric:距离计算方式

## 降维

### pca

- 主成分分析(Principal Component Analysis，PCA)是最常用的 一种降维方法，通常用于高维数据集的探索与可视化，还可以用作数 据压缩和预处理等。

- PCA 可以把具有相关性的高维变量合成为线性无关的低维变量，称为 主成分。主成分能够尽可能保留原始数据的信息。

#### 主要参数

- n_components:指定主成分的个数，即降维后数据的维度
- svd_solver :设置特征值分解的方法，默认为‘auto’,其他可选有
  ‘full’, ‘arpack’, ‘randomized’。

### 非负矩阵分解

[原理参考](https://blog.csdn.net/acdreamers/article/details/44663421/)
非负矩阵分解(Non-negative Matrix Factorization ，NMF) 是在矩阵中所有元素均为非负数约束条件之下的矩阵分解方法。
基本思想:给定一个非负矩阵 V，NMF 能够找到一个非负矩阵 W 和一个 非负矩阵 H，使得矩阵 W 和 H 的乘积近似等于矩阵 V 中的值。

- W 矩阵:基础图像矩阵，相当于从原 矩阵 V 中抽取出来的特征
- H 矩阵:系数矩阵。
- NMF 能够广泛应用于图像分析、文本
  挖掘和语音处理等领域。

#### 主要参数

- n_components:用于指定分解后矩阵的单个维度 k;
- init:W 矩阵和 H 矩阵的初始化方式，默认为‘nndsvdar’。

## (实战)图像分割

图像分割常用方法:

1. 阈值分割:对图像灰度值进行度量，设置不同类别的阈值，达到分割的目的。
2. 边缘分割:对图像边缘进行检测，即检测图像中灰度值发生跳变的地方，则为一片
   区域的边缘。
3. 直方图法:对图像的颜色建立直方图，而直方图的波峰波谷能够表示一块区域的颜
   色值的范围，来达到分割的目的。
4. 特定理论:基于聚类分析、小波变换等理论完成图像分割。

```python
import numpy as np
import PIL.Image as image
from sklearn.cluster import KMeans

def loadData(filePath):
    f = open(filePath,'rb')
    data = []
    img = image.open(f)
    m,n = img.size
    for i in range(m):
        for j in range(n):
            x,y,z = img.getpixel((i,j))
            data.append([x/256.0,y/256.0,z/256.0])
    f.close()
    return np.mat(data),m,n

imgData,row,col = loadData('课程数据/基于聚类的整图分割/bull.jpg')
label = KMeans(n_clusters=4).fit_predict(imgData)

label = label.reshape([row,col])
pic_new = image.new("L", (row, col))
for i in range(row):
    for j in range(col):
        pic_new.putpixel((i,j), int(256/(label[i][j]+1)))
pic_new.save("result-bull-4.jpg", "JPEG")
```
