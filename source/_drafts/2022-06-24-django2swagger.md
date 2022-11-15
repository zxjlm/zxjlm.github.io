---
title: Django 生成 swagger 描述文件
date: 2022-06-24 21:04:18
tags:
---


本篇主要是讲如何从 Django Api 生成出 swagger 描述文件. 它具有如下的特性:

1. 基于 inspect \ (ast) 采用静态分析的思路, 不依赖业务代码, 能够文档先于项目
2. 嵌入 Django CMD
3. 生成所用到的代码不会影响生产环境性能

之前接触过 [drf](https://www.django-rest-framework.org/), 一个基于 Django 的 rest 框架. 由于深渡契合 rest, 有着严格的项目结构约束, 所以能够直接从代码文件生成出对应的 `swagger` 描述文件. 但是这套代码是无法直接移殖到 Django 上面的, 因为后者的结构比较松散, 没有一种万金油的生成策略.

所以, 本篇所提供的生成方案具有以下约束:

1. 需要封装一层装饰器, 并应用与所有需要生成文档的视图函数.
2. 依赖 pydantic (或者平替 cattrs \ schema 等)

<!-- more -->

## 设计思路

方案归根结底是为了解决问题而产生的. 在此之前, 开发组的后端与前端的接口约定是人工书写于一份 `md` 文件, 这样的好处是灵活方便, 但是缺点同样明显, 无法及时的响应更改, 很可能因为过程的缺失而导致文档与实际接口返回不一致的情况, 以及, 文档的参数规定独立于代码的参数校验, 如果代码需要进行参数校验, 则相当于是要做两份同样的工作.

笔者的设计思路主要就是集中于解决这两个痛点. 笔者在 Django 的开发上也算是小有经验, 所以采用了由果溯因的设计方法, 先定下一个大体的流程.

1. 使用 `python manage.py generate_swagger` 启动
2. 通过 `conf` 直接收集 `urlpatterns`  → 提取 urls 和对应的 views
3. 获得 decorator 函数签名, 并据此解析出入参与出参的结构
4. 生成对应的 `swagger.yaml` \ `swagger.json`

接下来就可以看一看每一步可能出现的问题, 以及探索对应的解决思路.

### Step1

第一步的直接 Ctrl+cv 即可, 不过值得注意的是, 如果采用的是 TDD 的开发模式, 或者对测试有特殊需求, Django 的 command 单元测试如何书写?

### Step2

这一步其实可以参考 `django_extensions` 的 `show_urls` 方法.

首先, Django command 所携带的 `urlconf` 参数, 该参数是总 `urls.py` 的模块信息.

然后, 通过这个模块信息的 `urlpatterns` 方法可以取到所有的 `app` 的 `urls.py` 的模块信息.

最后, 通过这些模块信息, 能够解析出所有的绑定的视图函数.

到这一步, 可以得到由 (路径, 视图函数) 组成的接口列表.

### Step3

自动化生成不可避免地需要对代码框架结构进行约束, 不然就需要考虑无穷无尽的特殊情况. 我的约束方式是为每个视图函数添加装饰器, 该装饰器至少会包含3个参数, 即: 入参 / 出参 / 方法(method).

这样, 在 Step2 中得到的列表就能够进行扩充, 由 __视图函数__ 推导出 (__入参__ / __出参__ / __方法__ ) 的元组信息. 而视图函数本身又能够由 \_\_doc\_\_ 属性来得到对应的函数说明(这里笔者把这个说明等价于接口说明).

至此, 能得到包含 (路径, 视图函数, 入参, 出参, 方法, 接口说明) 的接口列表.

### Step4

以上的信息足够支撑起一份 `swagger` 了, 笔者这里选择使用 `pydantic`, 它的 `model_schema()` 函数能够直接将字段模型(Basemodel)解析为 swagger 格式.

> 如果不希望引入额外的依赖, 也可以参考实现一个 `Basemodel` 结构, 然后直接 copy `model_schema` 的代码就行.

## 代码

### Step1: CMD

满足如下的结构就可以初始化一个 Django CMD 了.

```python
class Command(BaseCommand):
    help = "Generate json format swagger file for the project."

    def add_arguments(self, parser):
        super().add_arguments(parser)

    def handle(self, *args, **options):
        urlconf = options["urlconf"]
        urlconf = __import__(getattr(settings, urlconf), {}, {}, [""])

        # ...
```

### Step2: 提取视图函数

这一步的代码可以直接照抄 `django_extension` 的 __show\_urls__ 命令的 _extract\_views\_from\_urlpatterns()_ 方法. 笔者对这段代码按照项目的实际情况进行了删减.

> from django_extensions.management.commands import show_urls

```python
    def extract_views_from_urlpatterns(self, urlpatterns, base="", namespace=None):
        """
        Return a list of views from a list of urlpatterns.

        Each object in the returned list is a three-tuple: (view_func, regex, name)
        """
        views = []
        for p in urlpatterns:
            if isinstance(p, (URLPattern, RegexURLPattern)):
                try:
                    if not p.name:
                        name = p.name
                    elif namespace:
                        name = "{0}:{1}".format(namespace, p.name)
                    else:
                        name = p.name
                    pattern = describe_pattern(p)
                    views.append((p.callback, base + pattern, name))
                except ViewDoesNotExist:
                    continue
            elif isinstance(p, (URLResolver, RegexURLResolver)):
                try:
                    patterns = p.url_patterns
                except ImportError:
                    continue
                if namespace and p.namespace:
                    _namespace = "{0}:{1}".format(namespace, p.namespace)
                else:
                    _namespace = p.namespace or namespace
                pattern = describe_pattern(p)
                views.extend(
                    self.extract_views_from_urlpatterns(
                        patterns, base + pattern, namespace=_namespace
                    )
                )
            else:
                raise TypeError("%s does not appear to be a urlpattern object" % p)
        return views
```

### Step3: 装饰器

第三步包含两个部分, 其一是装饰器, 其二是装饰器的解析函数.

其中, 装饰器的定义如下.

```python
def parse_params(
    *,
    method,
    request_data,
    response_data,
)
    def func_wrapper(func: typing.Callable):
        @wraps(func)
        def args_wrapper(request: HttpRequest, *args, **kw):
            ...

        return args_wrapper
    return func_wrapper
```

这里采用了一个 _trick_, 也就是 "*" 符号, 它能够确保之后的参数都是以 `method="", request_data="", response_data=""` 这样的形式, 而非单纯的 `"", "", ""` . 这样做的目的是为了能够使用正则表达式分析出这些参数的指向对象, 然后动态加载对应的 `Model` 对象.

> 为什么要动态加载?
>
> 动态加载的核心目标是, 在项目的业务代码完成之前就能够生成出对应的 swagger 文件. 在前后端并行工作的时候, 这一点是非常重要的, 我们只需要定义好对应的参数模型, 就能够将其转换为对应的 swagger 文本, 而不需要经过任何业务代码逻辑.

然后, 装饰器的解析函数如下.

```python
    def generate_swagger(self, view_functions, version):
        paths: t.Dict[str, dict] = {}
        components: t.Dict[str, t.Dict[str, t.Union[str, int, t.Dict]]] = {
            "schemas": {}
        }

        for pattern in view_functions:
            self.parser_urlpattern(paths, components, pattern)

        return {
            "openapi": "3.0.3",
            "info": {
                "title": os.getenv("PROJECT_NAME", "NULL"),
                "version": version,
            },
            "components": components,
            "paths": paths,
            "tags": [],
        }

    def parser_urlpattern(self, paths: dict, components: dict, urlpattern):
        path_object: dict = {
            "parameters": [],
            "responses": {},
        }
        pattern_func, regex, url_name = urlpattern

        if hasattr(pattern_func, "__name__"):
            func_name = pattern_func.__name__
        elif hasattr(pattern_func, "__class__"):
            func_name = "%s()" % pattern_func.__class__.__name__
        else:
            func_name = re.sub(r" at 0x[\da-f]+", "", repr(pattern_func))

        module = importlib.import_module(pattern_func.__module__)
        func = getattr(module, func_name)
        source = inspect.getsource(func)

        if func.__doc__ is not None:
            summary, *description = func.__doc__.splitlines()
            path_object["description"] = "\n".join(description)
            path_object["summary"] = summary

        try:
            base_app = pattern_func.__module__.split(".")[0]
            data_module = importlib.import_module(
                "{}.{}.{}".format(base_app, "utils", "data_schema")
            )
        except Exception as _e:
            logging.warning(_e)
            return

        path_object["tags"] = [base_app]
        path: str = simplify_regex(regex)
        paths.setdefault(path, {})
        method = re.search(r"method=\"(\w+)\"", source)
        if method:
            paths[path][method.group(1).lower()] = path_object

        response_data = re.search(r"response_data=([\w\.]+)", source)
        if response_data and response_data.group(1) != "None":
            response_model = getattr(data_module, response_data.group(1).split(".")[-1])
            schema = model_schema(response_model, ref_prefix=REF_PREFIX)
            definitions, schema = _split_definitions(schema)
            components["schemas"].update(definitions)
            path_object["responses"][200] = {  # type: ignore
                "content": {
                    "application/json": {
                        "schema": schema,
                    },
                },
                "description": response_model.__doc__ or "",
            }

        request_data = re.search(r"request_data=([\w\.]+)", source)
        if request_data and request_data.group(1) != "None":
            req_data_model = getattr(data_module, request_data.group(1).split(".")[-1])
            schema = model_schema(req_data_model, ref_prefix=REF_PREFIX)
            definitions, schema = _split_definitions(schema)
            components["schemas"].update(definitions)

            if method == "POST":
                encoding = "application/json"
                path_object["requestBody"] = {
                    "content": {
                        encoding: {
                            "schema": schema,
                        },
                    },
                }
            else:
                for name, type_ in schema["properties"].items():
                    path_object["parameters"].append(
                        {
                            "name": name,
                            "in": "query",
                            "description": type_.pop("description", ""),
                            "schema": type_,
                        }
                    )
```

它接收的 `view_functions` 参数就是我们第二步所解析出来的 `views`.

完成这一步之后, 定义 __视图函数__ 的方式将变为如下所示:

```python
...
@parse_params(
    method="GET",
    request_data=None,
    response_data=DataSchema,
)
def view_function(...):
    ...
```

其中, `DataSchema` 是一个继承了 `pydantic` 的 `BaseModel` 的类.

```python
from pydantic import BaseModel, Field

class DataSchema(BaseModel):
    example: string = Field(description="事例字段")
```

这样, 脚本通过解析器中 `response_data = re.search(r"response_data=([\w\.]+)", source)` 这样的代码, 解析出了装饰器的参数 `DataSchema`, 然后动态加载这个类, 并通过 `model_schema` 方法将其转换为模型对应的 __swagger__ 文档格式.

### Step4: 生成 swagger

通过第三步, 我们得到了所有的数据模型和路由的 __swagger__ 对象, 将其整合便可以得到一份完整的 swagger 文档了.

如果有额外的全局字段需要添加, 可以参考 [swagger文档](https://swagger.io/docs/specification/basic-structure/).

## 补充

原生的 pydantic 解析无法对 `IntEnum` 类型进行解析, 而枚举类型在实际编码中是十分常用的.

> 如 1: 完成, 0: 未完成. 这个枚举类型在 pydantic 的生成结果里只有 [0,1] , 而没有任何的文字说明.

所以笔者采用如下的方案来进行补完.

```python
class DocIntEnum(IntEnum):
    def __new__(cls, value, doc=None):
        self = int.__new__(cls)
        self._value_ = value
        if doc is not None and cls.__doc__ is not None:
            cls.__doc__ += f" \n\n{value}:{doc} "
        return self

class StateEnum(DocIntEnum):
    uncompleted = 0, "未完成"
    completed = 1, "已完成"
```

通过继承这个新定义的 `DocIntEnum` , 能够将枚举值的描述信息注入到字段模型的说明中. 它的代价是微乎其微的, 因为原生的 `IntEnum.value()` 并不会关注我们加上去的这个说明信息.
