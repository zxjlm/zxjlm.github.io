---
layout: post
cid: 26
title: 顺序容器&&泛型算法&&关联容器
slug: 26
date: 2018/11/20 18:32:00
updated: 2018/11/21 13:49:55
status: publish
author: harumonia
categories:
  - 源流清泉
  - Algorithm \ Data Structure
tags:
  - 算法
thumb:
thumbStyle: default
hidden: false
---

> 在网络上浏览了很多关于 STL 的资料，但是大多都不能令我满意，所以这里以一个初学者的视角来学习一遍 STL

ps:图片由于一些原因（懒），就不放上来了，大抵就是对应标题下的一些表格。

资料主要来源：c++primer

## 顺序容器

按位置来保存和访问的

vector 可变大小数组，尾插入删除快

deque 双端队列，头尾插入删除快

list 双向链表，双向顺序访问，任意插入删除快

forward_list 单向链表

array 固定大小的数组，快速访问，不能增删

string 类 vector。专门用于保存字符

### 相关的构造函数

```c++
vector<int> ivec(10,-1);    //10个-1
vector<string> svec(10,"hi");  //10个hi
vector<int> ivec(10);       //10个0
```

> string 具有额外操作

### 容器的遍历手段

#### 方法一

```c++
copy(a.begin(), a.end(), ostream_iterator<int>(cout," "));
```

#### 方法二

```c++
    vector<int>::iterator it = v.begin();
    // const时。 vector<int>::const_iterator iter=v.begin();
    for(; it != v.end(); ++it)
    {
        cout<<(*it)<<" ";
    }
    cout<<endl;
```

#### 方法三

```c++
for(unsigned int i = 0; i < v.size(); ++i)
    {
        cout<<v[i]<<" ";
    }
    cout<<endl;

```

#### 方法四

```c++
    for_each(a.begin(), a.end(), [](int s){cout<<s<<" ";});//联动下述lambda
```

### unique 算法

将容器里的重合元素取其一到前排进行排序。

> 排列在范围前部，**返回指向不重复区域后一个位置的指针**
> 也就是说，返回迭代器。

e.g. 4 2 4 4 4 2 2 2 2 2
此时使用 erase 函数，可以实现容器中元素去重功能。

```c++
    auto uni=unique(a.begin(), a.end());
    a.erase(uni, a.end());
```

### lambda 函数

适用于低频率使用的简单操作。
通常可以使用函数来代替，但是涉及到参数捕获时具有独特性。
**第二关键词：谓词**

#### 使用尾置返回

```c++
[]()->int {}
```

```c++
[ captures ] <tparams>(optional)(c++20) ( params ) specifiers exception attr -> ret requires(optional)(c++20) { body }(1)
[ captures ] ( params ) -> ret { body } (2)
[ captures ] ( params ) { body }    (3)
[ captures ] { body }   (4)

```

lambda 函数确实有够花哨了，不过我在查看一些函数源码的之后倒是经常可以看见。

lambda 函数体中不止含有 return 时，需要使用尾置返回指定 return 的类型，否则默认 void。

#### bind 函数

functional 库
可以看作一个通用的函数适配器，接受一个可调用对象，生成一个新的可调用对象来“适应”原对象的参数列表。

```c++
auto newCallable=bind(callable,arg_list)
```

arg_list 中可包含形如\_n 的样式，意为第 n 个参数。
**\_n 定义在 placeholders 的命名空间中**

## 再探迭代器

### 插入迭代器

#### inserter

插入到迭代器指向元素`之前`
可选`迭代器`作为第二参数，指定插入位置。

#### fornt_inserter

使用 push_front,`总是`插入到容器的第一个元素`之前`

#### back_inserter

创建一个使用 push_back 的迭代器

### iostream 迭代器

```c++
    istream_iterator<int> in_iter(cin),eof;
    vector<int> vec(in_iter,eof);
```

直到第一个不是 int 的元素为止

PS.
范围 for 语句

```c++
for(变量 : 容器或序列 )
{
    操作//不可对容器或序列进行增删
}
```

accumulate 函数
accumulate 带有三个形参：头两个形参指定要累加的元素范围，第三个形参则是累加的初值。

```c++
int sum = accumulate(vec.begin() , vec.end() , 42);

```

### 特定容器算法

## 关联容器

按关键词来保存和访问的

### map 遍历

```c++
//目前掌握两种普通遍历（while && for）
auto bba=a.begin();
    while (bba!=a.end()) {
        cout << bba->first<<" "<<bba->second<<endl;
        ++bba;
    }
    for(auto bba:a)
    {
        cout <<bba.second<<endl;
    }
```

## 黑话

args 参数列表
谓词 返回可以转换为 bool 类型的函数
