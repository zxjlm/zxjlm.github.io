---
layout: post
title: awk 学习记录
date: 2020-11-24 17:44:26
updated: 2020-12-15 11:21:00
status: publish
author: harumonia
categories:
  - 源流清泉
  - Shell
tags:
  - awk
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
email: zxjlm233@gmail.com
hidden: false
---

上周在外网搭建了一个服务,主要是用来对 Mori 的各种处理状态做测试.

今天在看网站统计的时候,发现请求的次数不太正常,主要表现就是出现了下面这种画风的请求.

```bash
INFO:     174.49.25.36:51271 - "GET / HTTP/1.1" 200 OK
INFO:     14.139.155.142:41680 - "GET /currentsetting.htm HTTP/1.1" 404 Not Found
INFO:     91.241.19.84:58868 - "GET /wp-content/plugins/wp-file-manager/readme.txt HTTP/1.1" 404 Not Found
INFO:     91.241.19.84:58844 - "GET /?XDEBUG_SESSION_START=phpstorm HTTP/1.1" 200 OK
INFO:     91.241.19.84:42642 - "GET /console/ HTTP/1.1" 404 Not Found
INFO:     91.241.19.84:36206 - "POST /api/jsonws/invoke HTTP/1.1" 404 Not Found
INFO:     91.241.19.84:55124 - "POST /vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php HTTP/1.1" 404 Not Found
INFO:     91.241.19.84:36174 - "GET /vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php HTTP/1.1" 404 Not Found
INFO:     91.241.19.84:42156 - "GET /index.php?s=/Index/\think\app/invokefunction&function=call_user_func_array&vars[0]=md5&vars[1][]=HelloThinkPHP21 HTTP/1.1" 404 Not Found
INFO:     91.241.19.84:52646 - "GET /?a=fetch&content=<php>die(@md5(HelloThinkCMF))</php> HTTP/1.1" 200 OK
INFO:     91.241.19.84:53606 - "GET /solr/admin/info/system?wt=json HTTP/1.1" 404 Not Found
INFO:     203.205.34.139:47518 - "GET / HTTP/1.1" 200 OK
INFO:     182.185.14.56:62446 - "GET /currentsetting.htm HTTP/1.1" 404 Not Found
```

随手摘了一个 ip (219.149.212.74) 查询了一下,竟然是国内的 = =|||

又想到从大二下接触 web 开发,到现在两年多,部署了几个服务,但是却没有好好分析过网站的日志文件,正好就趁着这个机会看看吧.

<!-- more -->

## 为什么是 awk

通过 python,我们同样可以实现对日志分析的功能,所以,为什么要舍近求远,去使用 awk 呢？我个人的理由如下.

1. 性能
2. 炫酷
3. 简单

