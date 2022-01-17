---
title: django-shell-inject-script
date: 2022-01-17 16:23:41
tags:
---

在 django, 或者其他的 python 交互式 shell 中, 有时候需要进入到 shell 中进行调试工作, 但是当调试的代码量较大， 或者调试十分地频繁的时候, 这种操作会变得十分地痛苦, 在线上环境中的调试尤甚.

本篇会介绍一个注入脚本, 可以方便地在 python 的交互式 shell 中进行调试.

<!-- more -->

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
