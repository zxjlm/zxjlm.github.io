---
layout: post
cid: 215
title: 关于B站视频的访问量爬虫
slug: 215
date: 2020/02/13 21:02:00
updated: 2020/02/15 14:02:02
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - spider
  - 访问量
  - BiliBili
customSummary:
noThumbInfoStyle: default
outdatedNotice: yes
reprint: standard
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

## 前言

"_酒香不怕巷子深_"，这样的想法在这个时代已经算是非常地消极和落伍的一个思想了。

就像是一部电影，如战狼、哪吒这样，优秀的宣发能够带来远超电影本身质量的收益；而反过来，如闪光少女这样的电影，质量足以称为上乘，但是票房确差强人意，这就是典型的忽视了市场规则的下场。

访问量、点赞、收藏、投币等要素共同决定了一个视频的热度。但是，除了前者之外，都需要一个确切的 B 站账户，笔者目前还没有能力来维持一个基数庞大的 B 站账号池，所以就只能在第一个要素，**点击量** 上下文章咯。

<!-- more -->

## 正文

首先，先上一个 CSDN 的访问量爬虫。

```python
import requests

headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"}

url = "https://blog.csdn.net/Acher_zxj/article/details/104276531"

count = 0
while True:
	res = requests.get(url,headers=headers)
    print("now in loop {}".format(count))
```

访问量爬虫的工作原理非常地简单，就是单纯的向服务器发出一个请求，核心的行为**与浏览器访问相类**，每一次访问就算是一个点击量。

不过这里有一个问题，如何让远程服务器承认你的这次访问有效呢？

爬虫本身可以想象为<柯南>中那个小黑人，任谁(服务器)看到这幅打扮的人都会心神警惕吧。而 headers 的作用就是给这个小黑人"变装"，让它看上去更加地像一个"好人"。

这就是笔者上文所说的 _与浏览器访问相类_ ，具体的体现就是 headers 这一行。

这一行规定了爬虫的请求头，这是笔者从自己的浏览器中摘出来的**浏览器请求头**，声明了使用的是什么样的浏览器及其内核版本。

