---
title: Be a better pythonista(4)：nametuple的实际应用
date: 2020/10/28 16:39:00
updated: 2020/10/28 16:39:00
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - pythonista
noThumbInfoStyle: default
outdatedNotice: no
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
---

> Factory Function for Tuples with Named Fields

Python 除了大家熟知的，可以直接使用的 list、dictionary、tuple 等容器，还有一些放在 collections 包中的容器，这些容器的泛用性不及普通容器，但是在特殊的场景下，有着超过普通容器的性能与便利性。

本篇就在官方文档的基础上，结合笔者的学习工作经验，于管中窥得 nametuple 之一斑。

<!-- more -->

## 使用场景

笔者在学习工作中使用 nametuple 的场景如下:

1. 在定义类似坐标、rgba 值等简单的数据容器时，可以使用 nametuple
2. 可以用来快速生成 csv、sql 对应的类

下面解释一下为什么这些场景可以使用 nametuple 吧~

## 简单数据容器

这里为了方便理解，首先使用一个众所熟知的定义数据容器的手段 -- 类，来进行一个类比。

```c++
class Circle
{
      private:
      double radius;

      public:
      构造函数...
}
```

如上是国内 C++入门教材的必经之路，通过 _类_ 定义了一个简单的圆容器。这里我们选择的案例并不是 circle，而是更加复杂的 rgba。

```python
# 在python中定义一个color类，包含rgba四个关键变量
class ColorForCompare:
    __slots__ = ("r","g","b","alpha")

    def __init__(self,r,g,b,alpha):
        self.r = r  # red
        self.g = g  # green
        self.b = b  # blue
        self.alpha = alpha
```

这样，就可以使用 color_for_compare.r 来查看颜色对应的 red 值。

但是这显然是不够的，因为此时它可以接收类似 color_for_compare.x = 1 这样意义不明的语句。

```diff
class ColorForCompare:
+    __slots__ = ("r","g","b","alpha")

    def __init__(self,r,g,b,alpha):
        self.r = r
        self.g = g
        self.b = b
        self.alpha = alpha

+    def __repr__(self):
+        return f'r = {self.r}, g = {self.g}, b = {self.b}, alpha = {self.alpha}'

ColorForCompare(0,0,0,0)
```

```shell
output : r = 0, g = 0, b = 0, alpha = 0
```

```python
color_for_compare = ColorForCompare(0,0,0,0)
color_for_compare.x = 1
```

```shell
output:

---------------------------------------------------------------------------

AttributeError                            Traceback (most recent call last)

<ipython-input-58-e007350343ef> in <module>
----> 1 color_for_compare.x = 1


AttributeError: 'ColorForCompare' object has no attribute 'x'

```

这样，使用内置的 \_\_slots\_\_ 将变量固定住，就避免了 x 这样意义不明的值的干扰。同时，为了美观，又加上了一个 \_\_repr\_\_() 来输出实例化的结果。

至此，大体上完成了一个 color 容器。那么，在对应的 nametuple 中要如何实现这些功能呢？

```python
from collections import namedtuple
Color = namedtuple("Color", "r g b alpha")

Color(0,0,0,0)
```

```shell
output:

Color(r=0, g=0, b=0, alpha=0)
```

对了，就是这样简单，这里我们可以再测试一下是否有限制变量名称的功能。

```python
color = Color(0,0,0,0)
color.x = 1
```

```shell
output:

    ---------------------------------------------------------------------------

    AttributeError                            Traceback (most recent call last)

    <ipython-input-64-02f8a35ba0d6> in <module>
          1 color = Color(0,0,0,0)
    ----> 2 color.x = 1


    AttributeError: 'Color' object has no attribute 'x'
```

通过使用 nametuple，两行代码完成了 7 行代码的工作。

