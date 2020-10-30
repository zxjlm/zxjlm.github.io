---
layout: post
cid: 200
title: python爬虫复习(2) 提高效率
slug: 200
date: 2020/01/08 20:02:00
updated: 2020/01/08 20:05:06
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - spider
  - 协程
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

提高爬虫效率主要从三个方面开始复习。

1. 并发
2. ip
3. cookies

并发必然引发的一个结果就是反爬虫机制，这种时候爬虫的效率不会因为并发而提高，反而会因为网站的防御机制拖累爬虫的速度。

自然而然地就引出了 2，代理爬虫。代理爬虫能够从多个 ip 发送请求，减小了单个 ip 的请求频率，自然触发反爬虫机制的概率也就小了很多。

但是新的问题又出现了，对于需要 **登录** 的网站，需要提交 cookies 来模拟登录情况，模拟登录不难，但是同一个 cookies 从不同的 ip 同时发送请求很明显不合常理，依然会触发反爬虫机制。

这是到目前为止我所遇到的影响爬虫效率的问题，就在这里做一个总结吧，如果后续遇到新的效率相关的问题，再做补充。

<!-- more -->

# 并发

## 前言

在 2019 年，我阅读了 python cookbook，其中对这一方面有较为详细且透彻的讲述，比较适合有 python 基础的人学习。
多进程、多线程是 python 程序员的必修课之一。因为，即使脱离了爬虫，机器学习、web 开发等方面，多线程、多进程依旧有着举足轻重的地位。
这是开发者的一个小分水岭，它在一定程度上决定了程序效率的高低。

## python 中的多进程方法

### 多线程、多进程、协程爬虫

对于操作系统来说，一个任务就是一个进程（Process），比如打开一个浏览器就是启动一个浏览器进程，打开一个记事本就启动了一个记事本进程，打开两个记事本就启动了两个记事本进程，打开一个 Word 就启动了一个 Word 进程。

有些进程还不止同时干一件事，比如 Word，它可以同时进行打字、拼写检查、打印等事情。在一个进程内部，要同时干多件事，就需要同时运行多个“子任务”，我们把进程内的这些“子任务”称为线程（Thread）。

### 进程、线程、协程的区别

多进程模式最大的优点就是稳定性高，因为一个子进程崩溃了，不会影响主进程和其他子进程。（当然主进程挂了所有进程就全挂了，但是 Master 进程只负责分配任务，挂掉的概率低）著名的 Apache 最早就是采用多进程模式。

多进程模式的缺点是创建进程的代价大，在 Unix/Linux 系统下，用 fork 调用还行，在 Windows 下创建进程开销巨大。另外，操作系统能同时运行的进程数也是有限的，在内存和 CPU 的限制下，如果有几千个进程同时运行，操作系统连调度都会成问题。

多线程模式通常比多进程快一点，但是也快不到哪去，而且，多线程模式致命的缺点就是任何一个线程挂掉都可能直接造成整个进程崩溃，因为所有线程共享进程的内存。

#### 协程的优势：

最大的优势就是协程 **极高的执行效率** 。因为子程序切换不是线程切换，而是由程序自身控制，因此，没有线程切换的开销，和多线程比，线程数量越多，协程的性能优势就越明显。

第二大优势就是 **不需要多线程的锁机制** ，因为只有一个线程，也不存在同时写变量冲突，在协程中控制共享资源不加锁，只需要判断状态就好了，所以执行效率比多线程高很多。

### 多进程，使用 Pool

