---
layout: post
cid: 15
title: VPS上的一些好物
slug: 15
date: 2018/10/28 10:20:00
updated: 2018/10/28 10:21:35
status: publish
author: harumonia
categories:
  - 见闻录
tags:
  - VPS
thumb:
thumbStyle: default
hidden: false
---

主要介绍了在个人服务器上如何一键安装 ss\ssr，Mtproto（telegram）,以及 ssh 突然断开的处理方法(主要是国外服务器容易出现断连的问题)。

<!-- more -->

## SS 一键安装脚本

```shell
wget --no-check-certificate -O shadowsocks-libev_CN.sh https://raw.githubusercontent.com/uxh/shadowsocks_bash/master/shadowsocks-libev_CN.sh && bash shadowsocks-libev_CN.sh
```

### 2020-09 补充说明

逗比的 ss 安装脚本已经被 ban 了很久了，如果有这方面需求的不如去订阅相关的服务，如果和别人合订的话开销大概 15 元/月 即可。

## Mtproto 安装

Mtproto 是 telegram 所使用的一个代理，这里再安利一波 telegram，很好用的社交软件，注重与保护隐私。

```shell
wget -N --no-check-certificate https://raw.githubusercontent.com/ToyoDAdoubi/doubi/master/mtproxy.sh && chmod +x mtproxy.sh && bash mtproxy.sh
```

## ssh 突然断开的处理办法

1、安装 screen 命令

```shell
yum install screen
```

2、创建一个虚拟会话(amh 为自定义会话名称，可以自己更改)

```shell
screen -S amh
```

3、以下载安装 amh 控制面板为例，下载并执行 amh 面板安装脚本

```shell
wget http://amh.sh/file/AMH/4.2/amh.sh && chmod 775 amh.sh && ./amh.sh 2>&1 | tee amh.log
```

4、如果安装过程中，链接中断，重连 SSH 后输入

```shell
screen -r amh
```

即可查看之前任务的进度并可以继续执行。

### 扩展阅读

- screen -ls #查看所有 screen 会话
- 按键盘上面的 Ctrl+a，然后再按 d #保存当前的 screen 会话
- exit #退出 screen
- screen -wipe mysql5.5 #删除会话

## tcp—brr

具体可以自行谷歌
