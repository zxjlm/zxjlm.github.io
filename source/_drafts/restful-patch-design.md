---
title: restful-patch-design
date: 2021-11-14 19:52:01
tags:
---

## 问题起因

在实际使用前端页面的时候, 发现某些页面会一次性发出数十条请求, 基础逻辑是以 id 为索引, 对每一条资源进行请求, 这毫无疑问是可以被优化的.

我所想到的第一个优化方案, 重新开一个 POST 或者 GET 接口, 对资源的请求进行批处理, 这样就将数十条请求统一为一条请求, 带宽压力和性能压力都会减轻很多.

于是, 本篇研究的方向就是, **以一种 RESTful 的方法来解决批量资源处理的问题.**

## 思路探索

### 第一轮探索: POST 还是 GET

这两个 HTTP Method 承担了过去开发的项目的九成 Method. 而 `POST` 方法, 在过往的个人项目开发中一直是 **silver bullet** 一样的存在. 但是在大概阅读了 DRF 的代码之后, 我发现当前所维护的项目与过去的项目存在一个本质上的区别, 也即 **数据密集型业务** 和 **计算密集型业务** 的差别. 当然这已经偏离了本文的讨论范畴, 所以按下不表.

理论上, _POST_ 和 _GET_ 都能完成我们的目标, 甚至下意识地会觉得, GET 请求使用了较少的 **payload** , 所以更具性能优势.

但是在[MDN-GET](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET) 上面明确表示`avoid sending payloads in GET requests` . 所以通过 GET 方法来定位批量资源, 最好是通过 `Query Params` 来实现. 而诸如 `PUT` \ `PATCH` 之类的方法都是支持 `request body` 的, 而实际上对资源的批量操作也必须使用 `request body`.

至此, 第一层 **异味(code smell)** 出现了. 在单资源处理中, 我们可以通过类似 `/desktop_clients/{id}` 的不同请求方法来实现同一接口的不同资源相应, 而批处理中, GET 需要独立一个路径来解决 payload 的问题, 这使得整体的设计很不和谐.

### 第二轮探索: DRF

第一轮得到的结果是不完美的, 不妨回到原点, 从 DRF 的角度来思考这个问题.

> Generic rest framework endpoints are typically designed to modify one object at a time.

DRF 的设计遵循 REST(Representational state transfer) 规范, 每次对一个对象进行一次修改.

### 第三轮斟酌: 案例参考

## 问题思路

## 参考资料

- [Adding batch or bulk endpoints to your REST API](https://www.codementor.io/blog/batch-endpoints-6olbjay1hd)
- [Efficient Bulk Updates with Django Rest Framework](https://levelup.gitconnected.com/really-fast-bulk-updates-with-django-rest-framework-43594b18bd75)
- [Are batch endpoints a good pattern in REST APIs?](https://news.ycombinator.com/item?id=28385466)

- [Batch: An API to bundle multiple REST operations](https://medium.com/paypal-tech/batch-an-api-to-bundle-multiple-paypal-rest-operations-6af6006e002)
- [REST API 中，同一个参数多个值，正确的传递姿势是怎样的？
  ](https://www.v2ex.com/t/488981)
