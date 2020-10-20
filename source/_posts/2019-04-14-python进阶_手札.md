---
layout: post
cid: 38
title: python进阶 手札
slug: 38
date: 2019/04/14 17:42:02
updated: 2019/04/14 17:42:02
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
thumb:
thumbStyle: default
hidden: false
---

关于 python 的内置函数以及一些高阶的技巧的学习

<!-- more -->

## map

map()是 Python 内置的高阶函数，它接收一个函数 f 和一个 list，并通过把函数 f 依次作用在 list 的每个元素上，得到一个新的 list 并返回。

```python
def f(x):
    return x*x
print map(f, [1, 2, 3, 4, 5, 6, 7, 8, 9])
```

## reduce

ps:python3.x 中，reduce 需要从 functools 里导入

reduce()函数也是 Python 内置的一个高阶函数。reduce()函数接收的参数和 map()类似，一个函数 f，一个 list，但行为和 map()不同，reduce()传入的函数 f 必须接收两个参数，reduce()对 list 的每个元素反复调用函数 f，并返回最终结果值。

例如，编写一个 f 函数，接收 x 和 y，返回 x 和 y 的和：

```python
def f(x, y):
    return x + y
```

调用 reduce(f, [1, 3, 5, 7, 9])时，reduce 函数将做如下计算：

先计算头两个元素：f(1, 3)，结果为 4；
再把结果和第 3 个元素计算：f(4, 5)，结果为 9；
再把结果和第 4 个元素计算：f(9, 7)，结果为 16；
再把结果和第 5 个元素计算：f(16, 9)，结果为 25；
由于没有更多的元素了，计算结束，返回结果 25。
上述计算实际上是对 list 的所有元素求和。虽然 Python 内置了求和函数 sum()，但是，利用 reduce()求和也很简单。

reduce()还可以接收第 3 个可选参数，作为计算的初始值。如果把初始值设为 100，计算：

```python
reduce(f, [1, 3, 5, 7, 9], 100)
```

结果将变为 125，因为第一轮计算是：

计算初始值和第一个元素：f(100, 1)，结果为 101。

## filter

filter()函数是 Python 内置的另一个有用的高阶函数，filter()函数接收一个函数 f 和一个 list，这个函数 f 的作用是对每个元素进行判断，返回 True 或 False，filter()根据判断结果自动过滤掉不符合条件的元素，返回由符合条件元素组成的新 list。

例如，要从一个 list [1, 4, 6, 7, 9, 12, 17]中删除偶数，保留奇数，首先，要编写一个判断奇数的函数：

```python
def is_odd(x):
    return x % 2 == 1
```

然后，利用 filter()过滤掉偶数：

```python
filter(is_odd, [1, 4, 6, 7, 9, 12, 17])
```

结果：[1, 7, 9, 17]

利用 filter()，可以完成很多有用的功能，例如，删除 None 或者空字符串：

```python
def is_not_empty(s):
    return s and len(s.strip()) > 0
filter(is_not_empty, ['test', None, '', 'str', '  ', 'END'])
```

结果：['test', 'str', 'END']

**注意**: s.strip(rm) 删除 s 字符串中开头、结尾处的 rm 序列的字符。

当 rm 为空时，默认删除空白符（包括'\n', '\r', '\t', ' ')，如下：

```python
a = '     123'
a.strip()
```

结果： '123'

```python
a='\t\t123\r\n'
a.strip()
```

结果：'123'

## sort

Python 内置的 sorted()函数可对 list 进行排序：

```python
>>>sorted([36, 5, 12, 9, 21])
```

[5, 9, 12, 21, 36]
但 sorted()也是一个高阶函数，它可以接收一个比较函数来实现自定义排序，比较函数的定义是:

传入两个待比较的元素 x, y，**如果 x 应该排在 y 的前面，返回 -1，如果 x 应该排在 y 的后面，返回 1。如果 x 和 y 相等，返回 0**。

因此，如果我们要实现倒序排序，只需要编写一个 reversed_cmp 函数：

```python
def reversed_cmp(x, y):
    if x > y:
        return -1
    if x < y:
        return 1
    return 0
```

这样，调用 sorted() 并传入 reversed_cmp 就可以实现倒序排序：

