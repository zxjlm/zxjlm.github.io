---
title: Christin开发记录(2) - nginx和前后端分离
date: 2021-06-12 18:05:28
updated: 2021-06-15 09:57:56
tags:
  - 毕业设计
author: harumonia
categories:
  - 源流清泉
  - Python
noThumbInfoStyle: default
outdatedNotice: "no"
thumbChoice: default
thumbStyle: default
hidden: false
customSummary:
thumb:
thumbSmall:
email: zxjlm233@gmail.com
---

在[Christin 开发记录(1)](https://blog.harumonia.moe/christin-develop-1/)中， 我们讲过了这个项目的大体的设计思路，本篇以及之后的几篇将会详细地阐述各个技术要点的具体实现方案。

本篇主要的内容是 nginx 在 _前后端分离_ 和 _多语言开发_ 的代理作用.

<!-- more -->

在网站的开发过程中, 前端和后端该如何协调, 常见的有两种方式, 服务器渲染和前后端分离.

在过去, 笔者最常使用的就是服务器渲染为主, 前后端分离为辅的开发方式. 这样做的一个坏处就是很容易造成前后端的开发逻辑混乱, 什么时候用服务器渲染, 什么时候用 api. 最常见的, 在渲染列表时该如何选择, 使用 jinja 进行服务器渲染能够进行朴素循环, 而使用 JavaScrip 同样可以实现基于朴素循环的 DOM 操作, 而根据所使用的 JavaScript 库的不同, 同一种列表可能会分别采用两种不同的操作方式(开发速度优先的话), 这无疑会给后续的维护带来不必要的困扰.

所以, 这次的毕设笔者采用了 **完全前后端分离** 的开发思路, 彻底抛弃服务器端渲染.

## 分离式开发

在过去笔者也尝试过类似的分离式开发, 其中遇到的首要问题就是, 前端应用的端口和后端应用的端口不同(不同源), 那么前端后端的数据交互就是跨域的, 因此就需要在 flask 的应用中配置 **CORS** 来允许来自前端的跨域请求.

而在 [How To Create a React + Flask Project](https://blog.miguelgrinberg.com/post/how-to-create-a-react--flask-project) 一文中, _miguelgrinberg_ 介绍了如何进行 react+flask 前后端分离式的开发. 通过前端规定代理接口的地址来实现 **同源请求** , 这就避免了在 flask 中去配置跨域许可(毕竟泛滥的跨域许可也给网站的安全性带来了不利的影响).

这解决了网站开发时出现的问题, 但是又引出了一个新的问题, 这一份前端的代码应该如何使用?

如果没有引入前端路由体系, 那么打包为静态文件之后只需要进行一些简单的配置, 即可让它成为 flask 项目组的一部分.

> 当然, 从它成为 flask 的一部分的时候起, 整个前后端交互也就重新回到了 _混合式_ 了.

但是, 实际情况是, 由于项目结构比较复杂, 所以在前端使用了 react 自带的路由体系, 毫无疑问, 如果就这样打包放入 flask 模板文件下, 势必会造成路由逻辑的冲突. 所以在部署时就出现了两种思路.

1. 分离式部署, 即, 按照项目开发时的逻辑进行部署.
2. 使用 nginx 进行代理, 统合部署.

### 分离式部署

这种部署方式最终会占用两个端口, React 一个端口, flask 一个端口, 显然, 这两个端口是违背了 **同源策略** 的, 所以还是会回到上文所述的跨域问题.

另外, 这种部署方式所引出的另一个问题, react 的服务端本质上是 node 的服务端, 需要考虑的是 **同时启动多个服务端对服务器产生的性能压力** .

### nginx 代理

这是我最终选择的一个方案.

将文件打包, nginx 作为 web 服务器来管理这些静态文件. 而至于 flask 的 api 接口, 则通过 nginx 进行代理, 从而实现端口的统一.

最终的 nginx 配置文件核心配置如下.

```plain_text
server {
    listen       80;
    server_name  localhost;

    location / {
        root   /var/www/html;
        index  index.html;
        try_files $uri /index.html;
    }

    # 代理api接口
    location /api {
      proxy_pass  http://backend/api;
    }

    ......
}
```

其中, `try_files $uri /index.html;` 适配了 react 本身的路由.

## 多语言开发

在概述所提到的另一个重点就是多语言开发, 实际上这是项目在后续演进过程中才会关注的问题, 不过在 [分离式部署](#分离式部署) 这个废案中进行过一次简单的尝试.

上面我们通过 nginx 的代理功能将 flask 后端的 api 接口摘出, 作为唯一 api 服务提供. 而之后我们可能会进行 Go \ Node 等语言的 api 开发,这时候只要对路由进行前缀定义, 比如 `/go/api` , 然后在 nginx 配置文件中作出相关的代理配置即可.

## 总结

本篇介绍了 nginx 如何成为前后端分离式开发的桥梁, 当然, 想要达成这一目的, 方法并不是唯一的, 只是笔者基于自身现有的技术栈而想到的一个方法, 如果有更好更先进的策略, 欢迎赐教.

## 篇外

如果看了 Christin 的源码, 不难发现项目存在 v1 和 v2 两个 api 版本, 前者是采用混合式开发思路, 而在开发过程中愈发觉得这种思路的混乱与难以维护, 所以就有了 v2 版本.
