---
title: pycharm-docker-compose-mode
date: 2022-05-28 17:53:00
tags:
---

本篇是关于如何在Pycharm中使用Docker Compose的. 开篇比较啰嗦, 大抵是淌过的一些坑, 实际的配置内容自 [转](#转) 这一节开始.

<!-- more -->

## 起

公司的项目是通过 `docker compose` 进行管理, 包含 nginx \ sql \ backend 等几个部分, 后端开发的时候, 主要关注的是 backend 服务.

backend 具有如下的一个目录结构, 在开发时, 通用的一个方法是使用 `docker compose up -d` 开启集群服务, 然后使用 `vscode` 的 docker 相关的插件, `attach` 到对应的服务中, 进行开发. 由于使用了 -v 挂载目录, 所以不需要担心修改内容丢失的问题.

```text
├── django_www
    ├── ...
    ├── manage.py
    ├── poetry.lock
    ├── poetry.toml
    ├── pyproject.toml
    └── pytest.ini
├── docker-compose.yml
├── frontend
├── Dockerfile
└── ...
```

笔者算是第一次用 vscode 进行项目级别的后端开发, 在配置玩 python 的各种插件之后, 终于是完成了 __文本编辑器__ 到 ___IDE__ 的蜕变.

不过作为一个3年 pycharm 用户, 闲暇之余, 自然是比较好奇项目在TL口中"比较麻烦"的 pycharm 是个什么样子.

## 承

pycharm在官方文档中有 [docker-compose](https://www.jetbrains.com/help/pycharm/using-docker-compose-as-a-remote-interpreter.html#summary) 这样一篇配置教程. 按照这个流程走完之后, 就可以在pycharm中运行一个demo级的 docker-compose 结构的项目.

但是项目的运行却出现了问题. 项目的依赖使用 poetry 进行管理, Dockerfile 中只存在 `poetry install --no-dev` 这样的依赖安装流程, 这是因为这样的安装不会牵扯进开发级别的依赖, 如 `pytest` \ `mypy` 等ci相关的依赖. 所以在开发的时候, 还需要在容器中执行 `poetry install` 或者 `poetry update` 来将缺失的开发依赖加进来.

这样就引出了我们遇到的问题, container 一旦重启, 那就需要重新执行一遍安装命令, 当开发依赖很多时, 这个过程就很痛苦了. 使用 `vscode -> attach docker container` 的方法, 我们可以保证在不重启容器的情况下完成开发. 但是对于 pycharm 来说, 每一次启动, 都会对容器进行重建, 那我们之前安装的东西就全清空了.

自然地, 笔者开始寻找 pycharm 中有没有不重建容器的办法, 因为在 django 的运行配置中, 有 `docker compose` 一栏, 能够配置相关的命令和参数, 但是这里只能配置pycharm支持的命令和参数, `docker compose up --no-recreate` 之类的命令恰好是不被支持的.

那pycharm为什么会选择每次运行都 recreate 容器呢?

`inspect` 到 pycharm 创建的容器中, 可以发现, 它并没有按照 `docker-compose.yaml` 文件中的 `command` 执行, 而是启动了如下的命令.

```json
"Args": [
            "-u",
            "/opt/.pycharm_helpers/pydev/pydevd.py",
            "--multiprocess",
            "--qt-support=auto",
            "--port",
            "56286",
            "--file",
            "/var/www/src/django_www/manage.py",
            "runserver",
            "0.0.0.0:3001"
        ]
```

看来是 pycharm 用自带的命令组替换了我们之前用来锚定容器的 `tail` 命令.

:todo:

到此, pycharm 重启容器的探索宣告破产, 而 pycharm 目前并不支持 attach 的方法, 但是似乎可以通过 ssh 来当做远程开发?

## 转

笔者并没有在 ssh 的路上走下去, 因为到这里我才发现是路走偏了.

目前的困境的成因, 主要还是每次启动程序都会 recreate 容器, 而更上一层的原因则是, __开发环境与生产环境的割裂__ , 导致我们需要在生产环境的docker中, 将环境更新为开发环境. 那何不一开始就搭建一个开发环境呢? 这样任他重建多少次, 我都不需要在对容器环境上下其手, 开箱即用便是.

于是笔者对项目的目录结构稍作修改.

```text
├── django_www
    ├── ...
    ├── manage.py
    ├── poetry.lock
    ├── poetry.toml
    ├── pyproject.toml
    └── pytest.ini
├── docker-compose.yml
├── docker-compose.dev.yml
├── frontend
├── Dockerfile
├── dev.Dockerfile
└── ...
```

然后在安装的时候再加入了一些小trick.

1. 生产环境使用的是私有源, 开发环境下这个源下载速度较慢.  
包含两种源, 分别是python和linux的源.  
解决python的源需要修改 poetry 的配置文件, 也就是 pyproject.toml 和 poetry.lock, 但是这两个文件是无法通过上述的方法去copy一个替代品的, 所以在安装的时候, 使用 `sed` 命令将其中的私有源替换为加速源.  
解决linux源的问题与python的方法无二, 修改 source.list 文件.  

2. 对于 pure(slim\apline) 镜像, 先将常用的软件安装齐备.  
生产环境的镜像为了瘦身, 往往会将很多软件剪除, 但是开发环境需要这些常用的工具用来调试与监测, 如 `ping` \ `top` \ `vim` 等.

...

## 合

看起来, 如果纠结于使用 pycharm 的话, 在项目的结构上就有了比较严格的约束. :todo: 那么这到底是是 docker 的开发模式的问题, 还是 pycharm 的设计问题呢?

关于Docker在开发中的使用.

摆脱docker进行开发?  --- 我在doccano的二次开发中进行了这样的尝试.

性能比较.  ide用来进行主力项目的开发, 而vscode则可以用来展开其他项目.
