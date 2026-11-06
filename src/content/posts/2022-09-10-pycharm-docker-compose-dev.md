---
title: Pycharm 和 VSCode 的 docker compose 开发模式
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2022-05-28 17:53:00
updated:
categories:
  - 源流清泉
  - Python
tags:
  - Python
  - Docker
---


本篇是关于如何在 Pycharm 和 VSCode 中使用 Docker Compose 的. 开篇比较啰嗦, 大抵是踩过的一些坑和问题的解决过程, 实际的配置内容自 [转](#转) 这一节开始.

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

### VSCode 中的开发模式

想要在 PyCharm 中实现 docker compose dev , 最好是能够先了解这样的开发模式在 vscode 运作的核心流程 \ 原理.

在 VSCode 中选择 __attach to a running container__ 之后, 首先会看到编辑器提示 __start dev container...__, 随后, 容器中会安装(如果是第一次 attach )并启动一系列的 `vscode-server` 进程. 这实际上与之前使用 `ssh` 连接远程服务器 (remote-server) 进行开发的过程是差不多的. (当然, 从命令的角度来看, attach 与 ssh 存在本质上的区别, exec 更加接进 ssh)

于是, 可以总结出基于 vscode 的开发流程如下:

1. attach 到运行中的项目容器
2. 安装 vscode-server && 安装 vscode-extensions
3. 完成开发的前置工作.

### 在 PyCharm 中复刻?

pycharm 在官方文档中有 [docker-compose](https://www.jetbrains.com/help/pycharm/using-docker-compose-as-a-remote-interpreter.html#summary) 这样一篇配置教程. 按照这个流程走完之后, 就可以在pycharm中运行一个 demo 级的 docker-compose 结构的项目.

但是项目的运行却出现了问题. 项目的依赖使用 poetry 进行管理, Dockerfile 中只存在 `poetry install --no-dev` 这样的依赖安装流程, 这是因为这样的安装不会牵扯进 _开发级别_ 的依赖, 如 `pytest` \ `mypy` 等ci相关的依赖. 所以在开发的时候, 还需要在容器中执行 `poetry install` 或者 `poetry update` 来将缺失的开发依赖加进来.

这样就引出了我们遇到的问题, container 一旦重启, 那就 __需要重新执行一遍安装命令__ , 当开发依赖很多时, 这个过程就很痛苦了. 使用 `vscode -> attach docker container` 的方法, 我们可以保证在不重启容器的情况下完成开发. 但是对于 pycharm 来说, 每一次启动, 都会对容器进行重建, 那我们之前安装的东西就全清空了.

自然地, 笔者开始寻找 pycharm 中有没有不重建容器的办法, 因为在 django 的运行配置中, 有 `docker compose` 一栏, 能够配置相关的命令和参数, 但是这里只能配置pycharm支持的命令和参数, `docker compose up --no-recreate` 之类的命令恰好是[不被支持](https://youtrack.jetbrains.com/issue/PY-47305)的.

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

看来是 pycharm 用自带的命令组替换了我们之前用来锚定容器的 `tail` 命令. 再更深一步地看一下, PyCharm是怎样实现这种 `cmd` 替换的?

监控 PyCharm 的运行过程, 捕获到如下的指令:

```shell
/usr/local/bin/docker-compose -f /Users/xinjian.zhang/Projects/Garena/WebSZ/kop-event/shipdoom.kop.kingdomofpirate.com/src/docker-compose.dev.yml -f /Users/xinjian.zhang/Library/Caches/JetBrains/PyCharm2022.1/tmp/docker-compose.override.890.yml up --exit-code-from web --abort-on-container-exit web
```

结合 [官方文档中关于 multi file](https://docs.docker.com/compose/extends/) 的说明, 得到 PyCharm 在 compose 中的 Debug 运行过程.

1. 使用自带的 override.yml 来追加 \ 覆盖原有的构建文件.
2. 在 container 中开启一个调试器 (pydev debugger)
3. attach 到 container 中, 并连接 (connect) 上调试器

到此, 基本上可以确定, 无法在 PyCharm 中复刻 vscode 的 `attach` 开发模式. 不过正如前文所说, vscode 的 `attach` 实际上是 `ssh` 的变种, 对于 PyCharm 来说, 实现 ssh remote 开发是完全没有问题的. 不过笔者并没有在 `ssh` 的路上继续走下去.

## 转

总结一下目前的困境的成因, 主要还是每次启动程序都会 recreate 容器, 而更上一层的原因则是, __开发环境与生产环境的割裂__ , 导致我们需要在生产环境的docker中, 将环境更新为开发环境. 那何不一开始就搭建一个开发环境呢? 这样任他重建多少次, 我都不需要在对容器环境上下其手, 开箱即用便是.

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

3. 使用 override config 来升格 docker-compose.dev.yml.  
Docker Compose 是支持在构建时使用两份 yml 文件的, 详见 [Share Compose configurations between files and projects](https://docs.docker.com/compose/extends/), 所以我们可以将 dev 环境的 compose 作为一个 override 配置来使用, 从而避免污染项目目录.

### 20220604内容增补

上述目录结构中的 `dev.Dockerfile` 文件其实也并非必要, 在 [docker compose 3.4](https://docs.docker.com/compose/compose-file/compose-versioning/#version-34) 的版本更新中加入了 __target__ 参数, 用来指定构建 _Dockerfile_ 中的哪一个区块, 至此, _prod_ 和 _dev_ 的构建指令就可以合并到一份文件中了.

## 合

至此, 对 __pycharm 运行 docker-compose 下的 django__ 的探索告一段落. 不过过程中产生的一些疑惑与问题还需要更多的深入研究来解开.

### 基于 docker compose 的开发策略

看起来, 如果纠结于使用 pycharm 的话, 在项目的结构上就有了比较严格的约束. 那么这到底是是 docker 的开发模式的问题, 还是 pycharm 的设计问题呢?

在详细地查阅了相关的文档之后发现, vscode 的其实提供了 [两种基于 contaniner 的开发方案](https://code.visualstudio.com/docs/remote/containers#_working-with-containers). 其中, [使用 docker-compose](https://code.visualstudio.com/docs/remote/create-dev-container#_use-docker-compose) 的开发方案中提供了详尽的外装开发模式的配置策略. 基于这个文档策略, 甚至可以对 PyCharm 文档中给出的 compose 开发方案进行进一步的优化... (不愧是宇宙第一开发工具😰)

vscode 所提供的两种配置, 目前看来都是基于 attach 的, 所以在性能上应该差距不大, 只不过配置 devcontainer 可以避免直接 attach 造成的 _重建_ 相关的问题.

### Docker 在开发中的使用

基于 docker compose 的开发方案究竟是掣肘还是利器?

摆脱docker进行开发?  --- 我在doccano的二次开发中进行了这样的尝试.

### 性能比较

> 以下的负载统计均为程序运行一段时间后趋于稳定的负载信息. 即使如此, 以下的统计依然过于粗略, 看个乐呵就行.

总的来说, pycharm 看上去容器的负载会比 vscode 低一些, 不过推测是 IDE 将一部分插件的功能转嫁到程序本身, 而编辑器则是将这部份损耗通过 vscode-server 一并附加到了容器中.

#### vscode

![docker 空载](https://raw.githubusercontent.com/zxjlm/my-static-files/main/img/docker%E7%A9%BA%E8%BD%BD.png)

图片解释: 由于预先安装了 vscode-server, 所以会存在部分 vscode 相关的程序.

server 端的 vscode 中安装的插件如下:

- batisteo.vscode-django-1.10.0
- ms-python.python-2022.6.2
- ms-python.vscode-pylance-2022.5.3
- ms-toolsai.jupyter-2022.4.1021342353
- ms-toolsai.jupyter-keymap-1.0.0
- ms-toolsai.jupyter-renderers-1.0.7
- ms-vscode.makefile-tools-0.5.0
- njpwerner.autodocstring-0.6.1

下图则是运行 django 之后的负载情况.

![docker-djagno](https://raw.githubusercontent.com/zxjlm/my-static-files/main/img/docker-attach-django.png)

#### pycharm

![pycharm-django](https://raw.githubusercontent.com/zxjlm/my-static-files/main/img/pycharm-compose.png)

## Reference

- [Configure an interpreter using Docker Compose](https://www.jetbrains.com/help/pycharm/using-docker-compose-as-a-remote-interpreter.html)
- [How to SSH into a Docker Container – Secure Shell vs Docker Attach](https://www.freecodecamp.org/news/how-to-ssh-into-a-docker-container-secure-shell-vs-docker-attach/)
- [docker attach](https://docs.docker.com/engine/reference/commandline/attach/)
- [Developing inside a Container](https://code.visualstudio.com/docs/remote/containers#_working-with-containers)
- [Create a development container](https://code.visualstudio.com/docs/remote/create-dev-container)
