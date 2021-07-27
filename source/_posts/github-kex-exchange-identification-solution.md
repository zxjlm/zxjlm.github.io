---
title: kex_exchange_identification问题及解决
date: 2021-07-18 20:30:19
updated: 2021-07-18 20:41:35
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: "no"
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
tags:
customSummary:
thumb:
thumbDesc:
thumbSmall:
---

简单地记述了一下在使用 _github_ 时遇到的 **kex_exchange_identification** 错误.

## 问题描述

毕业旅行的博客摸了很久, GitHub 也很有没有用过了, 然后在 _push_ 的时候遇到了这个问题.

系统环境如下:

> OS: MacOS
> shell: zsh

具体报错:

```shell
git push

# output:
# kex_exchange_identification: Connection closed by remote host
```

## 解决方法

1. 确认 _github_ 的 **ssh** 配置没有问题.

2. 使用 `vim ~/.ssh/config` 命令, 打开 ssh 的配置文件.

3. 添加 `IdentityFile ~/.ssh/id_ed25519` 至配置中, 而后配置变更为如下所示.

```shell
Host github.com
   HostName github.com
   User git
   ProxyCommand nc -v -x 127.0.0.1:7890 %h %p
   IdentityFile ~/.ssh/id_ed25519
```

其中, `ProxyCommand` 是指定的 github 代理, 有没有这个字段无所谓, 根据自己的配置即可. 而 `id_ed25519` 为与 github 的 ssh 配置相关联的文件, 这里笔者配置 ssh 时是按照 github 的教程走的, 所以文件就是 `id_ed25519`.

最后, 可以使用 `ssh -T git@github.com` 测试一下, 效果拔群~

## 补充解决方案

当然， 这也有可能是代理失效的原因， 这就要把 `ProxyCommand` 这一行注释掉试试.

## 后续

还是搞不太清楚为啥会突然遇到这个问题, 大概是这段时间往 ssh 配置文件里面添加太多的 key 导致匹配规则混乱吧. 之后如果找到了更详细的问题原因再来更新咯.