```python
>>> sorted([36, 5, 12, 9, 21], reversed_cmp)
```

[36, 21, 12, 9, 5]

## 闭包

像这种内层函数引用了外层函数的变量（参数也算变量），然后返回内层函数的情况，称为闭包（Closure）。

闭包的特点是返回的函数还引用了外层函数的局部变量，所以，要正确使用闭包，就要确保引用的局部变量在函数返回后不能变。

**返回函数不要引用任何循环变量，或者后续会发生变化的变量。**

## 匿名函数

高阶函数可以接收函数做参数，有些时候，我们不需要显式地定义函数，直接传入匿名函数更方便。

在 Python 中，对匿名函数提供了有限支持。还是以 map()函数为例，计算 f(x)=x2 时，除了定义一个 f(x)的函数外，还可以直接传入匿名函数：

```python
>>> map(lambda x: x * x, [1, 2, 3, 4, 5, 6, 7, 8, 9])
```

[1, 4, 9, 16, 25, 36, 49, 64, 81]
通过对比可以看出，匿名函数 lambda x: x \* x 实际上就是：

```python
def f(x):
    return x * x
```

关键字 lambda 表示匿名函数，冒号前面的 x 表示函数参数。

匿名函数有个限制，就是只能有一个表达式，不写 return，返回值就是该表达式的结果。

使用匿名函数，可以不必定义函数名，直接创建一个函数对象，很多时候可以简化代码：

```python
>>> sorted([1, 3, 9, 5, 0], lambda x,y: -cmp(x,y))
```

[9, 5, 3, 1, 0]
返回函数的时候，也可以返回匿名函数：

```python
>>> myabs = lambda x: -x if x < 0 else x
>>> myabs(-1)
1
>>> myabs(1)
1
```

# 装饰器

可以极大地简化代码，避免每个函数编写重复性代码

用处：
打印日志
检测性能
数据库事务
url 路由
……

检测性能示例：

```python
import time

def performance(f):
    def fn(*args, **kw):
        t1 = time.time()
        r = f(*args, **kw)
        t2 = time.time()
        print 'call %s() in %fs' % (f.__name__, (t2 - t1))
        return r
    return fn

@performance
def factorial(n):
    return reduce(lambda x,y: x*y, range(1, n+1))

print factorial(10)
```

## 编写带参数 decorator

考察上一节的 @log 装饰器：

```python
def log(f):
    def fn(x):
        print 'call ' + f.__name__ + '()...'
        return f(x)
    return fn
```

发现对于被装饰的函数，log 打印的语句是不能变的（除了函数名）。

如果有的函数非常重要，希望打印出'[INFO] call xxx()...'，有的函数不太重要，希望打印出'[DEBUG] call xxx()...'，这时，log 函数本身就需要传入'INFO'或'DEBUG'这样的参数，类似这样：

```python
@log('DEBUG')
def my_func():
    pass
把上面的定义翻译成高阶函数的调用，就是：

my_func = log('DEBUG')(my_func)
上面的语句看上去还是比较绕，再展开一下：

log_decorator = log('DEBUG')
my_func = log_decorator(my_func)
上面的语句又相当于：

log_decorator = log('DEBUG')
@log_decorator
def my_func():
    pass
```

所以，带参数的 log 函数首先返回一个 decorator 函数，再让这个 decorator 函数接收 my_func 并返回新函数：

```python
def log(prefix):
    def log_decorator(f):
        def wrapper(*args, **kw):
            print '[%s] %s()...' % (prefix, f.__name__)
            return f(*args, **kw)
        return wrapper
    return log_decorator

@log('DEBUG')
def test():
    pass
print test()
```

执行结果：

> [DEBUG] test()...
> None

对于这种 3 层嵌套的 decorator 定义，你可以先把它拆开：

> \# 标准 decorator:

```python
    def log_decorator(f):
    def wrapper(*args, **kw):
        print '[%s] %s()...' % (prefix, f.__name__)
        return f(*args, **kw)
    return wrapper
    return log_decorator
```

> \# 返回 decorator:

```python
def log(prefix):
    return log_decorator(f)
```

拆开以后会发现，调用会失败，因为在 3 层嵌套的 decorator 定义中，最内层的 wrapper 引用了最外层的参数 prefix，所以，把一个闭包拆成普通的函数调用会比较困难。不支持闭包的编程语言要实现同样的功能就需要更多的代码。

