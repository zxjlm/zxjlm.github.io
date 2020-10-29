---
layout: post
cid: 86
title: Be a better pythonista(3)
slug: 86
date: 2019/08/28 17:39:00
updated: 2019/09/01 15:06:15
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

本节主要是函数和类的一些技巧操作.

当然,函数和类二者任意一个拿出来都是很巨量的篇幅,所以这里就只是选取了在项目中经常用到的一些技巧,并根据个人的实战经验来进行详细的阐述.

后续可能会进行增改(如果还记得的话

# 函数

## 可接受任意数量参数的函数

```python
def anyargs(*args, **kwargs):
    print(args) # A tuple
    print(kwargs) # A dict
```

**一个\*参数只能出现在函数定义中最后一个位置参数后面，而 \*\*参数只能出现在最后一个参数。 有一点要注意的是，在 \*参数后面仍然可以定义其他参数。**

## 只接受关键字参数的函数

将强制关键字参数放到某个\*参数或者单个\*后面就能达到这种效果。

**很多情况下，使用强制关键字参数会比使用位置参数表意更加清晰，程序也更加具有可读性。 **

## 给函数参数增加元信息

```python
def add(x:int, y:int) -> int:
    return x + y
```

注解不会改变 python 的语义

ps.在很多的开发环境中,都有自己的添加注解的方法,这种方法往往有着更高的可读性.
如 pycharm 的 _'''+enter_ 快捷键.

## 匿名函数

lambda 函数广泛地存在于许多的语言之中,个人认为最经典的是 C++中的 lambda 函数,有 C++ lambda 基础的可以直接对照本文章看;如果对匿名函数不了解的,建议阅读 _python cookbook_ 原文,同时,参照其他的的资料.

### 定义匿名函数

```python
>>> add = lambda x, y: x + y
>>> add(2,3)
5
>>> add('hello', 'world')
'helloworld'

# 效果等同于

>>> def add(x, y):
...     return x + y
...
>>> add(2,3)
5
```

**尽管 lambda 表达式允许你定义简单函数，但是它的使用是有限制的。 你只能指定单个表达式，它的值就是最后的返回值。也就是说不能包含其他的语言特性了， 包括多个语句、条件表达式、迭代以及异常处理等等。**

### 匿名函数捕获变量值

**lambda 表达式中的 x 是一个自由变量， 在运行时绑定值，而不是定义时就绑定，这跟函数的默认值参数定义是不同的**

如果你想让某个匿名函数在定义时就捕获到值，可以将那个参数值定义成默认参数即可

```python
>>> x = 10
>>> a = lambda y, x=x: x + y
>>> x = 20
>>> b = lambda y, x=x: x + y
>>> a(10)
20
>>> b(10)
30

# 列表循环中的lambda
>>> funcs = [lambda x, n=n: x+n for n in range(5)]
>>> for f in funcs:
... print(f(0))
...
0
1
2
3
4
```

## 带额外状态信息的回调函数

法一:

```python
def apply_async(func, args, *, callback):
    # Compute the result
    result = func(*args)

    # Invoke the callback with the result
    callback(result)

>>> def print_result(result):
...     print('Got:', result)
...
>>> def add(x, y):
...     return x + y
...
>>> apply_async(add, (2, 3), callback=print_result)
Got: 5
>>> apply_async(add, ('hello', 'world'), callback=print_result)
Got: helloworld
>>>
```

注:apply*async 中的 *\*\_ 是必要关键字参数指定.

法二:作为类的替代，可以使用一个闭包捕获状态值

```python
def make_handler():
    sequence = 0
    def handler(result):
        nonlocal sequence
        sequence += 1
        print('[{}] Got: {}'.format(sequence, result))
    return handler

>>> handler = make_handler()
>>> apply_async(add, (2, 3), callback=handler)
[1] Got: 5
>>> apply_async(add, ('hello', 'world'), callback=handler)
[2] Got: helloworld
>>>
```

法三:协程

```python
def make_handler():
    sequence = 0
    while True:
        result = yield
        sequence += 1
        print('[{}] Got: {}'.format(sequence, result))

# 对于协程，你需要使用它的 send() 方法作为回调函数

>>> handler = make_handler()
>>> next(handler) # Advance to the yield
>>> apply_async(add, (2, 3), callback=handler.send)
[1] Got: 5
>>> apply_async(add, ('hello', 'world'), callback=handler.send)
[2] Got: helloworld
>>>
```

基于回调函数的软件通常都有可能变得非常复杂。一部分原因是回调函数通常会跟请求执行代码断开。 因此，请求执行和处理结果之间的执行环境实际上已经丢失了。如果你想让回调函数连续执行多步操作， 那你就必须去解决如何保存和恢复相关的状态信息了。

# 类与对象

首先,要了解类的几个常用的内置方法

    __init__()
    __str__()
    __repr__()
    __enter__() *
    __exit__() *

## chaos season

```python
def __repr__(self):
    return 'Pair({0.x!r}, {0.y!r})'.format(self)
# 这里的 0 就是 self,等价于下面的代码
def __repr__(self):
    return 'Pair(%r, %r)' % (self.x, self.y)

```

## 自定义字符串格式化

```python
_formats = {
    'ymd' : '{d.year}-{d.month}-{d.day}',
    'mdy' : '{d.month}/{d.day}/{d.year}',
    'dmy' : '{d.day}/{d.month}/{d.year}'
    }

class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    def __format__(self, code):
        if code == '':
            code = 'ymd'
        fmt = _formats[code]
        return fmt.format(d=self)

# 使用
>>> d = Date(2012, 12, 21)
>>> format(d)
'2012-12-21'
>>> format(d, 'mdy')
'12/21/2012'
>>> 'The date is {:ymd}'.format(d)
'The date is 2012-12-21'
>>> 'The date is {:mdy}'.format(d)
'The date is 12/21/2012'
>>>
```

\_\_format\_\_() 方法给 Python 的字符串格式化功能提供了一个钩子。 这里需要着重强调的是格式化代码的解析工作完全由类自己决定。因此，格式化代码可以是任何值。

```python
>>> from datetime import date
>>> d = date(2012, 12, 21)
>>> format(d)
'2012-12-21'
>>> format(d,'%A, %B %d, %Y')
'Friday, December 21, 2012'
>>> 'The end is {:%d %b %Y}. Goodbye'.format(d)
'The end is 21 Dec 2012. Goodbye'
>>>
```

## 在类中封装属性名

Python 程序员不去依赖语言特性去封装数据，而是通过遵循一定的属性和方法命名规约来达到这个效果。 第一个约定是任何以单下划线\_开头的名字都应该是内部实现。

```python
class A:
    def __init__(self):
        self._internal = 0 # An internal attribute
        self.public = 1 # A public attribute

    def public_method(self):
        '''
        A public method
        '''
        pass

    def _internal_method(self):
        pass
```

> 使用双下划线开始会导致访问名称变成其他形式。这在继承的时候会被重命名.

**大多数而言，你应该让你的非公共名称以单下划线开头。但是，如果你清楚你的代码会涉及到子类， 并且有些内部属性应该在子类中隐藏起来，那么才考虑使用双下划线方案。**

还有一点要注意的是，有时候你定义的一个变量和某个保留关键字冲突，这时候可以使用单下划线作为后缀. ~~这里我们并不使用单下划线前缀的原因是它避免误解它的使用初衷 (如使用单下划线前缀的目的是为了防止命名冲突而不是指明这个属性是私有的)。~~

## 创建可管理的属性

### 问题

你想给某个实例 attribute 增加除访问与修改之外的其他处理逻辑，比如类型检查或合法性验证。

比如验证赋值是否正确

### 解决方案

自定义某个属性的一种简单方法是将它定义为一个 property。

```python
class Person:
    def __init__(self, first_name):
        self.first_name = first_name

    # Getter function
    @property
    def first_name(self):
        return self._first_name

    # Setter function
    @first_name.setter
    def first_name(self, value):
        if not isinstance(value, str):
            raise TypeError('Expected a string')
        self._first_name = value

    # Deleter function (optional)
    @first_name.deleter
    def first_name(self):
        raise AttributeError("Can't delete attribute")
```

Properties 还是一种定义动态计算 attribute 的方法。 这种类型的 attributes 并不会被实际的存储，而是在需要的时候计算出来。

```python
import math
class Circle:
    def __init__(self, radius):
        self.radius = radius

    @property
    def area(self):
        return math.pi * self.radius ** 2

    @property
    def diameter(self):
        return self.radius * 2

    @property
    def perimeter(self):
        return 2 * math.pi * self.radius
```

在这里，我们通过使用 properties，将所有的访问接口形式统一起来， 对半径、直径、周长和面积的访问都是通过属性访问，就跟访问简单的 attribute 是一样的。

```python
>>> c = Circle(4.0)
>>> c.radius
4.0
>>> c.area  # Notice lack of ()
50.26548245743669
>>> c.perimeter  # Notice lack of ()
25.132741228718345
>>>
```

## 使用延迟计算属性

```python
# 定义一个延迟属性的一种高效方法是通过使用一个描述器类
class lazyproperty:
    def __init__(self, func):
        self.func = func

    def __get__(self, instance, cls):
        if instance is None:
            return self
        else:
            value = self.func(instance)
            setattr(instance, self.func.__name__, value)
            return value

# 使用
import math

class Circle:
    def __init__(self, radius):
        self.radius = radius

    @lazyproperty
    def area(self):
        print('Computing area')
        return math.pi * self.radius ** 2

    @lazyproperty
    def perimeter(self):
        print('Computing perimeter')
        return 2 * math.pi * self.radius
```

很多时候，构造一个延迟计算属性的主要目的是为了提升性能。 例如，你可以避免计算这些属性值，除非你真的需要它们。

本质上是在实例上添加了 \_\_name\_\_ 属性

> 一个很简单的测试方法是,此时再讲半径改为 10,但是面积是不变的

## 定义抽象基类

```python
from abc import ABCMeta, abstractmethod

class IStream(metaclass=ABCMeta):
    @abstractmethod
    def read(self, maxbytes=-1):
        pass

    @abstractmethod
    def write(self, data):
        pass
```

**可以使用预定义的抽象类来执行更通用的类型检查**

```python
import collections

# Check if x is a sequence
if isinstance(x, collections.Sequence):
...

# Check if x is iterable
if isinstance(x, collections.Iterable):
...

# Check if x has a size
if isinstance(x, collections.Sized):
...

# Check if x is a mapping
if isinstance(x, collections.Mapping):
```
