---
layout: post
cid: 87
title: 使用随机森林解决"泰坦尼克幸存"问题(1)——小试牛刀
slug: 87
date: 2019/09/01 15:06:00
updated: 2019/09/08 16:11:42
status: publish
author: harumonia
categories:
  - 源流清泉
  - dataMining
tags:
  - 随机森林
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

The sinking of the RMS Titanic is one of the most infamous shipwrecks in history. On April 15, 1912, during her maiden voyage, the Titanic sank after colliding with an iceberg, killing 1502 out of 2224 passengers and crew. This sensational tragedy shocked the international community and led to better safety regulations for ships.

One of the reasons that the shipwreck led to such loss of life was that there were not enough lifeboats for the passengers and crew. Although there was some element of luck involved in surviving the sinking, some groups of people were more likely to survive than others, such as women, children, and the upper-class.

<!-- more -->

## 渣翻译

RMS 泰坦尼克号沉没是历史上最惨重的海难之一。 1912 年 4 月 15 日，在它的第一次航行中，泰坦尼克号与冰山相撞后沉没，2224 名乘客和机组人员中有 1502 人死亡。这场耸人听闻的悲剧震惊了国际社会，同时,也促进了更好的船只安全规定的制定。

造成海难失事的原因之一是乘客和机组人员没有足够的救生艇。尽管幸存有一些运气因素，但有些人比其他人更容易生存，例如妇女，儿童和上流社会。

# 总体思路

先进行数据集的处理,然后进行分类学习.

# 数据集

泰坦尼克问题是 _类实际问题_ ,与 sklearn 中的 dataset 的数据不同,存在缺失值等干扰项,所以第一步是要对数据集进行预处理.

## 属性

存在以下的 12 个属性,其中,Survived 是 **结果**.

    PassengerId -  Unique ID of the passenger
    Survived -  Survived (1) or died (0)
    Pclass -  Passenger's class (1st, 2nd, or 3rd)
    Name -  Passenger's name
    Sex - Passenger's sex
    Age -  Passenger's age
    SibSp -  Number of siblings/spouses aboard the Titanic
    Parch -  Number of parents/children aboard the Titanic
    Ticket -  Ticket number
    FareFare -  paid for ticket
    Cabin - Cabin number
    Embarked -  Where the passenger got on the ship (C - Cherbourg, S - Southampton, Q = Queenstown)

## 处理思路

在了解了属性的具体含义之后就可以进行数据集的处理了.

这里先列一下最终的目标:

- 数值化,随机森林不支持非数值的数据
- 消除残缺值

### 数值化

输出 _Dataframe.info()_

    <class 'pandas.core.frame.DataFrame'>
    RangeIndex: 891 entries, 0 to 890
    Data columns (total 12 columns):
    PassengerId    891 non-null int64
    Survived       891 non-null int64
    Pclass         891 non-null int64
    Name           891 non-null object
    Sex            891 non-null object
    Age            714 non-null float64
    SibSp          891 non-null int64
    Parch          891 non-null int64
    Ticket         891 non-null object
    Fare           891 non-null float64
    Cabin          204 non-null object
    Embarked       889 non-null object
    dtypes: float64(2), int64(5), object(5)
    memory usage: 83.6+ KB

可以看出,要处理的是 _name_ \ _Sex_ \ _Ticket_ \ _Cabin_ \ _Embarked_ 这几项.

根据常识, _name_ 对是否幸存并没有决定性影响

```python
df1.drop(['Name'],axis=1,inplace=True)
```

然后,对 sex\Embarked 这类有限数量的数据进行数值化.

```python
df1['Sex'].replace('male',1,inplace=True)
df1['Sex'].replace('female',0,inplace=True)

df1['Embarked'].replace('S',0,inplace=True)
df1['Embarked'].replace('C',1,inplace=True)
df1['Embarked'].replace('Q',2,inplace=True)
```

注:由于 _Embarked_ 存在残缺值,所以数据类型为 float

这里对 _Ticket_ 的处理有点犹豫,暂缺同 _name_ 进行处理

```python
df1.drop(['Ticket'],axis=1,inplace=True)
```

**最后,到最关键的 cabin 处理**
有两种方法

- 直接删除,因为 cabin 的缺失值太多(这在后面的缺失值处理中会介绍,缺失率为 77%)
- 填补

直接删除的好处在于方便(废话
填补是一项巨大的工程,并且依据方法的不同,出错的概率很高.

这里我选择去填补(修正残缺值).

# 修正残缺值

查看各属性的残缺值比例,并按照降序排列

    Cabin       0.771044
    Age         0.198653
    Embarked    0.002245
    Fare        0.000000
    Parch       0.000000
    SibSp       0.000000
    Sex         0.000000
    Pclass      0.000000
    Survived    0.000000
    dtype: float64

我准备先从残缺值比低的开始修正(又是废话....

目前我所掌握的两种方法:

- 人工分析
- 随机森林填补

## 人工分析

人工分析的好处在于准确度相对较高.
缺点当然就是费时.

### 修正 Embarked

先列出残缺值的具体行,得到数据

| PassengerId | Survived | Pclass | Sex | Age  | SibSp | Parch | Fare | Cabin | Embarked |
| ----------- | -------- | ------ | --- | ---- | ----- | ----- | ---- | ----- | -------- |
| 62          | 1        | 1      | 0   | 38.0 | 0     | 0     | 80.0 | B28   | NaN      |
| 830         | 1        | 1      | 0   | 62.0 | 0     | 0     | 80.0 | B28   | NaN      |

再从数据表中摘出可能会影响该值的因素 -- Pclass(阶层)\Fare(票价)

然后绘制箱线图,发现极大概率落在 C 域内,所以两者赋值为
[![image.png](http://www.harumonia.top/images/2019/08/31/image.png)](http://www.harumonia.top/image/lSbU)

聚类得出各个水平的 Cabin 的平均值,并划分区间

    Cabin
    G     14.205000
    F     18.079367
    N     19.132707
    T     35.500000
    A     41.244314
    D     53.007339
    E     54.564634
    C    107.926598
    B    122.383078
    Name: Fare, dtype: float64

然后使用自定义的换算函数,将 Fare 依据其所在的区间换算为对应的大写字母,然后数值化.

```python
def cabin_to_num(a):
    #{'G': 0, 'C': 1, 'E': 2, 'F': 3, 'T': 4, 'D': 5, 'A': 6, 'B': 7}
    dic = dict([*zip(Cabin_list,range(0,len(Cabin_list)))])
    return dic[a]

df_manutal_1.Cabin = df_manutal_1.Cabin.apply(lambda x:cabin_to_num(x))
```

最后剩下的空值是年龄,但是凭借主观经验判断,年龄对是否生存具有十分重要的影响,不应该使用一些粗糙的方法(如上)去填充(人工分析的严谨性),所以暂时先删除.

到这里,人工分析的数据集的处理就可以告一段落了.然后进行模型的建立和评估.

这里由于 _结果不太好_ ,就不单独列一节了.
使用十折交叉验证法,最后得出

| 训练均分           | 测试均分           |
| ------------------ | ------------------ |
| 0.9909744528907043 | 0.7901017214397495 |

(没错,过拟合了,树模型是非常容易过拟合的,出现这种情况之后就要调参,来优化模型

```python
# 调参选择(渐进优化)
param = {'max_depth':[5],'min_samples_leaf':[2],"min_samples_split":[2],'max_features':range(1,5),'criterion':['gini','entropy']}
```

优化之后,test 分数变为 0.8207282913165266