示例 1：（info、debug）

```python
def log(prefix):
    def log_decorator(f):
        def wrapper(*args, **kw):
            print '[%s] %s()...' % (prefix, f.__name__)
            return f(*args, **kw)
        return wrapper
    return log_decorator

@log('DEBUG')
def test():
    pass
print test()
```

示例 2：ms

```python
import time

def performance(unit):
    def per_decorator(f):
        def timecul(*arg,**kw):
            t1=time.time()
            r=f(*arg,**kw)
            t2=time.time()
            print 'call %s() in %f %s' % (f.__name__, (t2 - t1),unit)
            return r
        return timecul
    return per_decorator

@performance('ms')
def factorial(n):
    return reduce(lambda x,y: x*y, range(1, n+1))

print factorial(10)
```

## decorator 完善

@decorator 可以动态实现函数功能的增加，但是，经过@decorator“改造”后的函数，和原函数相比，除了功能多一点外，有没有其它不同的地方？

在没有 decorator 的情况下，打印函数名：

```python
def f1(x):
    pass
print f1.__name__
```

输出： f1

有 decorator 的情况下，再打印函数名：

```python
def log(f):
    def wrapper(*args, **kw):
        print 'call...'
        return f(*args, **kw)
    return wrapper
@log
def f2(x):
    pass
print f2.__name__
```

输出： wrapper

可见，由于 decorator 返回的新函数函数名已经不是'f2'，而是@log 内部定义的'wrapper'。这对于那些依赖函数名的代码就会失效。decorator 还改变了函数的**doc**等其它属性。如果要让调用者看不出一个函数经过了@decorator 的“改造”，就需要把原函数的一些属性复制到新函数中：

```python
def log(f):
    def wrapper(*args, **kw):
        print 'call...'
        return f(*args, **kw)
    wrapper.__name__ = f.__name__
    wrapper.__doc__ = f.__doc__
    return wrapper
```

这样写 decorator 很不方便，因为我们也很难把原函数的所有必要属性都一个一个复制到新函数上，所以 Python 内置的 functools 可以用来自动化完成这个“复制”的任务：

```python
import functools
def log(f):
    @functools.wraps(f)
    def wrapper(*args, **kw):
        print 'call...'
        return f(*args, **kw)
    return wrapper
```

最后需要指出，由于我们把原函数签名改成了(\*args, \*\*kw)，因此，无法获得原函数的原始参数信息。即便我们采用固定参数来装饰只有一个参数的函数：

```python
def log(f):
    @functools.wraps(f)
    def wrapper(x):
        print 'call...'
        return f(x)
    return wrapper
```

也可能改变原函数的参数名，因为新函数的参数名始终是 'x'，原函数定义的参数名不一定叫 'x'。

## 偏函数

functools.partial 就是帮助我们创建一个偏函数的，不需要我们自己定义 int2()，可以直接使用下面的代码创建一个新的函数 int2：

```python
>>> import functools
>>> int2 = functools.partial(int, base=2)
>>> int2('1000000')
64
>>> int2('1010101')
85
```

所以，functools.partial 可以把一个参数多的函数变成一个参数少的新函数，少的参数需要在创建时指定默认值，这样，新函数调用的难度就降低了。

# 类

## 按照类的某个属性进行排序

> L2 = sorted(L1, lambda p1, p2: cmp(p1.name, p2.name))

具体：

```python
class Person(object):
    pass

p1 = Person()
p1.name = 'Bart'

p2 = Person()
p2.name = 'Adam'

p3 = Person()
p3.name = 'Lisa'

L1 = [p1, p2, p3]
L2 = sorted(L1, lambda p1, p2: cmp(p1.name, p2.name))

print L2[0].name
print L2[1].name
print L2[2].name
```

## 初始化

```python
def __init__(self,name,gender,birth,**kw):
    for k, v in kw.iteritems():
        setattr(self, k, v)
```

这里的 \*\*kw 表示接受 **任意关键字参数**
setattr()设置参数

ps:在 pyhton3.x 中 iteritems 变更为 items

## 访问限制

Python 对属性权限的控制是通过属性名来实现的，如果一个属性由双下划线开头(\_\_)，该属性就无法被外部访问。