这里需要 **补充** 的是，你无法通过 color.r = 1 这样的语句来直接修改 nametuple 的值，具体可以看 [python3.collections](https://docs.python.org/3/library/collections.html#collections.somenamedtuple._replace),毕竟，这是个 tuple😄

nametuple 本身无法应付一些复杂的场景，比如，我们可能需要根据特殊的 rgb 值来判断是否是一些特殊的颜色(如:50,0,255->蓝色)，这就需要一些额外的函数来实现。
还有一种更加符合面向对象思维的方法，将这个函数变成 Color 类的成员函数，组件一个完善的 Color 类。显然单纯的 nametuple 无法做到这一点。

不过这并不是问题，我们完全可以通过强化 nametuple 来实现这个需求。

```python
class ColorPlus(Color):
    def convert_color_to_string(self):
        if self.r == 50 and self.g == 0 and self.b == 255:
            return '蓝色'
        else:
            return '无'
```

```python
color_p = ColorPlus(50,0,255,0)
color_p.convert_color_to_string()
```

```shell
output:  '蓝色'
```

新的类可以继承 nametuple 所定义的容器~

这就是我所说的 **场景二：用来快速生成 csv、sql 对应的类**

## 与 dictionary 的对比

python 提供了一个非常方便的容器，也就是字典。这二者的区别在于，dictionary 是 unhashable 的，而 nametuple 相反。

以 Counter 为例。我们想要统计一群颜色中，有多少是蓝色？

```python
color1 = Color(50,0,255,0)
Counter([color, color,color1])
```

```shell
output:

    Counter({Color(r=0, g=0, b=0, alpha=0): 2,
             Color(r=50, g=0, b=255, alpha=0): 1})

```

```python
c = {"r": 50, "g": 205, "b": 50, "alpha": 1.0}
Counter([c])
```

```shell
output:

    ---------------------------------------------------------------------------

    TypeError                                 Traceback (most recent call last)

    <ipython-input-80-85ae4a80ee69> in <module>
          1 c = {"r": 50, "g": 205, "b": 50, "alpha": 1.0}
    ----> 2 Counter([c.items()])


    ~\miniconda3\envs\jupy\lib\collections\__init__.py in __init__(*args, **kwds)
        566             raise TypeError('expected at most 1 arguments, got %d' % len(args))
        567         super(Counter, self).__init__()
    --> 568         self.update(*args, **kwds)
        569
        570     def __missing__(self, key):


    ~\miniconda3\envs\jupy\lib\collections\__init__.py in update(*args, **kwds)
        653                     super(Counter, self).update(iterable) # fast path when counter is empty
        654             else:
    --> 655                 _count_elements(self, iterable)
        656         if kwds:
        657             self.update(kwds)


    TypeError: unhashable type: 'dict_items'
```

dict 是无法使用 Counter 的。

本质上，nametuple 仍然是 tuple，是与 dictionary 并行的 python 容器。所以这两者的选用，根据实际情况，具体问题具体分析。

还有一个值得一提的区别。在日常使用 dict 时，我们可能会纠结应该时 color['blue'] 还是 color['b']，在多人开发时，这会导致一些麻烦甚至是风险 。而在使用 nametuple 时，ide 会像对待 class 一样给出相应的代码提示。

## nametuple 与 dictionary 和 tuple 的转换方法

### dictionary => nametuple

```python
c = {"r": 50, "g": 205, "b": 50, "alpha": 1.0}
Color(**c)   # unpack
```

```shell
output:

    Color(r=50, g=205, b=50, alpha=1.0)
```

#### dictionary 创建一个 nametuple

```python
Color = namedtuple("Color", c)
Color(**c)
```

```shell
output:

    Color(r=50, g=205, b=50, alpha=1.0)
```

### nametuple => dictionary

```python
Color(**c)._asdict()
```

```shell
output:
    OrderedDict([('r', 50), ('g', 205), ('b', 50), ('alpha', 1.0)])
```

```python
tuple(Color(**c))
```

```shell
output:
    (50, 205, 50, 1.0)
```

## 排序

与字典的排序方法相类似，可以使用简单的 lambda 来实现 nametuple 的排序功能

```python
colors = [
    Color(r=50, g=205, b=50, alpha=0.1),
    Color(r=50, g=205, b=50, alpha=0.5),
    Color(r=50, g=0, b=0, alpha=0.3)
]
```

```python
sorted(colors,key=lambda x:x.alpha,reverse=True)
```

```shell
output:
    [Color(r=50, g=205, b=50, alpha=0.5),
     Color(r=50, g=0, b=0, alpha=0.3),
     Color(r=50, g=205, b=50, alpha=0.1)]
```

## 总结

以上，就是现阶段使用 nametuple 的一些心得体会，与常见的容器对比总结如下：

### 与 class

1. 自带了 solt 属性
2. 属性的值不可直接改变，而需要借助内置函数
3. 原生 Class 无法使用 Counter
4. 更简单的定义方法

### 与 dictionary

1. hashable，可以使用 Counter 之类的统计方法
2. 可以在 ide 中可以得到代码提示
