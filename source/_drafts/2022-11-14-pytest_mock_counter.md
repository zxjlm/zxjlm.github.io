---
title: generate-book-quote-of-paper
date: 2022-11-14 17:05:18
tags:
---

## 前言

本篇的目的是在 `Django` 的 Test 框架中添加一个 __mock 函数使用计数器__ 的逻辑. 该计数器的目的是, 在调用第三方api接口时, 计算某一个流程中的调用次数是否合理. 在流程比较复杂(或者在一些调用关系比较糟糕的旧代码上)的时候实用性较高.

## 初期设计

初期设计考虑两个方面.

1. 计数器的设计
    计数器应该具有一定的扩展性. 因为不同的流程所调用的接口可能不同.

2. 注入流程的设计
    注入流程应该尽量简单, 改动较小.

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
                    if re.search("event/(model|view)", line):
                        call_stack.append(line.strip().split("\n")[1])
                cnt_obj.stack.append("\n".join(call_stack))
                return func(*args, **kwargs)

            return wrapper

        return decorate
```

```python
class TestCase:
    item_manager = [100, 101, 999] # 简化, 非关键的内容

    def mock_collect():
        self.mocker = patch.object(
            api, "check_items", new=self.get_item_manager
        )

    @Counter.incr(1)
        def get_item_manager(self, *_, **__):
            return self.item_manager
```

## Reference
https://towardsdatascience.com/how-to-add-new-line-in-python-f-strings-7b4ccc605f4a