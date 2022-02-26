---
layout: post
cid: 82
title: Introduction to data mining(1)
slug: 82
date: 2019/08/17 09:14:20
updated: 2019/08/17 09:14:20
status: publish
author: harumonia
categories:
  - 源流清泉
  - Data Mining
tags:
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

本篇是笔者在学习 "Introduction to data mining"(《数据挖掘导论》)的英文最新版所记录的一些学习笔记。

2020.10.10 更新

很可惜的是，在多次迁移的过程中，本章的图片都丢失了。

食之无味，弃之可惜。所以暂且先保留在这里，以后再补全吧。

<!-- more -->

# 绪论

## 什么是数据挖掘

数据挖掘是在大型数据库中，自动发现有用信息的过程。

> Data mining is the processof automatically discoveringuseful information in large data repositories.

### 数据挖掘与知识发现

[![image.md.png](http://www.harumonia.top/images/2019/08/17/image.md.png)](http://www.harumonia.top/image/JVRe)

## 数据挖掘要解决的问题

- 可伸缩
- 高维性
- 异种数据和复杂数据
- 数据的所有权与分布
- 非传统的分析

## 数据挖掘的任务

- 预测变量
  > The objective of thesetasks is to predict the value of a par- ticular attribute basedon the valuesof other attributes. The attribute to be predicted is commonly known as the target or dependent vari- able, while the attributes used for making the prediction are known as the explanatory or independent variables.
- 描述任务
  > Here, the objective is to derive patterns (correlations, trends, clusters, trajectories, and anomalies) that summarize the un- derlying relationships in data. Descriptive data mining tasks are often exploratory in nature and frequently require postprocessingtechniques to validate and explain the results

### 四大任务

#### 预测建模

- 分类：用于预测 **离散** 的目标变量 (二值型)
- 回归：…… **连续** ……

_应用_ ：可以用来确定顾客对产品促销的反应、预测地球生态系统的扰动、根据检查结果判断病人是否具有某种疾病
_典型案例_ ：预测花的类型

#### 关系分析

用来发现描述数据中强关联特征的模式
_应用_ : 找出具有相关功能的基因组、识别用户一起访问的 Web 页面、理解地球气候系统不同元素之间的联系
_典型案例_ : 购物篮分析(牛奶——尿布)

#### 聚类分析

发现紧密相关的 **观测值组群** ，使得与属于不同簇的观测值相比,属于同一簇的观测值尽可能地相似.

_应用_ : 对相关的客户分组 , 找出显著影响地球气候的海洋区域以及压缩数据等
_典型案例_ : 文档聚类(词之间的相似性)

#### 异常检测

识别特征显著不同于其他数据的观测值,这样的值称为 **异常点** 或 **离群点** .
好的异常检测器必然具有高检测率和低误报率.

_应用_ : 检测欺诈\网络攻击\疾病的不寻常模式\生态系统扰动
_典型案例_ :信用卡欺诈检测

# 数据

## 数据类型

数据对象 : 记录\点\向量\模式\事件\案例\样本\观测或实体

### 属性

四种属性类型:标称 序数 区间 比率
[![image04e5c16df6c5ea4b.md.png](http://www.harumonia.top/images/2019/08/17/image04e5c16df6c5ea4b.md.png)](http://www.harumonia.top/image/N7Zp)
标称和序数统称 **分类的** (categorical) 或 **定性的** (qualitative) 属性.顾名思义,定性属性(如雇员 ID)不具有数的大部分性质,应当像对待符号一样对待他们.其余两种属性,即区间和比率,统称 **定量的** (quantitative) 或 **数值的** (numeric) 属性,用数表示,并且具有数的大部分性质.

                            定义属性层次的变换

[![image1f4bfe8f69e2395b.md.png](http://www.harumonia.top/images/2019/08/17/image1f4bfe8f69e2395b.md.png)](http://www.harumonia.top/image/NNYg)

### 数据集的类型

- 记录数据
- 基于图形的数据
- 有序的数据

#### 数据集的一般特性

- 维度
  对象具有的属性的数目.分析高维数据有时会陷入 **维灾难(curse of dimensionality)** 所以要先预处理.
- 稀疏性
- 分辨率

#### 记录数据

- 事物数据或购物篮数据
- 数据矩阵
- 稀疏数据矩阵

[![image59be1d41fb6ceff6.md.png](http://www.harumonia.top/images/2019/08/17/image59be1d41fb6ceff6.md.png)](http://www.harumonia.top/image/Nqn6)

#### 基于图形的数据

这里考虑两种特殊情况:图形捕获数据对象之间的联系\数据对象本身用图形表示

#### 有序数据

属性具有涉及时间或空间序的联系

- 时序数据
- 序列数据
- 时间序列数据
- 空间数据

#### 处理非记录数据

## 数据质量

(1)数据质量问题的检测和纠正
(2)使用可以容忍低质量数据的算法

### 测量和数据收集问题

- 噪声
- 伪象
- 偏倚
- 精度
- 准确率

#### 测量误差和数据收集错误 Measurement and Data Collection Errors

通过人工干预来纠正(比如在数据录入的时候)

#### 噪声和伪象 Noise and Artifacts

噪声 Noise : 通常用于包含时间或空间分量的数据，这种情况下，通常可以使用信号或图像处理技术来降低噪声
伪象 Artifacts : 确定性失真

    鲁棒算法：
        在噪声干扰下也能产生可以接受的结果。

#### 精度\偏倚和准确率 Precision, Bias, and Accuracy

精度 Precision : (同一个量的)重复测量值之间的接近程度
偏倚 Bias : 测量值与被测量值之间的系统的变差
准确率 Accuracy :被测量的测量值与实际值之间的接近度

    准确度依赖于精度和偏倚

异常值 Outliers

#### 离群点 Outliers

与典型值不同的值，即“异常”
区别噪声和离群点

#### 遗漏值 Missing Values

条件选择型填空常见
处理方法：

- 删除数据对象或属性
- 估计遗漏值 平滑——连续
- 在分析时忽略遗漏值

#### 不一致的值 Inconsistent Values

错误的值、不在允许范围内的值

#### 重复数据 Duplicate Data

### 关于应用的问题

理想情况下,数据集附有描述数据的文档

## 数据预处理 Data Preprocessing

分为两大类:选择分析所需要的数据对象和属性 以及 创建/改变属性.

> 根据习惯,使用特征(feature)或变量(variable)指代属性

### 聚集 Aggregation

将两个或多个对象合并成单个对象

 **定量** 属性(如价格)通常通过求和或求平均值进行聚集
 **定性** 属性(如商品)可以忽略或汇总成在一个商店销售的所有商品的集合

聚集的动机有多种:
首先,数据归约导致的较小数据集需要较少的内存和处理时间,因此,可以使用开销更大的数据挖掘算法.
其次,通过高层而不是低层数据视图,聚集起到了范围或标度转换的作用.
最后,对象或属性群的行为通常比单对象或属性的行为更稳定.

> 聚集的缺点可能是丢失有趣的细节(如极值)

### 抽样 Sampling Approaches

抽样是一种选择数据对象子集进行分析的常用方法.
在统计学中,抽样长期用于数据的事先调查和最终的数据分析.

**有效抽样的** 原理:
如果样本是有代表性的,则使用样本与使用整个数据集的效果几乎一样.
而样本是有代表性的,前提是它近似地具有与原数据集相同的(感兴趣的)性质

#### 抽样方法 Sampling Approaches

- 简单随机抽样

  - 无放回抽样
  - 有放回抽样

- 分层抽样

#### 渐进抽样

从一个小样本开始,增加样本容量直到得到足够容量的样本.

### 维归约 Dimensionality Reduction

好处:

- 如果维度较低,许多数据挖掘的算法的效果会更好.
- 可以使模型更容易理解
- 可以更容易让数据可视化
- 降低了数据挖掘算法的时间和内存需求

> 通过选择旧属性的子集得到新属性,这种归约称为 **特征子集选择** 或 **特征选择**

#### 维灾难 The Curse of Dimensionality

维灾难:随着数据维度的增加,许多数据分析变得非常困难.特别是随着维度增加,数据在它所占据的空间中越来越稀疏.

结果是对于高维数据,许多分类和聚类算法(以及其他数据分析算法)都麻烦缠身--分类准确率低,聚类质量下降

#### 维归约的线性代数技术 Linear Algebra Techniques for Dimensionality Reduction

将数据从高维 **投影** 到低维空间,特别是对于 **连续** 数据

- 主成分分析 Principal Components Analysis (PCA)
  用于连续属性的线性代数技术,她找出新的属性(主成分),这些属性数原属性的线性组合,是相互 **正交的 (orthogonal)**,并且捕获了数据的最大变差.
- 奇异值分解 Singular Value Decomposition (SVD)

### 特征子集选择 Feature Subset Selection

降低维度的另一种方法是只是用特征的一个子集

**Redundant features** (冗余特征) duplicate much or all of the information contained in one or more other attributes.

**Irrelevant features** (不相干特征) Oontain almost no useful information for the data mining task at hand.

冗余和不相干特征可能降低分类的准确率,影响所发现的聚类的质量.

特征选择的理想方法:将所有可能的特征子集作为感兴趣的数据挖掘算法的输入,然后选择产生最好结果的子集.

三种标准的特征选择方法:嵌入,过滤,包装

- 嵌入方法 Embedded approaches
  作为数据挖掘算法的一部分
- 过滤方法 Filter approaches
  使用某种独立于数据挖掘的方法
- 包装方法 Wrapper approaches
  这些方法将目标数据挖掘算法作为黑盒,使用类似与前面介绍的理想算法

#### 特征子集选择体系结构

子集评估度量,控制新的特征子集产生的搜索策略,停止搜索判断,验证过程

[![imagea43b43449d9493db.md.png](http://www.harumonia.top/images/2019/08/17/imagea43b43449d9493db.md.png)](http://www.harumonia.top/image/NsSt)

#### 特征加权 Feature Weighting

### 特征创建 Feature Creation

#### 特征提取 Feature Extraction

最常使用的特征提取都是高度针对具体领域的
一旦数据挖掘用于一个新的领域,一个关键任务就是开发新的特征和特征提取方法

#### 映射到新的空间 Mapping the Data to a New Space

使用一种完全不同的视角挖掘数据可能揭示出重要和有趣的特征.

傅里叶变换 Fourier transform

> 对于时间序列和其他类型的数据,**小波变换 wavelet transform** 也非常有用

#### 特征构造 Feature Construction

一个或多个由元特征构造的新特征可能比原特征更有用

### 离散化和二元化 Discretization and Binarization

#### 二元化

如果有 m 个分类值,则将每个原始值唯一的赋予区间[0,m-1]中的一个整数.

这样的变换可能导致复杂化,如无意之中建立了转换后的属性之间的联系.

关联分析需要非对称的二元属性,其中只有属性的出现(值为 1)才是重要的.

对于关联问题,可能需要用两个非对称的二元属性替换单个二元属性.

#### 连续属性离散化

两个子任务:决定需多少个分类值,以及确定如何将连续属性值映射到这些分类值.

离散化问题就是决定选择多少个分割点和确定分割点位置的问题.

##### 非监督离散化 unSupervised Discretization

聚类?

##### 监督离散化 Supervised Discretization

基于统计学的方法用每个属性值来分区间,并通过过类似于根据统计检验得出的相邻区间来创建较大的区间.

基于熵的方法是最有前途的离散化方法之一.
[![imageb9a8cc3bce2b2a12.md.png](http://www.harumonia.top/images/2019/08/17/imageb9a8cc3bce2b2a12.md.png)](http://www.harumonia.top/image/NHsI)

[![image418cf8e9aaebd1f7.md.png](http://www.harumonia.top/images/2019/08/17/image418cf8e9aaebd1f7.md.png)](http://www.harumonia.top/image/NfMY)

#### 具有过多值的分类属性

### 变量变换 Variable Tlansformation

指用于变量的所有值的变换

简单函数变换和规范化

#### 简单函数 Simple Functions

> A variable transformation refers to a transformation that is applied to all thevaluesofavariable.

在统计学中,变量变换常用来将不具有高斯分布的数据变换成具有高斯分布的数据.
在数据挖掘中,可以用来压缩值域

#### 规范化和标准化 Normalization or Standardization

使整个值得集合具有特定的性质

## 相似性和相异性的度量 Measures of Similarity and Dissimilarity

许多情况下,一旦计算出相似性或相异性就不再需要原始数据了.

使用属于 **邻近度 proximity** 来表示相似性或相异性

### 基础 Basics

#### 定义 Definitions

> the similarity between two objects is a numerical measure of the degreeto which the two objects are alike.
> The dissimilarity betweentwo objects is a numerical measureof the de- gree to which the two objects are different.

通常术语"距离"用作相异度的同义词.
有时相异度在[0,1]中取值,但是相异度在 0 和 ♾ 之间取值也很常见.

#### 变换

通常使用变换将相似度从相异转为相反.

#### 简单属性之间的相似度和相异度

[![imagee59e593bbcfd3120.md.png](http://www.harumonia.top/images/2019/08/17/imagee59e593bbcfd3120.md.png)](http://www.harumonia.top/image/NlDw)

#### 数据对象之间的相异度 Dissimilarities between Data Objects

- 距离
  **欧几里得距离** Euclidean distance
  [![image09c78ec0185a1ef1.png](http://www.harumonia.top/images/2019/08/17/image09c78ec0185a1ef1.png)](http://www.harumonia.top/image/NrLi)
  其中,n 是维数,而 **x** k 和 **y** k 分别是 x 和 y 的第 k 个属性值(分量)

**闵可夫斯基距离** Minkowski distance
[![image4bfd8ac1d8b3156f.png](http://www.harumonia.top/images/2019/08/17/image4bfd8ac1d8b3156f.png)](http://www.harumonia.top/image/NzaH)

- r=1,城市街区(也称曼哈顿,出租车,L1 范数)距离
- r=2,欧几里得距离
- r=♾,上确界距离

度量与非度量

#### 数据对象之间的相似度 Similarities between Data Objects

#### 邻近性度量的例子 Examples of Proximity Measures

##### 二元数据的相似性度量

- 简单匹配系数 simple matching coefficient (SMC)
  [![imagec78fb1c028be231c.png](http://www.harumonia.top/images/2019/08/17/imagec78fb1c028be231c.png)](http://www.harumonia.top/image/N2RF)

SMC 可以在一个仅包含是非题的测验中来发现回答问题相似的学生

- Jaccard 系数 Jaccard Coefficient
  [![image709b0bba0e810a01.png](http://www.harumonia.top/images/2019/08/17/image709b0bba0e810a01.png)](http://www.harumonia.top/image/N4tT)
  常常用来处理非对称的二元属性对象

##### 余弦相似度 Cosine Similarity

常用来度量文档相似度
![imagee4c8afe3e4e60ecf.png](http://www.harumonia.top/images/2019/08/17/imagee4c8afe3e4e60ecf.png)
[![image950d41dec2581905.png](http://www.harumonia.top/images/2019/08/17/image950d41dec2581905.png)](http://www.harumonia.top/image/NGnU)

##### 广义 Jaccard 系数 Extended Jaccard Coefficient (Tanimoto Coefficient)

[![image8002f990119f2a64.png](http://www.harumonia.top/images/2019/08/17/image8002f990119f2a64.png)](http://www.harumonia.top/image/Nacx)

##### 相关性 Correlation

皮尔森相关 Pearson's correlation
判定是否存在线性关系

[![imagefa2b122d3c3982db.png](http://www.harumonia.top/images/2019/08/17/imagefa2b122d3c3982db.png)](http://www.harumonia.top/image/NhsL)

Bregman 散度
Bregman 散度是损失或失真函数.损失函数的目的是度量用 x 近似 y 导致的失真或损失.
x 和 y 越类似,失真或损失就越小,因而 Bregman 散度可以用作相异性函数

#### 邻近度计算问题

1. 当属性具有不同的尺度(scale)或相关时如何处理
2. 当对象包含不同类型的属性(例如,定量属性和定性属性)是如何计算对象之间的邻近度
3. 当属性具有不同的权重(即并非所有的属性都对对象的邻近度具有相等的贡献)时,如何处理邻近度计算

##### 距离度量的标准化和相关性

# wander season

## kaggle

- The number of columns in the DataFrame is not equal to the number of features. One of the columns - 'party' is the target variable.