![image-20200213202738417](http://typora-zxj.oss-cn-beijing.aliyuncs.com/typora/20200213202739-538776.png)

当然，**get** 还有**proxies**这样一个参数，这就相当于是直接给爬虫这个小黑人"换了一个身份"，对于这个有兴趣的可以参看[构建 proxy pool](http://harumonia.top/index.php/archives/212/) 一文，这里就不多做赘述了。

之所以先上 CSDN 的访问量爬虫，是因为这个爬虫的实现机制简单，可以作为一个很好的引入案例。

那么，现在开始正餐~

关于 B 站视频的访问量爬虫，有两个很重要的问题需要我们解决。

1. B 站的视频访问是需要登录的，不登录的访问似乎是不计数的(还是只记一次来着)？
2. B 站视频并不是你**进入页面**时就算是一个访问的，而是你点击了这个视频，即**开始观看**之后，才算是一个视频访问量。

由于上述的两个问题，那么很显然我们无法像*CSDN 访问量爬虫*那样简单地实现了。

关于第一个问题，我们的解决方法很简单。
在浏览器中找到你的 cookie，然后将其添加到 headers 中即可。

在解决第二个问题的时候，笔者发现，网络上的主流方法是使用**Selenium**进行自动化的网页访问，模拟点击事件。

这种方法并无不可，但是 Selenium 自动化是真实地启动了 Chrome 内核的，也就是说，它的内存消耗相对很大，进而会拖慢计算机的执行效率，这一点我在以前写 Pixiv 图片爬虫的时候深有体会。

于是，我开始尝试寻找新的方法。2019 年下半年的网站开发工作，让我对**API**这个概念有了更深一层的体会，在每次**点击**开始播放之后，对应的 API 又是什么呢？

### 1. 开始分析网页的 API 结构

以[【德拉科 Draco】个人向踩点混剪（一点都不骚）](https://www.bilibili.com/video/av88113854)这个视频为例。

在点击开始之后，一瞬间跳出了一大片的网络请求信息。(难怪 Safari 总是提示 B 站耗能高 (笑))

![image-20200213204116715](http://typora-zxj.oss-cn-beijing.aliyuncs.com/typora/20200213204118-561183.png)

### 2. 开始寻找"嫌疑人"

主要就是看交互的**参数**和**响应**。

既然要计算点击量，那么在请求中肯定**包含了视频的 av 号和 cid**这些特征信息吧，于是完成第一轮排查。

依然剩下很多，第二轮排查的主要着力点在 API 的名字，优秀的 API 的命名不可能是很随意的，这里我选择相信 B 站程序员的职业素养，于是我赌对了。在挑了两个之后，果然被我命中了。

![image-20200213204634035](http://typora-zxj.oss-cn-beijing.aliyuncs.com/typora/20200213204634-611540.png)

可以看到，这个名字是*h5*的小家伙携带了很不得了的信息呢。

### 3. 测试 API

将表单的信息复制下来，我们使用 post 命令来模拟一下，看看是什么结果。

```python
headers = {
    'Host':'api.bilibili.com',
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
    'Accept-Encoding': 'gzip, deflate, br',
    'Origin': 'https://www.bilibili.com',
    'Connection': 'keep-alive',
    'Referer': 'https://www.bilibili.com/video/av88113854',
	'Cookie':"你的cookie"
}

data = {
    'aid':'88113854',
    'cid':'150536365',
    'part':'1',
    'mid':'your mid',
    'lv':'5',
    # 'ftime':'1581244587',
    # 'stime':'1581419884',
    'jsonp':'jsonp',
    'type':'3',
    'sub_type':'0'
}

req = requests.post('https://api.bilibili.com/x/click-interface/click/web/h5',data=data,headers=headers,proxies=proxy)
```

当然，不要忘记先"变装"，不然直接就可以进 Bad End 了。

> 说明：
>
> ftime 和 stime 这两个参数一直在变动，但是熟悉 Linux 的小伙伴应该知道这是什么意思，所以笔者尝试将这两个参数去掉，果然，没有影响~~
> mid 和 cookie 是根据每个人的账号信息生成的

在执行了一遍这个代码之后，发现视频的访问量 **+1** ~

### 4. 完成爬虫

```python
import requests
import time

headers = {
    'Host':'api.bilibili.com',
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
    'Accept-Encoding': 'gzip, deflate, br',
    'Origin': 'https://www.bilibili.com',
    'Connection': 'keep-alive',
    'Referer': 'https://www.bilibili.com/video/av88113854',
	'Cookie':"你的cookie"
}

data_bk1 = {
    'aid':'88113854',
    'cid':'150536365',
    'part':'1',
    'mid':'your mid',
    'lv':'5',
    # 'ftime':'1581244587',
    # 'stime':'1581419346',
    'jsonp':'jsonp',
    'type':'3',
    'sub_type':'0'
}

count = 0
while True:
    try:
        req = requests.post('https://api.bilibili.com/x/click-interface/click/web/h5',data=data,headers=headers)
        count += 1
        print("now in loop {}".format(count))
        print(req.text)
        time.sleep(100)
    except Exception as e:
        print(proxy_raw)
        print(e)
        time.sleep(100)


print('over')
```

> 必要说明：
>
> 经过测试，在不更换 ip 和账号的情况下，B 站对每个 ip 的访问频率记数是 400s 左右，所以就以这个时间为睡眠间隔。
>
> 同时也是为了防止过度频繁的访问触发反爬虫机制，导致自己的 ip 被封，影响正常使用。
>
> **但是，可以同时刷多个视频的播放量**
>
> 当然，如果使用代理的话，就可以放心大胆地浪了。
