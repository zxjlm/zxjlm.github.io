---
layout: post
cid: 60
title: sklearn构造性学习(1)
slug: 60
date: 2019/08/02 08:41:00
updated: 2019/08/05 18:59:29
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

构造性学习中，以理论为主，并结合一定的例子

本篇是机器学习的入门篇，主体的脉络差不多近似于 《数据挖掘导论》 一书

<!-- more -->

# K 近邻算法

[主要函数说明](https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsClassifier.html#sklearn.neighbors.KNeighborsClassifier)
k 近邻算法是非常特殊的,可以认为是没有模型,或者说训练集本身就是模型
寻找 k 个近邻,来判断 x 点
主要解决分类问题

## 计算距离

### 欧拉距离

$$
\sqrt{\sum_{i=1}^{n}\left(X_{i}^{(a)}-X_{i}^{(b)}\right)^{2}}
$$

### 曼哈顿距离

![p1](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/4253159243.png?Expires=1602314295)
绿线:欧拉距离

### 总结:闵可夫斯基距离

$$
\left(\sum_{i=1}^{n}\left|X_{i}^{(a)}-X_{i}^{(b)}\right|^{p}\right)^{\frac{1}{p}}
$$

## 准确度

```python
from sklearn.metrics import accuracy_score

accuracy_score(y_test,y_predict)

# 或者直接从训练结果中导出准确度
knn_clf.score(X_test)

```

## 超参数

超参数:在算法运行前需要决定的参数
模型参数:算法过程中学习的参数

KNN 算法没有模型参数
kNN 算法中的 k 是典型的超参数

如何寻找好的超参数:

    领域知识
    经验数值
    实验搜索

> 除了 k 之外还有一个重要的超参数

**k 与各个投票点的距离**
好处:
使得模型更加科学
解决了平票的情况

使用方法:加入 **weights** 参数

由上述的闵可夫斯基距离,得到又一个超参数 **p**,用来判断使用的距离公式

## 技术实现

使用 np.sum 对 np 进行求和
使用列表推导式进行列表的遍历
使用 collection 的 Counter 的 Counter 类来计算"投票"的结果

## 数据归一化

作用:将所有的数据都映射到同一个尺度中
**最值归一化**:将所有的数据都映射到 0-1 之间
适用于分布有明显边界的情况(如像素 0-255,学生的考试分数 0-100)

### 改进

**均值方差归一化 standardization**:把所有的数据归一到均值为 0,方差为 1 的分布中
适用于数据分布没有明显的边界;有可能存在极端数据值
_一般情况下使用_

$$
x_{\text {scale}}=\frac{x-x_{\text {mean}}}{s}
$$

### 如何对测试数据集进行归一化

与训练集的归一化方法不同

```math
(x_test - mean\_train ) / std\_train
```

原因:

- 真实环境很可能无法得到测试数据的均值和方差(如只给你一个数据)
- 对数据的归一化也是算法的一部分

![p2](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/2299684497.png?Expires=1602314397)

### 实现

```python
from sklearn.preprocessing import StandardScaler
```

## 缺点

- 效率低下
- 高度数据相关(对 outlier 更加敏感)
- 预测的结果不具有可解释性

## 评价

secore() 进行准确率对比

# 线性回归算法

目标:找到 a 和 b,使

```math
\displaystyle\sum_{i=1}^ny\raisebox{0.2em}{(i)} -ax\raisebox{0.2em}{(i)} +b
```

尽可能小
以上公式即 **损失函数(lossfunction)**
部分函数中用上式计算拟合的程度,所以也称 **效用函数(utility function)**
统称为 **目标函数**

总结:

    通过分析问题,确定问题的损失函数或者效用函数
    通过最优化损失函数或效用函数,获得机器学习的模型

## 向量化

一般情况下,向量化相较于普通法快很多

## 评价

均方误差 MSE
改进:
均方根误差 RMSE 使其对量纲更加敏感
_上下的误差为均方根误差_
**sklearn 中没有包装 RMSE**
平均绝对误差 MAE

$$
R M S E=\sqrt{\frac{1}{m} \sum_{i=1}^{m}\left(y_{t e s t}^{(i)}-\hat{y}_{t e s t}^{(i)}\right)^{2}}
$$

$$
M A E=\frac{1}{m} \sum_{i=1}^{m}\left|y_{t e s t}^{(i)}-\hat{y}_{t e s t}^{(i)}\right|
$$

## 多元线性回归

### 实现

```python
from sklearn.linear_model import LinearRegression

lin_reg = LinearRegression()
lin_reg.fit(X_train,y_train)
lin_reg.coef_      #theta
lin_reg.intercept_    #截距

```

# 梯度下降法

基于搜索的最优化方法
作用: 最小化一个损失函数
梯度上升法 : 最大化一个效用函数

## 深入

- 批量梯度下降法
- 随机梯度下降法
- 小批量梯度下降法

## 线性回归中使用梯度下降法

在使用梯度下降法时,对目标函数要进行特殊的设计
虽然理论上挡土度非常大的时候,可以通过调节 eta 来得到想要的结果,但是会影响效率

## 梯度下降的向量化和标准化

向量化:

    简化了公式

标准化:

    在使用梯度下降法之前,将数据归一化

梯度下降法相比标准方程在进行大数据处理时具有明显优势

## 随机梯度下降法

用精度换时间
学习率逐渐递减

## scikit 实现

```python

# 使用波士顿房价数据集
from sklearn import datasets

boston = datasets.load_boston()
X = boston.data
y = boston.target

X = X[y < 50.0]
y = y[y < 50.0]


# 模型分类
from playML.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, seed=666)


# 归一化
from sklearn.preprocessing import StandardScaler

standardScaler = StandardScaler()
standardScaler.fit(X_train)
X_train_standard = standardScaler.transform(X_train)
X_test_standard = standardScaler.transform(X_test)


# 正式使用scikit中的SDG
from sklearn.linear_model import SGDRegressor

sgd_reg = SGDRegressor()
%time sgd_reg.fit(X_train_standard, y_train)
sgd_reg.score(X_test_standard, y_test)

sgd_reg = SGDRegressor(n_iter=50)
%time sgd_reg.fit(X_train_standard, y_train)
sgd_reg.score(X_test_standard, y_test)
```

# 主成分分析 PCA

- 一个非监督的机器学习算法
- 主要用于数据降维
- 通过降维,可以发现更便于人类理解的特征
- 其他应用:可视化;去噪

> 找到一个轴,所有的点映射到这个轴之后方差最大

S1:将样例的均值归零(作用是化简公式)(**demean**)
S2:求轴的方向 w=(w1,w2),使得所有的样本,映射到 w 以后,!

**区分 PAC 和线性回归**

## 梯度上升法解决主成分分析问题

注意:

- 每次求一个单位方向
- 不能用 0 向量开始
- 不能使用 StandardScaler 标准化数据

## 实现

S1:

```python
def demean(X):
    return X - np.mean(X, axis=0)
```

## 高维数据映射为低维

低维的数据是可以返回到高维的, **但是存在缺损**

## scikit 实现

```python
pca = PCA(0.95) # 锁定精度
pca.fit(X_train)

pca.n_components_ #依据X_train确定保留的维度

knn_clf = KNeighborsClassifier() # 降维后进行分类
knn_clf.fit(X_train_reduction, y_train)

knn_clf.score(X_test_reduction, y_test)

# 可视化
pca = PCA(n_components=2)
pca.fit(X)
X_reduction = pca.transform(X)

for i in range(10):
    plt.scatter(X_reduction[y==i,0], X_reduction[y==i,1], alpha=0.8)
plt.show()
```

**PCA 在降维的过程中还有降噪的作用,降噪的结果就是,维度降低,但是准确率反而提升了**

# 多项式回归

实际中,大多数的数据都是非线性的关系

- PolynomialFeatures(degeree=3)
  生成三次多项式
  个数为 10
  一次 3 1,x1,x2
  二次 3 x1^2,x2^2,x1\*x2
  三次 4 x1^3,x2^3,x1^2\*x2,x1\*x2^2

- pipeline

```python
x = np.random.uniform(-3, 3, size=100)
X = x.reshape(-1, 1)
y = 0.5 * x**2 + x + 2 + np.random.normal(0, 1, 100)

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

poly_reg = Pipeline([
    ("poly", PolynomialFeatures(degree=2)),
    ("std_scaler", StandardScaler()),
    ("lin_reg", LinearRegression())
])


poly_reg.fit(X, y)
y_predict = poly_reg.predict(X)


plt.scatter(x, y)
plt.plot(np.sort(x), y_predict[np.argsort(x)], color='r')
plt.show()
```

## 过拟合和欠拟合

过拟合:训练测试集上表现很好,但在测试数据集上表现不好

### 模型的泛化能力

使用训练数据集和测试数据集

> 测试数据集的意义就是评估模型的泛化能力

## 学习曲线

```python
def plot_learning_curve(algo, X_train, X_test, y_train, y_test):
    train_score = []
    test_score = []
    for i in range(1, len(X_train)+1):
        algo.fit(X_train[:i], y_train[:i])

        y_train_predict = algo.predict(X_train[:i])
        train_score.append(mean_squared_error(y_train[:i], y_train_predict))

        y_test_predict = algo.predict(X_test)
        test_score.append(mean_squared_error(y_test, y_test_predict))

    plt.plot([i for i in range(1, len(X_train)+1)],
                               np.sqrt(train_score), label="train")
    plt.plot([i for i in range(1, len(X_train)+1)],
                               np.sqrt(test_score), label="test")
    plt.legend()
    plt.axis([0, len(X_train)+1, 0, 4])
    plt.show()

plot_learning_curve(LinearRegression(), X_train, X_test, y_train, y_test)
```

> 注意,针对特定测试数据集的过拟合
> 增加 验证数据集(调整超参数使用的数据集)

### 交叉验证

```python
from sklearn.model_selection import cross_val_score

knn_clf = KNeighborsClassifier()
cross_val_score(knn_clf, X_train, y_train)


best_k, best_p, best_score = 0, 0, 0
for k in range(2, 11):
    for p in range(1, 6):
        knn_clf = KNeighborsClassifier(weights="distance", n_neighbors=k, p=p)
        scores = cross_val_score(knn_clf, X_train, y_train)
        score = np.mean(scores)
        if score > best_score:
            best_k, best_p, best_score = k, p, score

print("Best K =", best_k)
print("Best P =", best_p)
print("Best Score =", best_score)


best_knn_clf = KNeighborsClassifier(weights="distance", n_neighbors=2, p=2)
best_knn_clf.fit(X_train, y_train)
best_knn_clf.score(X_test, y_test)
```

将训练数据分为 k 份,训练 k 个模型,并进行交叉验证
最后求均值

### 网格搜索

```python

from sklearn.model_selection import GridSearchCV

param_grid = [
    {
        'weights': ['distance'],
        'n_neighbors': [i for i in range(2, 11)],
        'p': [i for i in range(1, 6)]
    }
]

grid_search = GridSearchCV(knn_clf, param_grid, verbose=1)
grid_search.fit(X_train, y_train)
```

### 留一法 LOO-CV

把训练数据集分成 m 份,成为留一法

> Leabe-One_out Cross Validation

优点:完全不受随机的印象,最接近模型真正的性能指标
缺点:计算量巨大

> 论文中验证严谨性

### 偏差方差权衡 bias variance

模型误差 = 偏差+方差+不可避免的误差

#### 偏差(bias)

导致偏差的主要原因:
对问题本身的假设不正确
如:非线性数据使用线性回归

#### 方差(variance)

数据的一点点扰动都会较大的影响模型
通常原因,使用的模型太复杂
如,高阶多项式回归

**机器学习的主要挑战来自于方差**

1.降低模型复杂度 2.减少数据维度;降噪 3.增加样本书 4.使用验证集

#### 总结

有一些算法天生是高方差算法. 如 KNN
非参数学习的通常都是高方差算法,因为不对数据进行人和假设

you 一些算法天生就是高偏差算法. 如线性回归
参数学习通常都是高偏差算法,因为对数据具有极强的假设

大多数算法具有相应的参数,可以调整偏差和方差
如 kNN 中的 k\线性回归中使用多项式回归

偏差和方差是矛盾的
降低偏差会提高方差,反之亦然.

### 模型正则化

$$
J(\theta)=M S E(y, \hat{y} ; \theta)+\alpha \frac{1}{2} \sum_{i=1}^{n} \theta_{i}^{2}
$$

# logistic regression

## 解决多分类问题

将多分类问题简化为二分类问题

### OvR(One vs Rest)

n 个类别进行 n 次分类,选择分类得分最高的

### OvO(one vs one)

n 个类别进行 C(n,2)次分类,选择赢数最高的分类

**ovo 耗时更长,准确率更高**
