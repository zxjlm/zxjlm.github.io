---
layout: post
cid: 51
title: flask部署(2)
slug: 51
date: 2019/07/30 21:29:00
updated: 2019/07/31 17:31:53
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

上一篇的部署是用的 uwsgi，这次听说 gunicorn 很方便，就试了一下

<!-- more -->

# 配置

阿里云 ubuntu 16

# 流程

安装 virtualenv
sudo pip install virtualenv

使用 virtualenv
virtualenv ENV 创建目录环境
source ./bin/activate 激活环境

安装 gunicorn
pip install gunicorn

安装依赖包 requirement.txt

启动程序
gunicorn -w 4 -b 0.0.0.0:5001 -D manage:app
这里的-d 意思就是在后台运行，当然你也可以配置守护进程

配置 gunicorn.conf

```conf
# gunicorn.conf

# 并行工作进程数
workers = 2
# 指定每个工作者的线程数
threads = 2
# 监听内网端口5000
bind = '0.0.0.0:5001'
# 设置守护进程,将进程交给supervisor管理
daemon = 'true'
# 工作模式协程
worker_class = 'gevent'
# 设置最大并发量
worker_connections = 2000
# 设置进程文件目录
pidfile = '/var/www/myflask/run/gunicorn.pid'
# 设置访问日志和错误信息日志路径
accesslog = '/var/www/myflask/log/gunicorn_acess.log'
errorlog = '/var/www/myflask/log/gunicorn_error.log'
# 设置日志记录水平
loglevel = 'debug'
```

# 问题 & 解决

Q:setuptools pkg_resources pip wheel failed with error code 1

S:
vi /root/.pip/pip.conf 修改如下:
[global]
index-url = https://pypi.python.org/simple/
[install]
trusted-host=mirrors.aliyun.com trusted-host=pypi.python.org

Q:json 类的报错问题
S:具体的原因我还没有搞明白，Linux 默认的 python3 是 3.5 版本的，但是在进行 jinja2 渲染的时候，常常会出现 json 的报错，两种解决办法。

- 修改源文件，去掉 json 调用
- 将 3.5 手动升级到 3.7
  各有优劣吧，3.5 版本稳定，3.7 要自己去编译升级，很复杂，而复杂往往就意味着出错率高。
  这里我选择了后者，因为开发环境就是 3.7，直接升级到 3.7，一劳永逸。

Q:如何升级到 3.7
S:参考[博客园上的一篇文章](https://segmentfault.com/a/1190000018264955)

Q:升级了 python3.7 之后可能会出现的一些问题

1.Command '('lsb_release', '-a')' returned non-zero exit status 1 问题解决

S:

1.网上有很多的花里胡哨的办法，然后，我，直接把文件删了。。。。

```python3
 rm /usr/bin/lsb_release
```