只有以双下划线开头的"\_\_job"不能直接被外部访问。

但是，如果一个属性以"\_\_xxx\_\_"的形式定义，那它又可以被外部访问了，以"\_\_xxx\_\_"定义的属性在 Python 的类中被称为特殊属性，有很多预定义的特殊属性可以使用，通常我们不要把普通属性用"\_\_xxx\_\_"定义。

以单下划线开头的属性"\_xxx"虽然也可以被外部访问，但是，按照习惯，他们不应该被外部访问。

## \_\_init\_\_ 内外定义区别

![e48d9f5d14a056cc9f6c8ab0112dda2d.png](evernotecid://633A359B-908B-4B09-BD14-4B8DC1F44EF5/appyinxiangcom/18822571/ENResource/p135)

## 类属性和实例属性名字冲突怎么办

当实例属性和类属性重名时，实例属性优先级高，它将屏蔽掉对类属性的访问。

## 类方法

和属性类似，方法也分实例方法和类方法。

在 class 中定义的全部是实例方法，实例方法第一个参数 self 是实例本身。

要在 class 中定义类方法，需要这么写：

```python
class Person(object):
    count = 0
    @classmethod
    def how_many(cls):
        return cls.count
    def __init__(self, name):
        self.name = name
        Person.count = Person.count + 1

print Person.how_many()
p1 = Person('Bob')
print Person.how_many()
```

通过标记一个 @classmethod，该方法将绑定到 Person 类上，而非类的实例。类方法的第一个参数将传入类本身，通常将参数名命名为 cls，上面的 cls.count 实际上相当于 Person.count。

因为是在类上调用，而非实例上调用，因此类方法无法获得任何实例变量，只能获得类的引用。

# 继承

如果已经定义了 Person 类，需要定义新的 Student 和 Teacher 类时，可以直接从 Person 类继承：

```python
class Person(object):
    def __init__(self, name, gender):
        self.name = name
        self.gender = gender
定义Student类时，只需要把额外的属性加上，例如score：

class Student(Person):
    def __init__(self, name, gender, score):
        super(Student, self).__init__(name, gender)
        self.score = score
```

一定要用 super(Student, self).**init**(name, gender) 去初始化父类，否则，继承自 Person 的 Student 将没有 name 和 gender。

函数 super(Student, self)将返回当前类继承的父类，即 Person ，然后调用**init**()方法，注意 self 参数已在 super()中传入，在**init**()中将隐式传递，不需要写出（也不能写）。

## 判断示例的类型

函数 isinstance()可以判断一个变量的类型，既可以用在 Python 内置的数据类型如 str、list、dict，也可以用在我们自定义的类，它们本质上都是数据类型。

假设有如下的 Person、Student 和 Teacher 的定义及继承关系如下：

```python
class Person(object):
    def __init__(self, name, gender):
        self.name = name
        self.gender = gender

class Student(Person):
    def __init__(self, name, gender, score):
        super(Student, self).__init__(name, gender)
        self.score = score

class Teacher(Person):
    def __init__(self, name, gender, course):
        super(Teacher, self).__init__(name, gender)
        self.course = course

p = Person('Tim', 'Male')
s = Student('Bob', 'Male', 88)
t = Teacher('Alice', 'Female', 'English')
当我们拿到变量 p、s、t 时，可以使用 isinstance 判断类型：

>>> isinstance(p, Person)
True    # p是Person类型
>>> isinstance(p, Student)
False   # p不是Student类型
>>> isinstance(p, Teacher)
False   # p不是Teacher类型
```

这说明在继承链上，一个父类的实例不能是子类类型，因为子类比父类多了一些属性和方法。

我们再考察 s ：

```python
>>> isinstance(s, Person)
True    # s是Person类型
>>> isinstance(s, Student)
True    # s是Student类型
>>> isinstance(s, Teacher)
False   # s不是Teacher类型
```

s 是 Student 类型，不是 Teacher 类型，这很容易理解。但是，s 也是 Person 类型，因为 Student 继承自 Person，虽然它比 Person 多了一些属性和方法，但是，把 s 看成 Person 的实例也是可以的。

这说明在一条继承链上，一个实例可以看成它本身的类型，也可以看成它父类的类型。

## 获取对象信息

如果已知一个属性名称，要获取或者设置对象的属性，就需要用 getattr() 和 setattr( )函数了：

```python
>>> getattr(s, 'name')  # 获取name属性
'Bob'

>>> setattr(s, 'name', 'Adam')  # 设置新的name属性

>>> s.name
'Adam'

>>> getattr(s, 'age')  # 获取age属性，但是属性不存在，报错：
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'Student' object has no attribute 'age'

>>> getattr(s, 'age', 20)  # 获取age属性，如果属性不存在，就返回默认值20：
20
```

# 特殊函数

\_\_str** 用户 默认输出
\_\_repr** 开发者 默认输出

### \_\_cmp\_\_

对 int、str 等内置数据类型排序时，Python 的 sorted() 按照默认的比较函数 cmp 排序，但是，如果对一组 Student 类的实例排序时，就必须提供我们自己的特殊方法 \_\_cmp\_\_()：

```python
class Student(object):
    def __init__(self, name, score):
        self.name = name
        self.score = score
    def __str__(self):
        return '(%s: %s)' % (self.name, self.score)
    __repr__ = __str__

    def __cmp__(self, s):
        if self.name < s.name:
            return -1
        elif self.name > s.name:
            return 1
        else:
            return 0
```

### 数学运算

\_\_add** 加
\_\_sub** 减
\_\_mul** 乘
\_\_div** 除

### property

Python 支持高阶函数，在函数式编程中我们介绍了装饰器函数，可以用装饰器函数把 get/set 方法“装饰”成属性调用：

```python
class Student(object):
    def __init__(self, name, score):
        self.name = name
        self.__score = score
    @property
    def score(self):
        return self.__score
    @score.setter
    def score(self, score):
        if score < 0 or score > 100:
            raise ValueError('invalid score')
        self.__score = score
```

注意: 第一个 score(self)是 get 方法，用@property 装饰，第二个 score(self, score)是 set 方法，用@score.setter 装饰，@score.setter 是前一个@property 装饰后的副产品。

现在，就可以像使用属性一样设置 score 了：

```python
>>> s = Student('Bob', 59)
>>> s.score = 60
>>> print s.score
60
>>> s.score = 1000
Traceback (most recent call last):
  ...
ValueError: invalid score
```

说明对 score 赋值实际调用的是 set 方法。

#### 其他解释

@property 就是把实例方法当做属性调用的语法,你看下面是直接 print s.grade，相当于调用了 grade 这个属性，所以用@property

可以把这种写法当成 python 的语法规范，比如为什么定义一个函数要用 def，一样的道理。
property 是“属性”的意思，@property 就是把实例方法当做属性调用的语法。set 是“设置”的意思，setter 就是“设置器”。@score.setter 就是给这个类下的 score 属性重新设定值的时候，调用这个方法。

> 按实际的用法，如果一个语句是 s.score，就是要获取属性，所以 python 会直接找@property 这个装饰器下面有没有 score 这个方法，有就直接调用了。如果另一个语句是 s.score = 99，这就是要设置属性，python 就会去找@score.setter 这个装饰器，并运行下面的方法。

### \_\_slots\_\_

\_\_slots**的目的是限制当前类所能拥有的属性，如果不需要添加任意动态的属性，使用**slots\_\_也能节省内存。

### \_\_call\_\_

在 Python 中，函数其实是一个对象：

```pyhton
>>> f = abs
>>> f.__name__
'abs'
>>> f(-123)
123
```

由于 f 可以被调用，所以，f 被称为可调用对象。

所有的函数都是可调用对象。

一个类实例也可以变成一个可调用对象，只需要实现一个特殊方法**call**()。

我们把 Person 类变成一个可调用对象：

```python
class Person(object):
    def __init__(self, name, gender):
        self.name = name
        self.gender = gender

    def __call__(self, friend):
        print 'My name is %s...' % self.name
        print 'My friend is %s...' % friend
```

现在可以对 Person 实例直接调用：

```python
>>> p = Person('Bob', 'male')
>>> p('Tim')
My name is Bob...
My friend is Tim...
```

单看 p('Tim') 你无法确定 p 是一个函数还是一个类实例，所以，在 Python 中，函数也是对象，对象和函数的区别并不显著。
