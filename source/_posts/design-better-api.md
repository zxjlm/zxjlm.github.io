---
title: API设计个人经验小结(施工中)
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2022-03-29 09:50:04
updated: 2022-03-29 10:37:56
categories:
tags:
customSummary:
thumb:
thumbDesc:
thumbSmall:
---


本篇基于笔者本人的实际工作经验, 总结了一些API的设计思路, 并提供了对应的参考资料以供深入研究.

<!-- more -->

## 使用一致的接口逻辑

接口逻辑包括如下方面:

1. 命名逻辑
2. 接口处理逻辑

一致的接口逻辑有以下的几种好处:

对于开发者来说: 前端能够根据后端的接口逻辑来有规律地复用一些代码和异常处理逻辑.
对于使用者来说: 一致的接口逻辑能够很容易地推导出其他的资源的获取方式或者参数的使用方式, 属于用户友好型设计.

下面列出一些笔者常用的命名风格, 以供参考.

- 资源、参数、字段名等采用相同的命名风格, 如匈牙利命名法(foo_bar) 、驼峰命名法(fooBar). (笔者常用匈牙利命名法)
- 资源统一设计为复数或者单数的形式.  (笔者常用复数形式)

```text
# 综合
/api/v1/name_spaces
/api/v1/name_spaces/{id}
```

- 采用统一的认证逻辑(这一点通常在使用web框架时就自动满足了)
- 接口返回的状态码符合标准规范
- 接口的使用方法(method)符合标准规范

本质上还是 [RESTFul](https://en.wikipedia.org/wiki/Representational_state_transfer) 的那一套, 关于 RESTFul 的具体实践见于下文.

## 符合RESTFul设计

内容接[使用一致的接口逻辑](#使用一致的接口逻辑)

### 使用规范的HTTP状态码

以下列出一些常用的状态码。

状态码 | 含义
 --- | ---
200 | 成功请求
201 | 成功创建
400 | 错误的请求
401 | 未认证的请求
403 | 权限不足
404 | 无此资源
429 | 流量超限
5xx | 服务器内部错误

其中, 服务器内部错误一般会进行一层封装处理，不会展示具体的错误细节。

~~HTTP状态码更形象的内容可以参考[http cat](https://http.cat/)~~

HTTP状态码更详细的内容可以参考 [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

### 使用规范的HTTP方法

以下列出一些常用的方法。

- POST 创建资源
  - POST /users
- GET 请求资源
  - GET /users  请求列表资源
    - GET /users/{id}  请求单个资源
- PATCH 部分更新资源
  - PATCH /users/{id}
- PUT 全量更新资源
  - PUT /users/{id}
- DELETE 删除资源
  - DELETE /users/{id}

除了方法之外，在命名时还应该遵循 _self-explaining_ 原则, 本质上，url路径是对资源的定位，查找与操作都是以资源为主体，这一点会体现在 __path__ 的命名上。

HTTP方法更详细的内容可以参考[MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)

RESTFul更详细的内容可以参考[restful - wiki](https://en.wikipedia.org/wiki/Representational_state_transfer)

## 使用标准的报错信息

包括统一的错误码、报错信息. 一般会采用如下的

```plain_text
{
    'code': number
    'data': object
    'message': string
}
```

## 返回创建的资源

对于创建资源的请求，最好在接口中返回创建之后的资源对象，方便后续数据的使用。如 __ID__ 等由后端生成补全的数据，前端如果想要得到，则需要额外进行一次 GET 请求，返回创建资源能够避免这个损耗。

## 更倾向于使用PATCH而非PUT

PATCH用于部分更新，PUT用于全量更新。
大部分业务情境下我们需要使用的是资源的部分更新，这时候如果使用PATCH，则只需要传回要修改的键值对以及一个资源标识符，而使用PUT，则需要传回全量的数据。

两者更详细的对比可以见于 [http-put-vs-patch](https://www.baeldung.com/cs/http-put-vs-patch)

## 使用分页

使用分页有如下的好处。

- 对前端友好。现在主流的表格组件都支持分页或者有对应的分页解决方案。
- 缓解后端的请求压力与数据库压力。本质上，分页的请求使用的是 offset 和 limit 的 SQL请求，拥有更少的IO损耗。

## 使用 ISO 8601 UTC 返回结果

在解释这个问题之前, 首先需要了解一下数据库中的时间格式。

以MySQL为例，时间格式分为 DATE \ DATETIME \ TIMESTAMP 三种类型, 更详细的信息可以见于 [官方对时间格式的说明文档](https://dev.mysql.com/doc/refman/8.0/en/datetime.html)

在ORM框架取出数据时，会对数据进行预处理，在返回数据(Response)时将该类格式的数据自动转为ISO格式的字符串。

以 Django 为例:

```python
def value_to_string(self, obj):    
    val = self.value_from_object(obj)   
    return '' if val is None else val.isoformat()
```

从前端的角度来说，ISO格式的时间能够被解析为 `Date` 对象，进而根据客户端配置的时区来展示为当地的时间.

```javascript
// JavaScript
date = new Date("2022-03-16T22:00:09.254459+08:00")
date.toLocaleString()
```

## 提供健康度检查的接口

__Health Check__ 接口反馈的是API服务的运行状态.

check的条目可以包含以下的几点.

- 下游API检查。服务可能依赖于(depend on)另一个服务, 检查时也同样需要去检查下游服务的可用性，但是这个不会通过下游的API Check去检查，因为这会触发链式调用，在服务依赖复杂的情况下会很危险。
- 数据库连通性检查。检查基础的数据库增删改查操作是否可用。
- 数据库响应时间检查。数据库的响应时间同样是衡量服务健康度的重要指标，如果响应时间过长，则需要进行详细的原因排查。
- 内存检查。服务应该具有一个估算好的内存用量，进行健康度检查时，需要检测内存占用率，用来预防内存溢出导致的恶性问题。
- 消息积压情况检查。对于使用了MQ的服务，还应当对MQ消息数量进行检查，以确认消息积压情况。

本质上，这是将一部分预警机制注入到了接口之中。例如内存检查、消息积压情况这些，在大部分的运维平台都有对应的监控机制，可以取代API监控中的对应功能。

__API Health Check__ 的一个下位替代品是 __API Ping__ ，它的作用是检查API是否 _可用_ ，而忽略了API的 _可用性_ 。当上述的 Check List 全都不需要时，可以使用单纯的 API Ping。

对于健康度的一个典型实践，可以参考 __k8s的存活探针__ 相关的内容。

## 声明API版本

API在演进过程中不可避免地存在功能的升级和退化，所以需要对不同版本的API进行管理，以保证服务能够被不同版本的对应的前端\客户端使用。

比较初级的API版本声明方式是在 __params__ 中声明或者在 __path__ 中声明. 如下所示。

```plain_text
https://api.averagecompany.com/v1/health
https://api.averagecompany.com/health?api_version=1.0
```

而笔者见过的比较高端一点的版本控制策略，是在 _request_body_ 中指明 API 的方法名称、版本、返回值等参数以及常规的请求参数，然后在网关中对这些请求进行重组，并分发给对应的服务接口。这一部分没有做过实践，所以就大概地提一下，不做深入阐述。

## 采用API KEY的认证

todo: 第三方接口鉴权方式 、 加密、 环境变量存放密钥
