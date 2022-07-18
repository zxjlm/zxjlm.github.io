---
title: django-shell-inject-script
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2022-02-17 16:23:41
updated: 2022-02-17 16:23:41
tags:
customSummary:
thumb:
thumbDesc:
thumbSmall:
---


在 django, 或者其他的 python 交互式 shell 中, 有时候需要进入到 shell 中进行调试工作, 但是当调试的代码量较大， 或者调试十分地频繁的时候, 这种操作会变得十分地痛苦, 在线上环境中的调试尤甚.

本篇会介绍一个注入脚本, 可以方便地在 python 的交互式 shell 中进行调试.

<!-- more -->

## Django Shell 注入脚本

如下一个查询缓存的注入脚本.

```shell
#!/bin/bash

/usr/bin/expect <<EOF
spawn python3 manage.py shell
expect ">>>"
send "from django.core.cache import cache\r"
expect ">>>"
send "cache.keys('*')\r"
expect ">>>"
send "exit()\r"
expect eof
EOF
```

expect是一个自动化交互套件，主要应用于执行命令和程序时，系统以交互形式要求输入指定字符串，实现交互通信。

expect自动交互流程：

spawn启动指定进程---expect获取指定关键字---send向指定程序发送指定字符---执行完成退出.

注意该脚本能够执行的前提是安装了expect.

expect 常用命令总结:

```plain_text
spawn               交互程序开始后面跟命令或者指定程序
expect              获取匹配信息匹配成功则执行expect后面的程序动作
send exp_send       用于发送指定的字符串信息
exp_continue        在expect中多次匹配就需要用到
send_user           用来打印输出 相当于shell中的echo
exit                退出expect脚本
eof                 expect执行结束 退出
set                 定义变量
puts                输出变量
set timeout         设置超时时间
```

## 基于kubernetes的django shell注入

待补充