```python
import time
import requests
from multiprocessing import Pool

task_list = [
    'https://www.jianshu.com/p/91b702f4f24a',
    'https://www.jianshu.com/p/8e9e0b1b3a11',
    'https://www.jianshu.com/p/7ef0f606c10b',
    'https://www.jianshu.com/p/b117993f5008',
    'https://www.jianshu.com/p/583d83f1ff81',
    'https://www.jianshu.com/p/91b702f4f24a',
    'https://www.jianshu.com/p/8e9e0b1b3a11',
    'https://www.jianshu.com/p/7ef0f606c10b',
    'https://www.jianshu.com/p/b117993f5008',
    'https://www.jianshu.com/p/583d83f1ff81'
]

header = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 '
                      '(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }

def download(url):
    response = requests.get(url,
                            headers=header,
                            timeout=30
                            )
    return response.status_code

def timeCul(processNumberList):
    for processNumber in processNumberList:
        p = Pool(processNumber)
        time_old = time.time()
        print('res:',p.map(download, task_list))
        time_new = time.time()
        time_cost = time_new - time_old
        print("Prcess number {},Time cost {}".format(processNumber,time_cost))
        time.sleep(20)

timeCul([1,3,5,7,10])
```

    res: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200]
    Prcess number 1,Time cost 10.276863813400269
    res: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200]
    Prcess number 3,Time cost 2.4015071392059326
    res: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200]
    Prcess number 5,Time cost 2.639281988143921
    res: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200]
    Prcess number 7,Time cost 1.357300043106079
    res: [200, 200, 200, 200, 200, 200, 200, 200, 200, 200]
    Prcess number 10,Time cost 0.7208449840545654

可以看到,随着进程数量的提升,爬虫的效率得到了显著的提高

### 多进程，使用 Process 对象

```python
from multiprocessing import Process

def f(name):
    print('hello', name)

p_1 = Process(target=f, args=('bob',))
p_1.start()
p_1.join()

p_2 = Process(target=f, args=('alice',))
p_2.start()
p_2.join()
```

    hello bob
    hello alice

### 关于多线程

**纯粹的多线程爬虫不适合复杂的任务**

当某一个线程的爬虫出现故障，由于内存共享机制，所有的线程会受到牵连

```python
from concurrent.futures import ThreadPoolExecutor
import time

def sayhello(a):
    print("hello: "+a)
    time.sleep(2)

def main():
    seed=["a","b","c"]
    start1=time.time()
    for each in seed:
        sayhello(each)
    end1=time.time()
    print("time1: "+str(end1-start1))
    start2=time.time()
    with ThreadPoolExecutor(3) as executor:
        for each in seed:
            executor.submit(sayhello,each)
    end2=time.time()
    print("time2: "+str(end2-start2))
    start3=time.time()
    with ThreadPoolExecutor(3) as executor1:
        executor1.map(sayhello,seed)
    end3=time.time()
    print("time3: "+str(end3-start3))

if __name__ == '__main__':
    main()
```

# 关于协程

## 协程的作用

简单总结一下协程的优缺点：

优点：

1. 无需线程上下文切换的开销（还是单线程）；

2. 无需原子操作的锁定和同步的开销；

3. 方便切换控制流，简化编程模型；

4. 高并发+高扩展+低成本：一个 cpu 支持上万的协程都没有问题，适合用于高并发处理。

缺点：

1. 无法利用多核的资源，协程本身是个单线程，它不能同时将单个 cpu 的多核用上，协程需要和进程配合才能运用到多 cpu 上（协程是跑在线程上的）；

2. 进行阻塞操作时会阻塞掉整个程序：如 io；

## 示例演示

协程是我这次复习的一个重头戏，所以给它一个完整的演示流程。这对于理解并发以及并发应该如何应用有着很大的意义。

首先，为了体现协程的高效率，我将传统的串行爬虫和协程爬虫进行一个效率对比。

### 共同部分

```python
import re
import asyncio
import aiohttp
import requests
import ssl
from lxml import etree
from asyncio.queues import Queue

from aiosocksy.connector import ProxyConnector, ProxyClientRequest
```

```python
links_list = []
for i in range(1, 18):
    url = 'http://www.harumonia.top/index.php/page/{}/'.format(i)
    header = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 '
                      '(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }
    response = requests.get(url,
                            headers=header,
                            timeout=5
                            )
    tree = etree.HTML(response.text)
    article_links = tree.xpath('//*[@id="post-panel"]/div/div[@class="panel"]/div[1]/a/@href')
    for article_link in article_links:
        links_list.append(article_link)
```

以上，获取 url 列表，是两只爬虫的共同部分，所以就摘出来，不加入计时。

### 传统方法，顺序爬虫

