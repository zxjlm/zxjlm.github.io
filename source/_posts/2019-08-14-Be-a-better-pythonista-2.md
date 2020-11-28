---
layout: post
cid: 80
title: Be a better pythonista(2)
slug: 80
date: 2019/08/14 21:27:00
updated: 2019/08/15 11:07:11
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

分为迭代器、文件读写、函数式编程三个部分，其中，前二者来源于 cookbook，其中加入了一些个人的理解和补正。函数式编程作为个人的扩充添加进来，主要参考了一些文章和书籍，因为很杂，就不一一列出。

<!-- more -->

# 迭代器

## 使用生成器创建新的迭代模式

自定义 yield 生成器

```python
def frange(start, stop, increment):
    x = start
    while x < stop:
        yield x
        x += increment
```

[yield 的解释(stackoverflow 高赞)](https://pyzh.readthedocs.io/en/latest/the-python-yield-keyword-explained.html)

## 反向迭代

在自定义类上实现 \_\_reversed\_\_() 方法
这样做能让执行效率更高,因为省略了创建 list 的步骤

## 带有外部状态的生成器函数

这一节讲示例的类似于我之前实现的一个历史记录的功能(这也是我看了好久才看出来的)

```python
from collections import deque

class linehistory:
    def __init__(self, lines, histlen=3):
        self.lines = lines
        self.history = deque(maxlen=histlen)

    def __iter__(self):
        for lineno, line in enumerate(self.lines, 1):
            self.history.append((lineno, line))
            yield line

    def clear(self):
        self.history.clear()

with open('somefile.txt') as f:
    lines = linehistory(f)
    for line in lines:
        if 'python' in line:
            for lineno, hline in lines.history:
                print('{}:{}'.format(lineno, hline), end='')
```

### 索引值迭代

上面的实例中还可以看到一个有趣的东西,就是索引迭代

```python
for lineno, line in enumerate(f, 1):
```

可以使用上面的代码,来更加优雅地定义记数器,而非是像以前一样去使用 index.

## 迭代器切片

迭代器和生成器不能使用标准的切片操作，因为它们的长度事先我们并不知道(并且也没有实现索引)。 函数 islice() 返回一个可以生成指定元素的迭代器，它通过遍历并丢弃直到切片开始索引位置的所有元素。 然后才开始一个个的返回元素，并直到切片结束索引位置。

```python
>>> # Now using islice()
>>> import itertools
>>> for x in itertools.islice(c, 10, 20):
...     print(x)
```

**这里要着重强调的一点是 islice() 会消耗掉传入的迭代器中的数据。 必须考虑到迭代器是不可逆的这个事实。 所以如果你需要之后再次访问这个迭代器的话，那你就得先将它里面的数据放入一个列表中。**

## 跳过可迭代对象的开始部分

```python
#跳过开始的注释行
>>> from itertools import dropwhile
>>> with open('/etc/passwd') as f:
...     for line in dropwhile(lambda line: line.startswith('#'), f):
...         print(line, end='')
```

对比下面的功能,dropwhile 可以保留非开头部分的注释行

```python
with open('/etc/passwd') as f:
    lines = (line for line in f if not line.startswith('#'))
    for line in lines:
        print(line, end='')
```

## 排列组合的迭代

之所以将这一节记录下来,是因为想到了 C++的 next_permutations()函数, python 中的 itertools.permutations()实现了类似的功能

并且,也是一个启示.

> 当我们碰到看上去有些复杂的迭代问题时，最好可以先去看看 itertools 模块。 如果这个问题很普遍，那么很有可能会在里面找到解决方案！

## zip 迭代多序列

```python
>>> from itertools import zip_longest
>>> for i in zip_longest(a,b):
...     print(i)
```

zip 长度遵从 **最短序列**
zip 支持多序列(不仅仅是两个)

## 不同集合的迭代

```python
>>> from itertools import chain
>>> a = [1, 2, 3, 4]
>>> b = ['x', 'y', 'z']

# awo
for item in active_items:
    # Process item
    ...

for item in inactive_items:
    # Process item
    ...

# Inefficent
for x in a + b:
    ...

# Better
for x in chain(a, b):
    ...
```

这三种方法都能实现不同集合的迭代
第一种方法明显有失优雅
第二种方法开辟了额外的空间并且时间消耗更大
第三种方法就是本节介绍的方法,消耗更低,更优雅

## 展开嵌套序列

```python
from collections import Iterable

def flatten(items, ignore_types=(str, bytes)):
    for x in items:
        if isinstance(x, Iterable) and not isinstance(x, ignore_types):
            yield from flatten(x)
        else:
            yield x

items = [1, 2, [3, 4, [5, 6], 7], 8]
# Produces 1 2 3 4 5 6 7 8
for x in flatten(items):
    print(x)
```

这里的重点在于 **yield from** 的使用.
可以使用下面的代码来替代,不过,美观嘛.

```python
for i in flatten(x):
    yield i
```

**isinstance(x, Iterable)** 检查某个元素是否是可迭代的。 如果是的话， **yield from** 就会返回所有子例程的值。最终返回结果就是一个没有嵌套的简单序列了。

> 之前提到的对于字符串和字节的额外检查是为了防止将它们再展开成单个字符。 如果还有其他你不想展开的类型，修改参数 ignore_types 即可。

# 文件处理

## 打印输出到文件

```python
with open('d:/work/test.txt', 'wt') as f:
    print('Hello World!', file=f)
```

这里特别提一下,可以用作 log 记录,配合上文中的历史记录,可以制作一个自动化的 log 文件.

## 文件路径

### 获取文件路径

```python
>>> import os
>>> path = '/Users/beazley/Data/data.csv'

>>> # Get the last component of the path
>>> os.path.basename(path)
'data.csv'

>>> # Get the directory name
>>> os.path.dirname(path)
'/Users/beazley/Data'

>>> # Join path components together
>>> os.path.join('tmp', 'data', os.path.basename(path))
'tmp/data/data.csv'

>>> # Expand the user's home directory
>>> path = '~/Data/data.csv'
>>> os.path.expanduser(path)
'/Users/beazley/Data/data.csv'

>>> # Split the file extension
>>> os.path.splitext(path)
('~/Data/data', '.csv')
>>>
```

### 测试文件是否存在

```python
>>> import os
>>> os.path.exists('/etc/passwd')
True
>>> os.path.exists('/tmp/spam')
False
>>>

#进一步,测试是否为某一个特定形式的文件
>>> # Is a regular file
>>> os.path.isfile('/etc/passwd')
True

>>> # Is a directory
>>> os.path.isdir('/etc/passwd')
False

>>> # Is a symbolic link
>>> os.path.islink('/usr/local/bin/python3')
True

>>> # Get the file linked to
>>> os.path.realpath('/usr/local/bin/python3')
'/usr/local/bin/python3.3'
>>>
```

### 列出目录下的文件(非递归)

```python
import os.path

os.listdir('somedir')
```

#### 结合应用:筛选文件

```python
import os.path

# Get all regular files
names = [name for name in os.listdir('somedir')
        if os.path.isfile(os.path.join('somedir', name))]

# Get all dirs
dirnames = [name for name in os.listdir('somedir')
        if os.path.isdir(os.path.join('somedir', name))]

# 也可以使用后缀名判定
pyfiles = [name for name in os.listdir('somedir')
            if name.endswith('.py')]
```

### 获取文件的元信息

```python
# Example of getting a directory listing

import os
import os.path
import glob

pyfiles = glob.glob('*.py')

# Get file sizes and modification dates
name_sz_date = [(name, os.path.getsize(name), os.path.getmtime(name))
                for name in pyfiles]
for name, size, mtime in name_sz_date:
    print(name, size, mtime)

# Alternative: Get file metadata
file_metadata = [(name, os.stat(name)) for name in pyfiles]
for name, meta in file_metadata:
    print(name, meta.st_size, meta.st_mtime)
```

## 序列化对象

**pickle** 是一种 Python 特有的自描述的数据编码。 通过自描述，被序列化后的数据包含每个对象开始和结束以及它的类型信息。 因此，你无需担心对象记录的定义，它总是能工作。

```python
# pickle处理多个对象

>>> import pickle
>>> f = open('somedata', 'wb')
>>> pickle.dump([1, 2, 3, 4], f)
>>> pickle.dump('hello', f)
>>> pickle.dump({'Apple', 'Pear', 'Banana'}, f)
>>> f.close()
>>> f = open('somedata', 'rb')
>>> pickle.load(f)
[1, 2, 3, 4]
>>> pickle.load(f)
'hello'
>>> pickle.load(f)
{'Apple', 'Pear', 'Banana'}
>>>
```

> 千万不要对不信任的数据使用 pickle.load()。
> pickle 在加载时有一个副作用就是它会自动加载相应模块并构造实例对象。
> 但是某个坏人如果知道 pickle 的工作原理，
> 他就可以创建一个恶意的数据导致 Python 执行随意指定的系统命令。
> 因此，一定要保证 pickle 只在相互之间可以认证对方的解析器的内部使用。

pickle 对于大型的数据结构比如使用 array 或 numpy 模块创建的二进制数组效率并不是一个高效的编码方式。 如果你需要移动大量的数组数据，你最好是先在一个文件中将其保存为数组数据块或使用更高级的标准编码方式如 HDF5 (需要第三方库的支持)。

由于 pickle 是 Python 特有的并且附着在源码上，所有如果需要长期存储数据的时候不应该选用它。 例如，如果源码变动了，你所有的存储数据可能会被破坏并且变得不可读取。 坦白来讲，对于在数据库和存档文件中存储数据时，你最好使用更加标准的数据编码格式如 XML，CSV 或 JSON。 这些编码格式更标准，可以被不同的语言支持，并且也能很好的适应源码变更。

最后一点要注意的是 pickle 有大量的配置选项和一些棘手的问题。

# 函数式编程——初见

也许继"面向对象编程"之后，"函数式编程"会成为下一个编程的主流范式（paradigm）。

函数式编程与命令式编程最大的不同其实在于：
**函数式编程关心数据的映射，命令式编程关心解决问题的步骤**

## 定义

简单说，"函数式编程"是一种"编程范式"（programming paradigm），也就是如何编写程序的方法论。
它属于"结构化编程"的一种，主要思想是把运算过程尽量写成一系列嵌套的函数调用.

## 特点

- 函数是"第一等公民"
  函数与其他数据类型一样，处于平等地位，可以赋值给其他变量，也可以作为参数，传入另一个函数，或者作为别的函数的返回值。
- 只用"表达式"，不用"语句"
  函数式编程只要求把 I/O 限制到最小，不要有不必要的读写行为，保持计算过程的单纯性。
- 没有"副作用"
  函数要保持独立，所有功能就是返回一个新的值，没有其他行为，尤其是不得修改外部变量的值。
- 不修改状态
- 引用透明
  函数的运行不依赖于外部变量或"状态"，只依赖于输入的参数，任何时候只要参数相同，引用函数所得到的返回值总是相同的。

## 意义

- 代码简洁，开发快速
- 接近自然语言，易于理解
- 更方便的代码管理
  函数式编程不依赖、也不会改变外界的状态，只要给定输入参数，返回的结果必定相同。因此，每一个函数都可以被看做独立单元，很有利于进行单元测试（unit testing）和除错（debugging），以及模块化组合。
  易于复用.
- 易于"并发编程"
- 代码的热升级
