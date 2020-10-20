---
layout: post
cid: 43
title: Python 数据挖掘基础
slug: 43
date: 2019/07/16 19:37:00
updated: 2019/07/22 08:13:47
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

本篇记载了如何在 python 中使用数据挖掘的相关的模块。
都是基础级的东西了。

    参考：
        《python数据科学入门》
        在学习时零散地从网站、博客上获得的相关的知识

<!-- more -->

# numpy

arg 的用法

## fancy indexing

# pandas

## Dataframe

### 创建

方法一：

```python
df=pd.read_clipboard(engine='python')
```

与之对应的是 read_clipboard

方法二:
通过 Series 列表创建

```python
df=pd.DataFrame([Series])
```

### 填充

#### np

```python
df_new['May 2020']=np.arange(1,8)
```

注意行数，超过会报错

#### series

1.由于 dataframe 本质上是由一列一列的 series 组成的，所以可以有以下做法

```python
df_new['May 2020']=Series(np.arange(1,8))
```

这样做还有一种好处，就是可以修改指定的行

```python
df_new['May 2020']=Series([4,5],index=[1,2])
```

### 查看

.head()
.tail()
.iloc[行切片,列切片]
.loc[行切片，列切片]

### reindex

Series.reindex(index=[],fill_value=)
fill_value 填充溢出项
method:ffill follow fill

溢出默认为 NaN

### NaN

.isnull()
.notnull()

#### dataframe

.dropnan() 数据清洗？
axis 0:行 1:列
how any:任意 all:全部

.fillna()

### 多级 index

.unstack() 转化为 dataframe

### mapping

DataFrame.map(dict)
注意 index 的一致性

### replace

DataFrame.replace(dict)
or
DataFrame.replace(a,b)
a,b 可以为 list

## 简单操作

DataFrame.describe()

Series.sort_values()
Series.sort_index()

DataFrame[].sort_values() 输出 Series
DataFrame.sort_values()
DataFrame.sort_index()

### merge

相同的 columns
key
how

### concatenate

### apply

del dataframe['column']
删除指定列

## 数据清洗（略）

dataframe['column'].unique() 去除一列中的重复数据(返回 series)

dataframe.drop_duplicates(['column']) 按照指定的列进行去重(直接对本体进行操作)

    args:keep(选择行基准)

df_clean[~df_clean['Type'].isin(['Free'])]
去除 type 列中值为 Free 的行

## 时间序列操作

方便生成长的 series

series[xxxx-xx-xx] 返回时间为 xxxx-xx 的数据
series[xxxxxxxx] 同上

pd.date_range('xxxx-xx-xx',periods=num,freq='W')
返回 datetimeindex 数组,长度为 num,间隔为周

    freq:5H 以每5小时为间隔

series[xxxx-xx]
返回时间为 xxxx-xx 的数据集合

### series.resample() 填充、采样

#### 填充

series.resample('H').ffill() .bfill()
更多操作参照参数表

#### 采样

范式

```python
weekly_df['Ali']=stock_df['ali'].resample('W').mean()
```

## 数据分箱

```python
bins=[0,59,70,80,100]
df['categ']=pd.cut(df['score'],bins,labels=['bad','good','great','perfect'])
```

## 数据分组

g=df.groupby(df['col')]

g.groups 显示分组结果
df_col=g.get_group('col') 生成新的基于 col 的 df

> 这里的 col 指的是列中的某一个值

接下来就可以进行 df 的常规操作，如：
df_col.mean() 求均值

for name,group in g: #对 group 进行访问
print(name)
print(group)

### 对某两个 col 作 groupby

g=df.groupby(df['col1','col2'])
for (name1,name2),group in g:

## 数据聚合

g.agg('argname')
同时，也可以自定义聚合方式

## 透视表

pd.pivot_table(df,index=['col'……],values=['col'……],aggfunc='`funcname`')

    other args:
        columns:要分析的列
        fill_value:填充Nan

## 技巧

df['col'].value_counts()
统计该列数值次数
series.unstack()
将多级的 series 转换为 df
df.sort_values('col',……)

# matplotlib

## subplot() 子图

subplots()

plot()

    args:
    stacked : 堆叠形式

df.iloc[rowindex].plot()
按行画图

## hist

plt.hist()
直方图

# Seaborn

hist 直方图
kde 密度图
rug 轴须图
heatmap 热力图

sns.load_dataset(args) 获取库数据

sns.axes_style() 列出参数列表然后可以进行 sns.set_style({a:b},[……)修改

plotting_context()
set_context()

.set() 恢复为默认参数

sns.color_palette() # RGB
sns.palplot() # 查看当前的色板
可以增加色板的容色数

sns.color_palette('hls',num)
生成 num 数目的颜色

seaborn.pythondata.org

### 杂项

每一行的是由[0]和[1]组成
[0]是 index 的类型,[1]是一个 Series

shift+tab

#### magic function

%timeit +函数
e.g. %timeit np.arange(10)

#### 数据获取

public dataset

#### seaborn 字体

```python
myfont=FontProperties(fname=r'/Users/zxjsama/Library/Fonts/SimHei.ttf')
sns.set(font=myfont.get_family())
sns.set_style("whitegrid",{"font.sans-serif":['SimHei']})
```