[Is AWK faster than Python?](https://www.quora.com/Is-AWK-faster-than-Python) 关于这一点的讨论并不鲜见.从直觉来讲,与原生 linux 系统更加贴近的 awk 应该比万金油语言 python 拥有更好的性能.

不过这位使用的数据量级太低,并且他本人也建议使用大文本再进行一次测试.于是,我使用了公开数据集[SYB62_309_201906_Education](https://data.un.org/_Docs/SYB/CSV/SYB62_309_201906_Education.csv),将其膨胀到 220M,然后又做了一次测试.

在阿里云 1c2g 的轻量级应用服务器上,得到的结果如下.

![linux_res](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/awk_test.PNG)

awk 代码:

```shell
awk 'BEGIN { FPAT = "[^,]*|\"[^\"]+\"" } NR>2 { print $2 "," $3 }' SYB62_309_201906_Education.csv > awk_result.csv
```

python 代码:

```python
import re

with open('../dataSet/SYB62_309_201906_Education.csv', 'r') as f:
    res = []
    for line in f.readlines()[2:]:
        re_ = re.findall(r'(?:\s*(?:(\"[^\"]*\")|([^,]+))\s*,?)+?', line)
        res.append((re_[1][0] or re_[1][1]) + ',' +
                   (re_[2][0] or re_[2][1])+'\n')

with open('../dataSet/reader_normal.csv', 'w') as f:
    f.writelines(res)
```

在进行了相同的数据集分析之后,awk 能够以 **更少的代码量和更高的运行效率** 完成数据集的分割工作.当然,性能只是一个考虑方面,更主要的是,awk 够 geek,而我够闲.

**PS1:**  
之所以说 **在原生 linux 系统上**,是因为我在 wsl 上面同样做过一次测试,得到的结果如下.

![wsl_res](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/awk_wsl.PNG)

**PS2:**  
对于简单的 CSV(comma-separated values) 文件,也就是没有 **"** 和 **,** 等干扰项的文件,使用分割比使用正则有高得多的效率.

## awk 分析网站访问日志

使用的日志是测试 api 的访问记录 access.log,具体的文件信息如下.

```bash
File: ‘access.log’
  Size: 4063334         Blocks: 7944       IO Block: 4096   regular file
Device: fd01h/64769d    Inode: 155109      Links: 1
Access: (0755/-rwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2020-11-25 18:06:33.577884826 +0800
Modify: 2020-11-25 18:06:23.101795585 +0800
Change: 2020-11-25 18:06:23.101795585 +0800
 Birth: -
```

### 日志格式

> format : ip - - [time] "url" statuscode "-" "UA" "-"

```bash
114.220.205.222 - - [10/Aug/2020:09:05:18 +0000] "GET /api/items/5?q=somequery HTTP/1.1" 200 29 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36" "-"
89.248.174.166 - - [10/Aug/2020:09:07:56 +0000] "GET / HTTP/1.1" 200 15 "-" "Mozilla/5.0 zgrab/0.x" "-"
114.220.205.222 - - [10/Aug/2020:09:10:52 +0000] "GET /api/docs HTTP/1.1" 404 555 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36" "-"
114.220.205.222 - - [10/Aug/2020:09:13:10 +0000] "GET /api/docs HTTP/1.1" 404 22 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36" "-"
114.220.205.222 - - [10/Aug/2020:09:13:49 +0000] "GET /api/docs HTTP/1.1" 404 22 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36" "-"
80.82.78.85 - - [10/Aug/2020:09:39:13 +0000] "GET / HTTP/1.1" 200 15 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:76.0) Gecko/20100101 Firefox/76.0" "-"
39.107.127.149 - - [10/Aug/2020:10:14:54 +0000] "GET / HTTP/1.1" 200 15 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:36.0) Gecko/20100101 Firefox/36.0" "-"
180.163.220.68 - - [10/Aug/2020:10:17:12 +0000] "GET / HTTP/1.1" 200 15 "-" "Mozilla/5.0 (Linux; U; Android 8.1.0; zh-CN; EML-AL00 Build/HUAWEIEML-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 baidu.sogo.uc.UCBrowser/11.9.4.974 UWS/2.13.1.48 Mobile Safari/537.36 AliApp(DingTalk/4.5.11) com.alibaba.android.rimet/10487439 Channel/227200 language/zh-CN" "-"
180.163.220.68 - - [10/Aug/2020:10:17:14 +0000] "GET / HTTP/1.1" 200 15 "http://baidu.com/" "Mozilla/5.0 (Linux; U; Android 8.1.0; zh-CN; EML-AL00 Build/HUAWEIEML-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 baidu.sogo.uc.UCBrowser/11.9.4.974 UWS/2.13.1.48 Mobile Safari/537.36 AliApp(DingTalk/4.5.11) com.alibaba.android.rimet/10487439 Channel/227200 language/zh-CN" "-"
42.236.10.78 - - [10/Aug/2020:10:17:27 +0000] "GET / HTTP/1.1" 200 15 "http://baidu.com/" "Mozilla/5.0 (Linux; U; Android 8.1.0; zh-CN; EML-AL00 Build/HUAWEIEML-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 baidu.sogo.uc.UCBrowser/11.9.4.974 UWS/2.13.1.48 Mobile Safari/537.36 AliApp(DingTalk/4.5.11) com.alibaba.android.rimet/10487439 Channel/227200 language/zh-CN" "-"
(normal_test)
```

### 统计访问的人数

在不考虑使用代理的情况下,可以假定一个 ip 代表一个独立访客.

### 统计某个 ip 的总访问次数

首先,在 awk 中是存在 _数组(Array)_ 这个概念的,不过这里的数组更加类似于 c++的 map、python 的 dict.通过索引取值,但是这个索引并不局限于数字,也可以是字符串.也就是说,与其说是 Array,不如说是 Key-Value .

对 ip 的统计主要就是使用了这个功能.我对日志进行遍历,然后做成 **哈希表** ,最后使用 linux 自带的 sort 进行统计.

awk 自身也有排序函数 asort 和 asorti,不过在实际使用的过程中,asort 会破坏原有的 indices,这在 StackOverflow 上吗也有人遇到了同样的问题,[Sort associative array with AWK](https://stackoverflow.com/questions/5342782/sort-associative-array-with-awk).通过原生的 awk 方法解决太麻烦了,所以这里偷个懒直接使用 linux 的 sort 函数.

**ps.** sort 必要的参数说明

> -r, --reverse reverse the result of comparisons  
> -n, --numeric-sort compare according to string numerical value  
> -k, --key=KEYDEF sort via a key; KEYDEF gives location and type

```bash
time gawk '{seen[$1]++} END {for(foo in seen) {print foo,seen[foo]}}' access.log | sort -nrk 2|head

# output
# 132.145.91.50 4305
# 58.210.143.102 316
# 146.56.217.168 162
# 80.82.70.187 155
# 42.51.60.61 155
# 183.136.225.56 105
# 121.235.166.248 100
# 183.136.225.35 78
# 163.177.13.2 78
# 101.251.242.238 78
# gawk '{seen[$1]++} END {for(foo in seen) {print foo,seen[foo]}}' access.log  0.02s user 0.00s system 71% cpu 0.032 total
# sort -nrk 2  0.07s user 0.00s system 74% cpu 0.090 total
# head  0.00s user 0.00s system 1% cpu 0.079 total

```

如果不使用 awk,也可以通过 linux 的组合命令实现统计的效果.

```bash
time awk '{print $1}' access.log | sort -n | uniq -c |sort -nr -k 1|head

# output
# 4305 132.145.91.50
# ... 结果同上
# awk '{print $1}' access.log  0.01s user 0.00s system 41% cpu 0.031 total
# sort -n  0.10s user 0.00s system 68% cpu 0.150 total
# uniq -c  0.03s user 0.00s system 22% cpu 0.155 total
# sort -nr -k 1  0.09s user 0.00s system 39% cpu 0.240 total
# head  0.00s user 0.00s system 0% cpu 0.232 total
```

可以看到,awk 在遍历的同时完成了统计的功能,而命令组则需要反复进行遍历,这就使得命令组的时间消耗大大高于 awk.

### URL 访问量

#### 清洗

根据统计访问量的目标不同,有着不同的清洗思路.

比如想要知道哪些文章点击量更高,又或者是哪个静态文件的访问量高 or 存在异常点击,前者很明显要排除所有 jpg\gif\txt 之类的静态文件,后者则差不多要是前者的补集.

这里以统计 url 接口为例.

```bash
awk '$7 !~ /\/static/ && $7 !~ /\.jpg|\.png|\.jpeg|\.gif|\.css|\.js|\.woff/ {print}' access.log > clean_access.log
```

清洗前后的结果对比.

```bash
wc access.log && wc clean_access.log

# output
#  23587  436203 4063334 access.log
#  22336  407926 3771874 clean_access.log
```

#### 统计

```bash
awk '{seen[$7]++} END {for(foo in seen){print foo,seen[foo]}}' clean_access.log |sort -nr -k 2 |head
```

清洗与统计合并:

```bash
awk '$7 !~ /\/static/ && $7 !~ /\.jpg|\.png|\.jpeg|\.gif|\.css|\.js|\.woff/ {seen[$7]++} END {for(foo in seen){print foo,seen[foo]}}' access.log |sort -nr -k 2 |head
```

### 每日访问量

这里的每日访问量是指包括失败请求、静态资源请求在内的总的访问量. [样例数据](#日志格式)

```bash
awk 'BEGIN {FPAT = "([^ ]+)|\\[([^\\]]+)\\]|(\"[^\"]+\")"} {split($4,a,":");gsub("\\[","",a[1]);seen[a[1]]++} END {for(foo in seen){print foo,seen[foo]}}' access.log|head

# output
# 17/Sep/2020 474
# 14/Sep/2020 81
# 11/Sep/2020 97
# 08/Oct/2020 454
# 31/Oct/2020 996
# 11/Aug/2020 113
# 29/Sep/2020 434
# 05/Oct/2020 436
# 08/Nov/2020 188
# 17/Oct/2020 127
```

#### 分析

> FPAT = "([^ ]+)|\\[([^\\]]+)\\]|(\"[^\"]+\")"

指定了对文件的分割正则,分割之后的时间格式: _[10/Aug/2020:09:05:18 +0000]_

我们需要的是**每日**的访问量,所以要将该时间继续分割提取.

> {split($4,a,":");gsub("\\[","",a[1]);}

做的就是这个工作,提取除精确到 day 的日期. _10/Aug/2020_

再之后使用 map 进行统计计数.

## 补充(持续更新 ing)

### 将 awk 的结果作为 cmd 参数

最简单的使用就像这样.

```shell
echo $(awk)
```

这种用法,可以用来将 docker 中的无效 image 快速移除.

```shell
docker rmi $(docker images |awk '$1=="<none>" {print $3}')
```

## 总结

将以上的脚本整合,然后设置一个定时执行,就可以每天整合一次网站访问记录.配合 echarts,可以将网站访问以漂亮的图表的形式输出.

至此,DIY 网站运行统计收工.
