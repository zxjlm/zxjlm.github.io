---
layout: post
cid: 64
title: Be a better pythonista(1)
slug: 64
date: 2019/08/06 17:21:00
updated: 2019/08/15 09:19:38
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - pythonista
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

Be a better pythonista 是新开的一个坑，如其名，根本目的是为了成为一个更棒的 python 开发者。

如何成为一个 better pythonista？个人认为，是 python 的特性、高级语法还有对 python 形式的编程思维的理解和贯彻，这也是本系列的侧重点。

Be a better pythonista 计划用前四部分完成对 cookbook 的重读，中间会对一些代码进行修正处理，并且会穿插一些个人的理解。同时，还会加入一些在开发中所遇到的一些事情、写作同时遇到的一些值得分享的东西，以为 dessert。

<!-- more -->

修改记录：  
2019 年 08 月 15 日，按照文档编写规划进行了规范修改。

# 基础技巧

## 列表生成式

```python
p1 = [foo for foo in list if foo > ?]
```

## 字典推导式

```python
p1 = {key: value for key, value in prices.items() if value > 200}
```

## 切片

```python
a[:1]
a[2:4]
a[::2]
```

切片的-1 值在使用不同的对象时有不同的效果,可以在 numpy 中进行尝试

# 记数问题

很多的记数问题可以归结为集合问题

## Counter

计算列表的每个值的出现次数

## 交并补记数

使用位运算符 & \-

# 排序问题

## 字典排序

```python
from operator import itemgetter
rows_by_fname = sorted(rows, key=itemgetter('fname'))
rows_by_uid = sorted(rows, key=itemgetter('uid'))
```

itemgetter() 函数也支持多个 keys，比如下面的代码

```python
rows_by_lfname = sorted(rows, key=itemgetter('lname','fname'))
```

## 排序不支持与原生比较的对象

### 法一

```python
class User:
    def __init__(self, user_id):
        self.user_id = user_id

    def __repr__(self):
        return 'User({})'.format(self.user_id)


def sort_notcompare():
    users = [User(23), User(3), User(99)]
    print(users)
    print(sorted(users, key=lambda u: u.user_id))
```

### 法二

选择使用 lambda 函数或者是 attrgetter() 可能取决于个人喜好。 但是， attrgetter() 函数通常会运行的快点，并且还能同时允许多个字段进行比较。

```python
>>> from operator import attrgetter
>>> sorted(users, key=attrgetter('user_id'))
```

> 同样需要注意的是，这一小节用到的技术同样适用于像 min() 和 max() 之类的函数。

# 字典相关问题

## 找出两个字典的公共键

map() 得到所有字典
reduce(lambda a,b:a&b,map(dict.viewkeys,[s1,s2,s3]))

## 映射名称到序列元素

```python
from collections import namedtuple
Subscriber = namedtuple('Subscriber', ['addr', 'joined'])
sub = Subscriber('jonesy@example.com', '2012-10-19')
sub
```

命名元组另一个用途就是作为字典的替代，因为字典存储需要更多的内存空间。 如果你需要构建一个非常大的包含字典的数据结构，那么使用命名元组会更加高效。 但是需要注意的是，不像字典那样，一个命名元组是不可更改的。

如果你真的需要改变属性的值，那么可以使用命名元组实例的 **\_replace()** 方法， 它会创建一个全新的命名元组并将对应的字段用新的值取代。比如：

**\_replace()** 方法还有一个很有用的特性就是当你的命名元组拥有可选或者缺失字段时候， 它是一个非常方便的填充数据的方法。 你可以先创建一个包含缺省值的原型元组，然后使用 \_replace() 方法创建新的值被更新过的实例。

```python
from collections import namedtuple

Stock = namedtuple('Stock', ['name', 'shares', 'price', 'date', 'time'])

# Create a prototype instance
stock_prototype = Stock('', 0, 0.0, None, None)

# Function to convert a dictionary to a Stock
def dict_to_stock(s):
    return stock_prototype._replace(**s)

# use
>>> a = {'name': 'ACME', 'shares': 100, 'price': 123.45}
>>> dict_to_stock(a)
Stock(name='ACME', shares=100, price=123.45, date=None, time=None)
>>> b = {'name': 'ACME', 'shares': 100, 'price': 123.45, 'date': '12/17/2012'}
>>> dict_to_stock(b)
Stock(name='ACME', shares=100, price=123.45, date='12/17/2012', time=None)
>>>
```

## 让字典保持有序

OrderedDict()

## 字典的合并或映射

