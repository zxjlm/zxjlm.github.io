---
layout: post
cid: 212
title: 搭建一个基于flask和redis的代理池(proxy pool)
slug: 212
date: 2020/02/08 19:15:00
updated: 2020/02/15 14:02:43
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

在进行网页爬虫的项目时，常常会因为爬取的频率过高而触发 **反爬虫机制** ，这时候，面临两个选择：

1. 休息片刻。一般反爬虫机制不会进行永久的 IP 封禁，只是暂时限制访问而已，等待封禁时间结束再进行爬取即可。当然对于某些拥有黑名单机制的网站，如果封禁次数过多，封禁的时间也会随着这个次数而提高。
2. 更换 IP。既然我的 IP 被封了，那么我换一个其他的 IP 不就行了。

显然，第二种方法更优于第一种，并且更加符合 geek 的风格。但是问题在于，从哪里寻找这样一个 IP 地址呢？

<!-- more -->

很多的教材都有**免费代理网站**这样一个概念，但是免费代理面临的一个问题就是，很多的人都在使用，所以往往刚解封就又被封禁了，有的甚至直接就挂在网站的黑名单里。**所以，代理网站提供的 IP 虽然多，但是可用的却非常的少。**

小数量的 IP 跟没有一样，那么如何白嫖大量的**免费的有效的**IP 代理呢？

代理网站有很多，假设每个网站能够提供两位数级别的可用 IP，那么统合起来就是一个十分可观的数字了。用来应付*个人级*的爬虫项目游刃有余。

但是，这又引出一个问题。**每次进行爬虫项目都要先对上千上万的 IP 地址进行一次过滤？** 这无疑是非常地影响效率的。

所以，基于以上的种种问题，引出一个解决方案，建立一个**代理池（proxy pool）** 。

这个想法在某些的教材上面出现过，并且也有类似的项目(_但是大多数都已经失效了_)，这里笔者决定从零开始，维护一个属于自己的代理池项目。

## 游戏开始

进行一个项目，首先要对项目进行一个大致的规划，这个规划没有必要太过于详细，因为作为一个经验不是很充足的菜鸟程序员，永远不知道开发过程中会遇到什么问题，又会迸发出什么样令人拍案的灵感(agile development)。

预计有以下几个模块:

- getter：负责从各个免费代理网站上**获取**代理，并写入数据库
- tester：负责对数据库中的代理进行**测试**，并进行评分
- server：随机从数据库中**返回**代理
- scheduler：调度器，调度 getter、tester、api 三者的运行
- database：数据库接口

预计使用到一下的技术：

- request、bs4 等：爬虫相关的技术，主要用于获取各个代理网站的代理
- flask：制作主页面和 api
- redis：代理数据库。由于我们是需要完成一个评分机制的代理池，所以可以使用 redis 的有序集合结构，功能简洁，实现便利。
- aiohttp：通过协程提高测试效率
- MySQL：协同日志数据库

> 以上的项目主体框架思路来自于 GitHub 的几个热门代理池项目

## 1. 选取免费代理网站

笔者尝试过很多的代理网站，诸如西刺、快代理、齐云等国内知名的网站，但是发现可用的 IP 比例实在是太少，后来想了想，大抵是国内的爬虫学习者和个人开发者多引用这些网站，所以导致网站的 IP 大量被封吧。