```python
%%timeit
word_sum = 0
for link in links_list:
    res = requests.get(link,headers=header)
    tree = etree.HTML(res.text)
    word_num = re.match('\d*', tree.xpath('//*[@id="small_widgets"]/ul/li[5]/span/text()')[0]).group()
    word_sum+=int(word_num)
```

    47.9 s ± 6.06 s per loop (mean ± std. dev. of 7 runs, 1 loop each)

### 协程方法

```python
result_queue_1 = []

async def session_get(session, url):
    headers = {'User-Agent': 'Mozilla/4.0 (compatible; MSIE 5.5; Windows NT)'}
    timeout = aiohttp.ClientTimeout(total=20)
    response = await session.get(
        url,
        timeout=timeout,
        headers=headers,
        ssl=ssl.SSLContext()
    )
    return await response.text(), response.status


async def download(url):
    connector = ProxyConnector()
    async with aiohttp.ClientSession(
            connector=connector,
            request_class=ProxyClientRequest
    ) as session:
        ret, status = await session_get(session, url)
        if 'window.location.href' in ret and len(ret) < 1000:
            url = ret.split("window.location.href='")[1].split("'")[0]
            ret, status = await session_get(session, url)
        return ret, status


async def parse_html(content):
    tree = etree.HTML(content)
    word_num = re.match('\d*', tree.xpath('//*[@id="small_widgets"]/ul/li[5]/span/text()')[0]).group()
    return int(word_num)


def get_all_article_links():
    links_list = []
    for i in range(1, 18):
        url = 'http://www.harumonia.top/index.php/page/{}/'.format(i)
        header = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 '
                          '(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
        response = requests.get(url,
                                headers=header,
                                timeout=5
                                )
        tree = etree.HTML(response.text)
        article_links = tree.xpath('//*[@id="post-panel"]/div/div[@class="panel"]/div[1]/a/@href')
        for article_link in article_links:
            links_list.append(article_link)
            print(article_link)
    return links_list


async def down_and_parse_task(url):
    error = None
    for retry_cnt in range(3):
        try:
            html, status = await download(url)
            if status != 200:
                print('false')
                html, status = await download(url)
            word_num = await parse_html(html)
            print('word num:', word_num)
            return word_num
        except Exception as e:
            error = e
            print(retry_cnt, e)
            await asyncio.sleep(1)
            continue
    else:
        raise error


async def main(all_links):
    task_queue = Queue()
    task = []
    for item in set(all_links):
        await task_queue.put(item)
    while not task_queue.empty():
        url = task_queue.get_nowait()
        print('now start', url)
        task.append(asyncio.ensure_future(down_and_parse_task(url)))
    tasks = await asyncio.gather(*task)
    for foo in tasks:
        result_queue_1.append(foo)
```

```python
loop = asyncio.get_event_loop()
loop.run_until_complete(main())
```

> time cost 16.03649091720581 s
> 字数 = 291738

ps.由于 jupyter 自身的限制，所以这里使用 pycharm 运行并计时

### 总结

可以看出，协程方法下，代码的运行效率大约是传统串行方式的 3 倍，并且，随着运行量级的增加，效率将会呈指数级提升。

由进程到线程，由线程到协程，任务的划分越来越精细，但是代价是什么呢？

<br>

**补充说明** ：

1. 无论是串行还是协程，都会面临爬取频率过高而触发反爬虫机制的问题。这在高效率的协程状况下尤为明显，这里就要使用代理来规避这一问题。
2. 两者的代码量存在很大的差异，这里主要是因为在写协程的时候进行了代码规范，只是看上去代码量多了很多而已。（当然，协程的代码量必然是比传统方法多的）
3. 爬虫不要玩的太狠，曾经有人将爬虫挂在服务器上日夜爬取某网站，被判定为攻击，最终被反制(病毒攻击)的先例。同时，也要兼顾一些法律方面的问题。

## 后记

1. 暂时就先整理一下并发相关的知识吧.最近事务实在有点多了.
2. 在完成这一篇的同时,收到了导师"将网站项目进行多进程改造"的要求,好吧...本来想偷个懒只研究协程的,最终还是一个都跑不掉 o(╥﹏╥)o
3. 鲨雕终于要回来辽~~~~~