```python
from collections import ChainMap
c = ChainMap(a,b)
print(c['x']) # Outputs 1 (from a)
print(c['y']) # Outputs 2 (from b)
print(c['z']) # Outputs 3 (from a)
```

一个 ChainMap 接受多个字典并将它们在逻辑上变为一个字典。 然后，这些字典并不是真的合并在一起了， ChainMap 类只是在内部创建了一个容纳这些字典的列表 并重新定义了一些常见的字典操作来遍历这个列表。大部分字典操作都是可以正常使用的

# 字符串相关

## 一些内置函数

常用内置函数这里就不多做介绍,列举出来,有不认识的可以去查
find\repalce\startwith\endwith
strip\lstrip\rstrip
ljust\rjust\center
format()

## 正则相关

正则是字符串处理之中很重要的一环,不过已经讲的很多了,这里就只作简单讨论.

### 匹配模式

#### 最短匹配(非贪婪)

```python
>>> str_pat = re.compile(r'"(.*?)"')
>>> str_pat.findall(text2)
['no.', 'yes.']
>>>
```

#### 多行匹配

- 方案 1
  修改模式字符串，增加对换行的支持。

```python
>>> comment = re.compile(r'/\*((?:.|\n)*?)\*/')
>>> comment.findall(text2)
[' this is a\n multiline comment ']
>>>
```

- 方案 2
  re.compile() 函数接受一个标志参数叫 re.DOTALL ，在这里非常有用。 它可以让正则表达式中的点(.)匹配包括换行符在内的任意字符。比如：

```python
>>> comment = re.compile(r'/\*(.*?)\*/', re.DOTALL)
>>> comment.findall(text2)
[' this is a\n multiline comment ']
```

## 审查清理文本字符串

在非常简单的情形下，你可能会选择使用字符串函数(比如 str.upper() 和 str.lower() )将文本转为标准格式。 使用 str.replace() 或者 re.sub() 的简单替换操作能删除或者改变指定的字符序列。

然后，有时候你可能还想在清理操作上更进一步。比如，你可能想消除整个区间上的字符或者去除变音符。 为了这样做，你可以使用经常会被忽视的 str.translate() 方法。

```python
>>> s = 'pýtĥöñ\fis\tawesome\r\n'

#第一步是清理空白字符。
>>> remap = {
...     ord('\t') : ' ',
...     ord('\f') : ' ',
...     ord('\r') : None # Deleted
... }
>>> a = s.translate(remap)
>>> a
'pýtĥöñ is awesome\n'

#空白字符 \t 和 \f 已经被重新映射到一个空格。回车字符r直接被删除。

# 以这个表格为基础进一步构建更大的表格
>>> import unicodedata
>>> import sys
>>> cmb_chrs = dict.fromkeys(c for c in range(sys.maxunicode)
...                         if unicodedata.combining(chr(c)))
...
>>> b = unicodedata.normalize('NFD', a)
>>> b
'pýtĥöñ is awesome\n'
>>> b.translate(cmb_chrs)
'python is awesome\n'
```

> 对于简单的替换操作， str.replace() 方法通常是最快的，甚至在你需要多次调用的时候。

## 文本对齐

```python
>>> format(text, '>20')
'         Hello World'
>>> format(text, '<20')
'Hello World         '
>>> format(text, '^20')
'    Hello World     '
>>>

# 多值格式化
>>> '{:>10s} {:>10s}'.format('Hello', 'World')
'     Hello      World'
>>>

#format() 函数的一个好处是它不仅适用于字符串。它可以用来格式化任何值，使得它非常的通用。 比如，你可以用它来格式化数字：
>>> x = 1.2345
>>> format(x, '>10')
'    1.2345'
>>> format(x, '^10.2f')
'   1.23   '
>>>
```

## 字节字符串上的字符串操作

字节字符串支持大部分和文本字符串一样的内置操作

大多数情况下，在文本字符串上的操作均可用于字节字符串。 然而，这里也有一些需要注意的不同点。首先，字节字符串的索引操作返回整数而不是单独字符。

```python
>>> a = 'Hello World' # Text string
>>> a[0]
'H'
>>> a[1]
'e'
>>> b = b'Hello World' # Byte string
>>> b[0]
72
>>> b[1]
101
>>>
```

# 实现历史记录功能 python2.X

history = deque([],5)

> pickle 存取 python 对象
> pickle.dump(q,open('history','w')
> pickle.load(open('history'))

# 一些思考

考虑临时空间对性能的影响.即,要不要开辟临时空间.
当临时空间很大时,它的时间性能和空间性能往往不及分段处理.
