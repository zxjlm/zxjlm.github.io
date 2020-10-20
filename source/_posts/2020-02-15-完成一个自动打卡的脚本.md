---
layout: post
cid: 216
title: 完成一个自动打卡的脚本
slug: 216
date: 2020/02/15 14:01:31
updated: 2020/02/15 14:01:31
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
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
hidden: false
---

# 完成一个自动打卡的脚本

## 前言

由于近期疫情猖獗，学校开始要求大家进行每日的健康打卡。

但是对于笔者这种死宅，根本不会出门的那种，每日的打卡基本上都是一模一样的内容。这种情况下打卡反而成了一种负担，如果哪天忙忘了，又免不了被一顿批评。

程序员自然有程序员的解决办法。所以这里就做了一个自动打卡的脚本，托管在服务器上，这样就可以不用去管这件事情咯。

<!-- more -->

## 游戏开始

技术清单

1. python
2. Linux
3. 网页制作常识

### 1. 捕获 API

交互的一个关键时间节点就在**点击提交的时候**，分析这个时候所有的网络请求，找到向服务器发出请求的那个 api。

![image-20200215132901387](http://typora-zxj.oss-cn-beijing.aliyuncs.com/typora/20200215132905-267194.png)

这是一个**POST 方法**的 API，我们还要找到 POST 了哪些数据

![image-20200215133047464](http://typora-zxj.oss-cn-beijing.aliyuncs.com/typora/20200215133049-114377.png)

API 捕获完毕。

### 2. 使用 python 模拟请求

通过 python 向这个 API 发送具有相同数据的 POST 请求，代码如下

```python
data = {
    'DATETIME_CYCLE': '2020/02/14',
    'RYLX_973890': '本科生',
    'DWMC_52258': '人工智能与信息技术学院',
    'DLM_368457': 'masaike',
    'XM_28154': 'masaike',
    'RADIO_363902': 'masaike',
    'TEXT_311465': 'masaike',
    'TEXT_834053': 'masaike',
    'RADIO_241490': '国内其他城市',
    'PICKER_6022': '江苏省,南通市,如皋市',
    'RADIO_443904': '以上都不是',
    'RADIO_685230': '以上都不是',
    'TEXT_252907': '36.5',
    'TEXT_386522': '36.5',
    'CHECKBOX_168245': '完全健康',
    'RADIO_452067': '否',
    'TEXT_12061': '',
    'TEXTAREA_21834': ''
}


url = 'https://pdc.njucm.edu.cn/pdc/formDesignApi/dataFormSave?wid=9D9A0F8F21FF5286E0533200140A8E52&userId=084517124'


headers = {
    'Host': 'pdc.njucm.edu.cn',
    'Origin': 'https://pdc.njucm.edu.cn',
    'Referer': 'https://pdc.njucm.edu.cn/pdc/formDesignApi/S/LhU8pTKv',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36',
}

res = requests.post(url,data=data,headers=headers)
if res.status_code != 200:
    print('warning!failure.')
else:
    print('success')
```

这一步基本上没什么好疑问的，最后判断一下返回码是否是 200。

### 3. 定时执行

这一步可以使用 python 的 time 模块实现，比如程序睡眠 24h 再循环执行一次，但是这样会有一个进程始终活在计算机里，并且一旦计算机运行发生波动，就要重新启动一次，想想就麻烦地头皮发麻。

所以，这里选择使用 Linux 内置的 cron 模块完成。

#### 3.1 修改原来的 python 代码

原先的 python 代码有一个小问题，_DATETIME_CYCLE_ 这一项被固定了，所以这里使用 python 的 datetime 模块完成时间的动态变化。

```python
date = str(datetime.date.today()).replace('-','/')
```

#### 3.2 Linux 操作

##### 3.2.1 安装 crontabs 并设置开机自启

```bash
yum install crontabs
systemctl enable crond(开机启动)
systemctl start crond(启动cron服务)
systemctl status crond(查看运行状态)
```

##### 3.2.2 配置 crontabs

```bash
vi /etc/crontab
```

结果如下

```bash
Example of job definition:
.---------------- minute (0 - 59)
| .------------- hour (0 - 23)
| | .---------- day of month (1 - 31)
| | | .------- month (1 - 12) OR jan,feb,mar,apr ...
| | | | .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
| | | | |
* * * * * user-name command to be executed
```

这是一个关于配置服务的参数说明，这里笔者从网上找到了一些更加具体的例子。

- `*/30 * * * root /usr/local/mycommand.sh` (每天，每 30 分钟执行一次 mycommand 命令)
- `* 3 * * * root /usr/local/mycommand.sh` (每天凌晨三点，执行命令脚本，PS:这里由于第一个的分钟没有设置，那么就会每天凌晨 3 点的每分钟都执行一次命令)
- `0 3 * * * root /usr/local/mycommand.sh` (这样就是每天凌晨三点整执行一次命令脚本)
- `*/10 11-13 * * * root /usr/local/mycommand.sh` (每天 11 点到 13 点之间，每 10 分钟执行一次命令脚本，这一种用法也很常用)
- `10-30 * * * * root /usr/local/mycommand.sh` (每小时的 10-30 分钟，每分钟执行一次命令脚本，共执行 20 次)
- `10,30 * * * * * root /usr/local/mycommand.sh` (每小时的 10,30 分钟，分别执行一次命令脚本，共执行 2 次）

配置完成之后，使用

```bash
crontab /etc/crontab
```

命令重载任务，使我们更改的项目生效。

##### 3.2.3 其他必要说明

```shell
crontab -l      查看任务
tail -f /var/log/cron     查看运行记录
```

## 总结

一顿操作之后，终于搞完了自动打卡的脚本。

emmmm。。。总共花了大概 20min，感觉如果每天打卡的话反而花的时间会更少一点！？

算了，反正也是闲着(笑
