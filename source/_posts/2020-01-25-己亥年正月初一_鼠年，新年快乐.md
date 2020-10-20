---
layout: post
cid: 208
title: 己亥年正月初一:鼠年，新年快乐
slug: 208
date: 2020/01/25 15:27:00
updated: 2020/02/05 20:18:55
status: publish
author: harumonia
categories:
  - 源流清泉
tags:
  - 疫情之下
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: true
---

## 关于疫情

各地的疫情警报使得今年的春节有一种别样的味道。

我看到有人心系灾区捐款捐物，也看到有人趁此机会将自己推上舆论的风口攫取利益；我看到有人抱着舍身取义的心态奔赴一线，也看到有人仅将其作为茶余饭后的谈资不值一哂。

灾难面前众生百态，精彩如同一部小说，却远比我看过的任何小说都要精彩。对人的刻画，对社会的刻画，名为现实的大作家，以它的春秋笔法，将一切尽书于人前。

感慨就到这里吧，作为一个程序员，我们能做什么呢？

开启这个项目的起因是 severchain 发起的一个疫情推送功能，但是由于请求次数过多，服务器负载超限，不得已又停止了服务。我虽然不会做推送，但是搭建一个简单的疫情实况 api 还是很熟练地。

正好可以将寒假的两大技能 **爬虫和 Flask** ，做一个综合运用。

<!-- more -->

### 数据的获取

[丁香医生](https://3g.dxy.cn/newh5/view/pneumonia)

[百度播报](https://voice.baidu.com/act/newpneumonia/newpneumonia)

新浪微博(各地的官方微博)

**以上的数据源到 2020 年 1 月 25 日，丁香医生和百度播报的统计数量达成了一致，但是私以为最接近真实情况的还是各地卫生部门官方微博的信息**

这里以丁香医生为例。

```py
from bs4 import BeautifulSoup
import requests


headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 '
                  'Safari/537.36 '
}


def get_info(url):
    res = requests.get(url, headers=headers)
    res.encoding = 'UTF-8'
    soup = BeautifulSoup(res.text, 'lxml')
    return soup

soup = get_info('https://3g.dxy.cn/newh5/view/pneumonia')

```

### 数据的存取

对于这种 **二维、轻量** 的数据，比较好的选择是使用 _sqlite_ 。

简单粗暴地直接只用 csv 文件也并无不可。

更优雅一点的办法是使用 _Redis_ 以键值对的形式存储。

### 数据的加工

首先是对原始数据 _soup_ 的数据提取。这里根据丁香的数据传输特性，使用正则模块和 json 模块，对原始数据进行分析

最终的结果如下所示

```json
[{
	"provinceName": "湖北省",
	"provinceShortName": "湖北",
	"confirmedCount": 729,
	"suspectedCount": 0,
	"curedCount": 32,
	"deadCount": 39,
	"comment": "",
	"cities": [{
		"cityName": "武汉",
		"confirmedCount": 572,
		"suspectedCount": 0,
		"curedCount": 32,
		"deadCount": 38
	}, {
		"cityName": "黄冈",
		"confirmedCount": 64,
		"suspectedCount": 0,
		"curedCount": 0,
		"deadCount": 0
	}, {
		"cityName": "孝感",
		"confirmedCount": 26,
		"suspectedCount": 0,
		"curedCount": 0,
		"deadCount": 0
	}, {
        .............
```

然后将数据进行可视化，形成中国省级单位的疫情地图 ![image-20200125150547598](https://tva1.sinaimg.cn/large/006tNbRwgy1gb8tmiweq7j30v90m0juu.jpg)

### 持续获取

以上只是实现了单次的地图绘制，这显然和要求还有很大的差距。如何进行持续地数据爬取与更新呢？

#### 方法一：服务器层面

对于 **Linux** 熟悉的，可以在 Linux 上设置一个定时启动的任务，按照固定的间隔时间进行数据的爬取与存储

#### 方法二：爬虫层面

(这是一个替代方案)设置爬虫的睡眠时间 _time.sleep_ ，这无疑是最简单的实现方法，缺点也很明显，程序的健壮性差，很容易出现程序崩溃、停摆的情况

### api 制作

这里使用 flask 进行 api 的制作(一命通关，没有出 bug，忽然感觉这半年的活儿没白干( >﹏<。)～)

```python
@main.route('/api/{}/query_by_province'.format(api_level), methods=["POST"])
def query_by_province():
    '''
		通过省份的名字进行查询
    :return:
    '''
    try:
      provinceName = provrequest.get_json()
      res = Province.query.filter_by(provinceName = provinceName).first()
    	return jsonify({'code':1,'res':res.to_json()})
    except Expection as e:
      print(e)
      return jsonify({'code':-1})
```

### 后续发展

- 推送

  通过微信等渠道构建 robot，然后实现定向省份的疫情实况推送

- 数据分析

  正如 Google 流感趋势(Google Flu Trends)所做的那样，我们可以根据相关的数据进行一些有效地分析。

  另外， **数据是非常珍贵的** ，目前大部分的媒体只会给出纵向的数据，而不会给出横向的数据，所以，这不仅是一个数据加工处理的过程，同样是一个 **数据积累的过程** 。

  但是，值得注意的一点是，官方公布的数据不一定为真实数据。

## 关于鼠年

人生的第二个本命年，与预想的不太一样，中间出现了太多的波折，以至于我在第一个本命年的时光胶囊里的话大半沦为了空想。

不过本篇不是为了感慨这些所作，就在这里，祝所有的朋友，祝阿套，祝我自己，鼠年大吉~~~
