---
title: 2022-11-14-pytest_mock_counter
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2022-11-15 11:20:44
updated:
categories:
  - 源流清泉
  - Python
tags:
  - Python
  - Test
customSummary:
thumb:
thumbDesc:
thumbSmall:
---


## 前言

本篇的目的是在 `Python` 的 Test 框架中添加一个 __mock 函数使用计数器__ 的逻辑. 该计数器的目的是, 在调用第三方api接口时, 计算某一个流程中的调用次数是否合理. 在流程(或调用关系)比较复杂的时候实用性较高.

<!-- more -->

## 初期设计

初期设计考虑两个方面.

1. 计数器的设计  
    计数器应该具有一定的扩展性. 因为不同的流程所调用的接口可能不同. 除此之外, 计数器应该是一个独立的对象, 能够对结果进行校验与反馈. 所以在设计初期笔者选择是使用观察者模式进行设计.

2. 注入流程的设计
    注入流程应该尽量简单, 改动较小. 目的是能够通过在现有代码上添加装饰器的方法, 实现最小限度的更改(实际上这也是比较科学的更改).

## 开发阶段

### 原代码

这里先贴一下需要进行优化的代码. 这是对代码模型进行了简化之后的结果, __mock_collect()__ 中包含的 `check_items` 这个 mock 则是实际我们调用的第三方接口, 它会从 `item_manager` 中得到玩家目前所拥有的道具.

目前需要解决的就是, 在业务函数的运行流程中计算 `check_items` 这个函数一共调用了多少次. 因为实际上在业务运行是, 默认是不会出现流程外的道具变动, 所以这个函数只需要调用一次就能实现业务的流转, 更多次数的调用就有点浪费性能了.

```python
class TestCase:
    item_manager = [100, 101, 999] # 简化, 非关键的内容
    
    def get_item_manager(self, *_, **__):
        return self.item_manager

    def mock_collect():
        """
        这里是存放 mock 函数的集合
        """
        self.mocker = patch.object(
            api, "check_items", new=self.get_item_manager
        )
        # ... other mocks
```

### 计数器设计

单纯的计数器实现是很容易的, 我们可以设计一个 `Counter` 类, 它包含一个 _int_ 类型的 `cnt` 类变量. 同时, _尽量少的更改_ 意味着我们最好在源头的进行改动, 所以, 在每次调用 `get_item_manager` 这个函数的时候, 顺便对 `cnt` 变量进行自增即可.

但是实际上我们调用的 api 不止一个, 所以我们需要对 `Counter` 进行优化, 比如将 `cnt` 变为一个 `Dict[str, int]` 类型的变量 `func_cnt_mapping`. 但是这意味着我们需要进入到每个函数的内部, 然后加上 `func_cnt_mapping[func_name] += 1` 之类的奇怪写法, 甚至还需要加上 `func_cnt_mappint.setdefault(func_name, 0)` 这样的语法来提前声明.

于是, 很自然地笔者开始对该计数思路进行`装饰器改造`. 最初的改造结果如下所示.

```python
class Counter:
def decorate(func):
    @dataclasses.dataclass
    class CC:
        cnt: int = 0

    counter = {}
    
    @classmethod
    def incr(cls):
        def decorate(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                if func.__qualname__ not in cls.counter:
                    cls.counter[func.__qualname__] = cls.CC()
                cnt_obj = cls.counter[func.__qualname__]
                cnt_obj.cnt += 1
                return func(*args, **kwargs)

            return wrapper

        return decorate
```

该装饰器会在初次进入的时候, 生成一个函数命名(含 namespace )与计数器(_CC_) 的映射关系, 然后在每次进入的时候对关联的计数器进行自增. 其调用方式如下所示.

```python
@Counter.incr
def get_item_manager(self, *_, **__):
    return self.item_manager
```

### 优化

