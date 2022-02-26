---
layout: post
cid: 206
title: python爬虫复习(4)mitmproxy && 寒假作业的部分分析
slug: 206
date: 2020/01/19 23:51:39
updated: 2020/01/19 23:51:39
status: publish
author: harumonia
categories:
  - 源流清泉
tags:
  - Python
  - spider
  - 数据分析
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

# 前言

到这里，python 爬虫部分的复习也就告一段落了，当然，除了 scrapy，老实说，对于平常爬取几千条这种小打小闹的爬虫，并没有去深入研究 scrapy 的必要（当然，了解还是要了解一下的）。

之前学习爬虫，因为需求的原因，只学习了网页爬虫。趁着寒假有空，再来看一看 app 爬虫是啥样的吧。

<!-- more -->

# mitmproxy

[官网](https://mitmproxy.org/)

[github](https://github.com/mitmproxy)

## 安装

s1. 安装本体

```bash
brew install mitmproxy
```

s2. 安装 python 包

```bash
pip install mitproxy
```

s3. 安装证书

   1. shell 中输入 mitmdump

   2. 将/Users/{用户名}/.matplotlib/目录下的 mitmproxy-ca-cert.pem 发送到移动端(隔空投送即可)
   3. 在 **设置** 中信任证书

ps.使用 **shift+cmd+.** 可以查看隐藏文件

s4. 连接代理

   1. 使用 ifconfig 查找本机的 ip 地址

   2. 找到 inet，如下图所示，IP 地址为 192.168.3.6

      ![image-20200118233542424](https://tva1.sinaimg.cn/large/006tNbRwgy1gb1510c350j30d502z0sx.jpg)

​在设置->无线局域网->无线局域网配置->配置代理

ps. mitmproxy 的端口是 8080

配置部分就到这里，然后测试一下配置是否正确。

1. 在命令行中输入 **mitmproxy** ， 进入 mitmproxy 的数据流界面。

2. 打开任意的 app，然后发现数据流界面开始跳出很多的响应字段，ok，配置正确。

   ![image-20200118234716015](https://tva1.sinaimg.cn/large/006tNbRwgy1gb15d0e0ksj30fq09oab0.jpg)

上图为结果展示，可以点击字段进入查看详细的信息

![image-20200118235147625](https://tva1.sinaimg.cn/large/006tNbRwgy1gb15hp8sohj30fs0bvgmv.jpg)

ps. 这里列一下流界面的快捷键

> ?:帮助
> q:返回 或退出
> z:清屏
> j:上一个或向上滑动
> k:下一个或向下滑动
> 回车键：查看选中的请求
> h:查看 请求内容 下一个
> l:查看请求内容 上一个
> tab：查看请求内容 下一个

至此，所有的准备工作就都已经完成了，接下来选择一下实验目标吧

# mission start

首先当然是选择一个目标 app，这里我选择的是 _超星学习通_ 。这个寒假学校布置了一个读书笔记的任务，叫做 21 天习惯养成，满满的 **形式主义** 的感觉，所以，我就把所有的数据都用爬虫爬下来，来分析一下这个 21 天习惯养成的可行性吧。

mitmproxy 只能抓包，但是抓完之后就罢工了。所以这里使用 mitmdump，它可以和 python 结合使用，对返回的数据进行一个处理。

```python
def response(flow):
    url = 'https://groupyd.chaoxing.com/apis/topic/getTopicListWithPoff?'

    if flow.request.url.startswith(url):
        data_list = json.loads(flow.response.text)['data']['list']
        print(data_list)
        json_str = json.dumps(data_list,ensure_ascii=False)
        with open('data.json','a+') as f:
            f.write(json_str)
```

将上述的代码写入 mitmuse1.py 文件中，然后运行

```bash
mitmdump -s mitmuse1.py
```

这里我先把所有的 json 数据写入到一个文件里面，然后再对数据进行统一的分析，这样的好处是占用内存小。

## 分析

![image-20200119093308992](https://tva1.sinaimg.cn/large/006tNbRwgy1gb1mame47mj30s10dfwf8.jpg)

![截屏2020-01-19上午10.05.45](https://tva1.sinaimg.cn/large/006tNbRwgy1gb1n9p1ksqj30nj0hodm7.jpg)

排名第一的竟然是 **《活着》** ！？因为读过这本书，所以我觉得这个结果过于魔幻现实了。

余华的这本书绝对不是《水浒传》那种老少咸宜的读物，甚至于高中时期我们将他的书戏称为“黑暗圣经”，两倍于第二名《红楼梦》的结果让我有点无法接受(老实说红楼梦排第二也挺魔幻的，但是考虑到院里女生居多就不讨论了...)

排名第三的中规中矩，**《平凡的世界》** 我也读过，这是如中当年的入学推荐读物(满满的回忆)

第四名。。。？？？？？？？？？？？？？？？

于是我开始打发假期的无聊时光。

进行文本进行对比筛查，经过一系列的折腾之后，得到如下的结果。

![image-20200119094246243](https://tva1.sinaimg.cn/large/006tNbRwgy1gb1mkm5wb8j30rg0i3win.jpg)

这里只打印出了差异值 **<=5** 的文本，可以看到，差异值越低，文本的相似度越高。

最终可以得出结论，仅仅是在我院的内部的关于活着的 237 篇笔记，就出现了很多的雷同。所以，这次活动的出发点无疑是好的，但是可笑的地方在于， **主体不明，执行不力** ，到头来只是平白增加了很多同学的负担罢了。

要么本着自愿的原则，鼓励报名，宽松监管，自觉养成。

但是既然选择了强制执行，就有必要搭配强有力的监管机制，不然像现在这样，我有足够的理由相信，这次的活动并非是为了“同学们”，而不过是一次常见的劳民伤财的"面子工程"罢了。

# 后记

本篇文章是使用 typora 完成的，搭配 ipic 的自动上传图片的功能，确实编辑时的体验比印象笔记好很多。

由于自动化卡在了苹果开发者证书上面（是不是应该配一台安卓机了？），所以本轮的爬虫复习与学习理论上只剩下了 scrapy，接下来几天大概就是佛系生活，等过完年在考虑密码学的事情 8 :dizzy_face:

回家之后，走亲访友，陪老爸看病，经过几天的忙碌，把零零散散的琐事都清了一遍，闲下来之后，主要就干了三件事，一个是涛哥的 XMiner 项目，一个是爬虫，还有就是。。。补电视剧（笑，密码学等爬虫搞完之后再说吧。

做菜方面，也没什么太大的进步，感觉接近一年没有进厨房，很多的手艺都生疏了啊。

久违的和老哥们开黑玩游戏，这才是俺想要的快乐寒假（虽然一直在输 o(╥﹏╥)o
