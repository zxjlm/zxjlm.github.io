---
layout: post
cid: 35
title: flask部署的问题及解决
slug: 35
date: 2019/03/11 15:00:00
updated: 2019/07/22 08:14:30
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - flask
thumb:
thumbStyle: default
hidden: false
---

基于 Ray 的[阿里云部署 Flask + WSGI + Nginx 详解
](https://www.cnblogs.com/Ray-liang/p/4173923.html)对我所做的选课模拟系统进行了服务器端的部署。
环境：flask uwsgi Ubuntu Nginx

<!-- more -->

## Q1

### 端口被占用

查看所有的服务端口（ESTABLISHED

> netstat -a

查看所有的服务端口，显示 pid 号（LISTEN，ESTABLISHED）

> netstat -ap

查看某一（\*\*）端口，则可以结合 grep 命令：

> netstat -ap | grep \*\*

如查看\*\*端口，也可以在终端中输入：

> lsof -i:\*\*

若要停止使用这个端口的程序，使用 kill +对应的 pid

> kill pid

还有一个比较好用的命令，查看\*\*端口：

> sudo netstat -lnp | grep \*\*

查看端口号和运行程序：

> netstat -atunp | more

查看进程所用端口：

> netstat -tlnp|grep \*\*

以上的命令对排查该类问题有很好的帮助。
同时，如果安装了宝塔 Linux 的 LMNP 群的话，就不用再另行

> sudo apt-get install nginx

了，不然宝塔的 Nginx 会占用 80 端口而导致失败。

## Q2

### uwsgi 的配置问题

uwsgi 的配置文件需要在 ray 所提供的样例之上进行适应性调整。
另，评论中指出的

> config.ini 文件
> chdir = /home/www/ 要改成 chdir = /home/www/my_flask

供参考

## Q3

### 502 提示

部署完成之后遇到了 502 提示，在网上查找了许多的解决方案都没有用，后来才发现，uwsgi 所占用的 8001 端口并没有处于运行状态，**手动运行 uwsgi**后网站恢复运行，进而考虑到是`Supervisor`出现问题，使用

> sudo service supervisor start

查找出错误并解决之（似乎是配置文件中指定的 log 文件夹要自己创建，它并不会自动创建这样子）。

## Q4

### 个人的调试办法

在网站第一次全部部署完成之后，出现了很多的小问题，这里我将项目拆解开来进行一步一步的测试

#### S1 检测文件本身是否有问题

方法是直接运行 manage.py

> 这里注意，要用过外网访问 localhost：5000 的话，要使用 python manage.py runserver --host 0.0.0.0

记得要给 5000 端口放行

#### S2 检测 uwsgi 有无问题

uwsgi 成功运行之后了，网站再次变为可访问状态，使用 Ctrl+C 之后，网站再次不可访问，然后配置使用**Supervisor** 将 uwsgi 变为保持开启状态。
操作完成之后，网站变为可访问（依旧是 5000 端口）

### S3 检测 Nginx

不出意外的话，这就是最后一步了，表面上是 Nginx 一直在报错，然而实际上 Nginx 配置并没有什么问题，完成了上述两步的调试之后，Nginx 也就不报错了，这时可以直接使用域名访问网站。

## 关于 flask 制作网站的后续

后面准备给网站加上域名（应该不是这个模拟网站，而是工作室的网站吧）
掌握对网站维护的技巧
以上。