到这一步, 我们可以在业务流程开始的时候初始化一下 `Counter`, 然后在业务流程结束的时候遍历一下 `Counter` 所挂载的各个函数与其计数, 看看是否符合预期即可.

但是这又需要我们在每个业务流程的前后写大量的 __初始化__ 和 __判断__ 代码, 于是笔者使用 __上下文机制__ 来进行进一步的优化.

```python
class Gestapo:
    def __enter__(self):
        Counter.counter = {}

    def __exit__(self, exc_type, exc_val, exc_tb):
        for name, cc_ in Counter.counter.items():
            if cc_.cnt > cc_.thresh_hold:
                raise AssertionError(cc_)

        Counter.counter.clear()
```

在 `CC` 中加入一个 `thresh_hold` 成员, 这是允许调用的最大次数, 然后在函数对出的时候, 校验一下 `cc_.cnt` 与 `cc.thresh_hold` 的关系, 就可以知道函数的调用此时是否超限.

不过在抛出超限异常的时候 (`raise AssertionError(cc_)`), 笔者希望得到更具体的一些报错的信息, 所以可以对 `CC` 的输出进行一个优化.

```python

class Counter:
    class CC:
    ...
    def __repr__(self):
        return (
            f"\n"
            f"cnt: {self.cnt} but except\n"
            f"stack:\n{f'-----------{os.linesep}'.join(self.stack)}"
        )
    
    ...
    @classmethod
    def incr(cls, thresh_hold):
        def decorate(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                ...
                call_stack = []
                for line in traceback.format_stack():
                    if re.search("...", line): # 匹配关键的调用栈
                        call_stack.append(line.strip().split("\n")[1])
                cnt_obj.stack.append("\n".join(call_stack))
                return func(*args, **kwargs)

            return wrapper

        return decorate
```

通过修改 _magic\_method_ , 来实现 `CC` 对象的默认输出内容. 然后使用 `traceback` 模块来追踪调用到这个函数的上下文, 从而判断哪些上下文中的接口调用方式是可以优化的.

## 总结

我们的最终代码形式如下所示. 不只是第三方接口调用, 在任何需要进行计数的地方(函数)都可以挂上该计数器.

```python
class Counter:
    @dataclasses.dataclass
    class CC:
        thresh_hold: int = 1
        cnt: int = 0
        stack: typing.List[str] = dataclasses.field(default_factory=list)

        def clear(self):
            self.cnt = 0
            self.stack.clear()

        def __repr__(self):
            return (
                f"\n"
                f"cnt: {self.cnt} but except\n"
                f"stack:\n{f'-----------{os.linesep}'.join(self.stack)}"
            )

    class Gestapo:
        def __enter__(self):
            Counter.counter = {}

        def __exit__(self, exc_type, exc_val, exc_tb):
            for name, cc_ in Counter.counter.items():
                if cc_.cnt > cc_.thresh_hold:
                    raise AssertionError(cc_)

            Counter.counter.clear()

    counter: typing.Dict[str, CC] = {}

    @classmethod
    def incr(cls, thresh_hold):
        def decorate(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                if func.__qualname__ not in cls.counter:
                    cls.counter[func.__qualname__] = cls.CC(thresh_hold=thresh_hold)
                cnt_obj = cls.counter[func.__qualname__]
                cnt_obj.cnt += 1
                call_stack = []
                for line in traceback.format_stack():
                    if re.search("...", line): # 匹配关键的调用栈
                        call_stack.append(line.strip().split("\n")[1])
                cnt_obj.stack.append("\n".join(call_stack))
                return func(*args, **kwargs)

            return wrapper

        return decorate
```

## Reference

- [How to Add New Line in Python f-strings](https://towardsdatascience.com/how-to-add-new-line-in-python-f-strings-7b4ccc605f4a)  
- [Python trackback](https://docs.python.org/3/library/traceback.html)  
- [Python dataclasses](https://docs.python.org/3/library/dataclasses.html)
