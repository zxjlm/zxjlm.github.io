---
title: doccano的使用注意
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2022-04-12 20:58:22
updated: 2022-04-12 20:58:22
tags:
  - NLP
categories:
  - 源流清泉
  - Python
customSummary:
thumb:
thumbDesc:
thumbSmall:
---


> 本篇完成于 2022-04-12, 对应的 doccano 版本为 1.6.2.

[doccano](https://github.com/doccano/doccano) 是一个标注平台, 支持图片分类\文本分类\文本标注等多种标注功能.

有关它的一些基础的使用方法, 可以参考 [如何使用文本标注工具——doccano?](https://zhuanlan.zhihu.com/p/371752234) 这篇文章.

本篇主要介绍的是 doccano 在部署时的一些问题和 __自动标注功能__ .

## Docker Compose 构建

doccano 支持多种形式的部署方式, 包括:

- 源码部署(单体应用)
- Docker部署(单体应用)
- Docker Compose部署(集群应用)
- 以及一些国外平台的一键部署

这里笔者使用的是 __Docker Compose__ 部署方式, 因为涉及到一些源码的改动, 使用这种方式是部署起来更加灵活.

doccano 的 docker 构建文件对国内不太友好, 它的后端使用的是 python - django, 而后端项目的管理使用的是 _poetry_. 整个镜像使用的 Linux 发行版是 Debian. 所以在国内的服务器上构建时会陷入 backend 和 nginx 两个组件速度极其缓慢的问题.

这里需要修改一些配置文件, 来适应国内的网络环境, 达到加速构建的目的.

### Debian 加速

在根目录的 _docker_ 文件夹下, 有 _Dockerfile.prod_ 和 _Dockerfile.nginx_ 两个文件, 分别对应了 doccano 的后端和 nginx 的镜像.

可以在文件中找到 _RUN apt-get update_, 在前面加上一行  `sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list` , 也就是我们俗称的 "换源" . 这里由于笔者是使用的 _阿里云_ 的服务器, 所以换的是阿里的源.

### Poetry

Poetry的安装需要用到他们 [Github仓库](https://github.com/python-poetry/poetry) 的 get-poetry.py 文件, 在国内网络环境下, 下载这个文件会很玄学, 所以推荐先将文件放入构建目录 _backend_, 只有这个文件是不够的, 文件中会触发下载 poetry 的最新依赖包, 这个也是托管在 Github上的, 所以也需要提前下载下来.

这样, 就可以把安装 poetry 的 `curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -` 这个命令替换为 `python get-poetry.py --file poetry-1.1.13-linux.tar.gz` 这个命令.

> 补充: 记得更新 CPOY 命令, poetry 的安装先于 python 依赖包的安装.

由于 poetry 的安装包体积较大, 所以建议清理一下, 否则镜像的体积可能会超过 100M .

### yarn

yarn 的安装同样会受到一些来自国内网络环境 "微小的阻力", 所以需要进行换源.

具体的操作就是在 `yarn install` 这个命令之前使用 `yarn config set registry https://registry.npm.taobao.org`.

## gnutls_handshake() 问题

在使用yarn进行安装时, 还有可能会出现 gnutls_handshake()的报错.这个错误的具体成因和解决方案可以见于[others-How to solve 'gnutls_handshake() failed' error when doing 'git clone' from github.com ?
](https://www.bswen.com/2021/11/how-to-solve-github-https-clone-error.html) 

这里我使用的是第一种方案, 将https更改为http.

```text
git config --global url."http://github.com/".insteadOf git://github.com/
```

## 自动标注

doccano 在文本标注项目中支持以 RESTFul 的形式调用我们的预测接口. 一些详细的使用方法可以参考 [How to connect to a local REST API for auto annotation?](https://github.com/doccano/doccano/issues/1417).

这里列出一些 Tips.

1. 一般我们会以 __POST__ 的形式来调用接口, 因为 __GET__ 可能会出现 URL 超长的情况.
2. 我们需要将待预测文本放在 __Request Body__ 中, 这需要使用它的一个内置语法, 即 _{{ text }}_ 代表待预测文本. 注意, 双括号中的空格不能省略.
3. 接口返回的的数据需要遵循统一的规范, 这个规范是我们自己决定的.

接口的返回如果使用如下的格式.

```python
[{
    'start_offset': "",
    'end_offset': "",
    'label': ""
}]
```

那么在渲染时就需要使用如下的格式进行匹配.

```js
[
    {% for entity in input %}
        {
            "start_offset": {{ entity.start_offset }},
            "end_offset": {{ entity.end_offset}},
            "label": "{{ entity.label }}"
        }{% if not loop.last %},{% endif %}
    {% endfor %}
]
```