于是笔者去搜索了一些外部的网站，如[free proxy list](https://free-proxy-list.net/)等，IP 的可用率确实提高了很多。

至于用不用国内的免费代理，就看个人的需求吧。

## 2. 完成 getter 模块

getter 模块负责**获取免费代理，写入代理池**.

这里以[free_proxy](http://free-proxy.cz/zh/)为例，因为笔者发现这个网站的 IP 地址使用了**Base64 加密**，所以 IP 地址被爬虫新手"迫害"的程度较低:D。

```python
import base64
res_ip = re.findall('Base64.decode\("(.*?)"\)',req.text)
res_port = re.findall('style=\'\'>(\d*)</span>',req.text)
proxy_list = []
for index in range(len(res_ip)):
  proxy = base64.b64decode(res_ip[index]).decode('utf-8')+':'+res_port[index]
  proxy_list.append({'http':proxy,'https':proxy})
```

得到输出结果如下，也就是我们所需要的代理，将其写入 redis 数据库，getter 的任务到此也就完成了。

```python
['167.99.146.167:80',
 '138.197.5.192:8888',
 '157.245.123.27:8888',
 '103.11.65.160:9090',
 '104.248.1.178:8080',
 '198.23.239.245:80',
 '204.101.4.42:4145',
 '159.89.123.57:8080',
 '159.203.44.177:3128',
 '159.203.87.130:3128',
 '35.194.36.69:3128',
 '45.55.159.57:27720',
 '142.93.57.37:80',
 '64.251.21.59:80',
 '104.237.227.198:54321',
 '198.23.143.5:1080',
 '162.223.89.69:1080',
 '138.197.164.82:8080',
 '167.172.135.255:8080',
 '167.114.112.84:80',
 '68.183.128.131:9999',
 '64.235.204.107:8080',
 '38.142.63.146:31596',
 '168.169.146.12:8080',
 '198.50.177.44:44699',
 '104.218.60.89:4145',
 '165.234.102.177:8080',
 '178.128.176.96:80',
 '64.227.51.227:8118',
 '23.244.28.27:3128']
```

当然，仅仅是这一个网站是远远不够的，后面还可以自己选择一些网站并完成对应的 getter 子模块。

> 补充说明：
>
> 由于我们会通过每一个代理 IP 评分进行代理池的迭代更新，所以在写入数据库时需要一个初始评分。

## 3. 完成 tester 模块

从 redis 中按照评分的排序批量抽取制定数量的代理 IP，进行测试，并根据测试的结果对对应的评分进行修改。

```python
conn = aiohttp.TCPConnector(verify_ssl=False)
async with aiohttp.ClientSession(connector=conn) as session:
    try:
        if isinstance(proxy, bytes):
            proxy = proxy.decode('utf-8')
        real_proxy = 'http://' + proxy
        async with session.get(TEST_URL, headers=headers, proxy=real_proxy
                                # , timeout=15
                , allow_redirects=False
                                ) as response:
            if response.status in VALID_STATUS_CODES:
                self.redis.max(proxy)
            else:
                self.redis.decrease(proxy)
                print('请求响应码不合法 ', response.status, 'IP', proxy)
    except (ClientError, aiohttp.client_exceptions.ClientConnectorError, asyncio.TimeoutError, AttributeError):
        self.redis.decrease(proxy)
        print('代理请求失败', proxy)
```

这里使用协程机制，可以同时对多个 IP 地址进行连接测试。

## 4. 完成 server

server 模块使用*flask*搭建，flask 作为轻量级的 python web 开发框架，天然适合应付这种简洁的 web 网页开发。

为了实现任务，我们需要如下的功能:

- 随机从 redis 中获取一个高分的代理地址
- 给出一个主页来查看代理池的大致信息（剩余代理数量、爬虫的运行概况、代理池的健康程度等）
- 固定 redis 和 mysql 的连接

## 5. 完成 scheduler

scheduler 的核心任务负责调度 server、getter、tester 的运行，拥有如下的子功能：

- 容量检测&&启停器：检测代理池中可用 IP 的数量。如果超出上限值，则暂停爬虫模块；如果低于下限值，则启动爬虫模块；如果低于临界值，则向管理员发出警告，并休眠进程。
- 日志记录：
  - 统计请求 IP 的请求次数
  - 记录错误信息|非法信息
  - 分时段固化代理池的基础信息

关于 scheduler 注意以下几点：

1. 注意设置子模块的循环时间和循环条件。如，tester 是一直持续不断地运行的；getter 同时受到代理池容量和爬虫爬取频率上限的约束等。
2. 子模块并行运行，互不干涉。

```python
class Scheduler():
    def schedule_tester(self, cycle=TESTER_CYCLE):
        tester = Tester()
        while True:
            print('测试器开始运行')
            tester.run()
            time.sleep(cycle)

    def schedule_getter(self, cycle=GETTER_CYCLE):
        getter = Getter()
        while True:
            if not self.is_over_threshold():
                print('开始抓取代理')
                getter.run()
                time.sleep(cycle)
            else:
                time.sleep(cycle*5)

    def schedule_server(self):
        app.run(API_HOST, API_PORT)

    def is_over_threshold(self):
        return self.redis.count() >= POOL_UPPER_THRESHOLD:

    def run(self):
        print('代理池开始运行')

        if TESTER_ENABLED:
            tester_process = Process(target=self.schedule_tester)
            tester_process.start()

        if GETTER_ENABLED:
            getter_process = Process(target=self.schedule_getter)
            getter_process.start()

        if API_ENABLED:
            api_process = Process(target=self.schedule_server)
            api_process.start()
```

这样一来，调度器的编写也就完成了。

## 6. 补充说明

使用 Docker 进行懒人部署，Dockerfile 的配置内容如下。

```python
FROM python:3.7
WORKDIR /app
COPY . /app
RUN pip install pip -U \
    && pip install -r requirements.txt
EXPOSE 6800
CMD ["python","run.py"]
```

如此，proxypool 的代建也就完成了，以后再使用爬虫，就只需要从这个代理池里获取代理，就可以进行**高强度**的爬虫作业咯。

## 7. 后续优化思路

1. Redis 是单线程运行的，虽然读写的效率非常之高，但是既然使用了 docker，不妨尝试一下使用 redis 集群，来实现一个超大规模的 proxypool？当然这也只是一个构想，等后面更加深入地学习两者之后，再做讨论吧。
2. 在爬虫获取代理方面写的相对比较粗糙，不排除被反爬虫机制检测到的可能，姑且先用着吧，看看后续的效果具体如何。

## 后记

这次搭建 proxy pool，虽然使用的都是一些已经学习过的技术，但是实际操作的过程中，还有有很多的意外的收获的。

- 在阅读[Python3WebSpider](https://github.com/Python3WebSpider) 的代码时，第一次在项目中实践了元类编程，果然这些知识只有到投入使用的时候，才会有更加深刻的体会呢
- 通过[官方文档](http://docs.jinkan.org/docs/flask/appcontext.html)和一些辅助资料深入地学习了 flask 的**应用上下文、应用全局变量**的知识，以往使用 session 的方法虽然也不失为一种策略，但是这样果然合适更 cool 一点。
- 每一次使用 docker，都仿佛是重新学习了一遍，看来还是基础不够扎实啊。

疫情形式还是十分地严峻啊，不过宅居在乡下，吃喝不愁，与世隔绝的日子虽然寂寞，但是也算是新的一种体验吧。
