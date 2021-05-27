---
layout: post
cid: 161
title: 关于前后端分离
slug: 161
date: 2019/11/09 18:00:00
updated: 2019/11/09 18:02:58
status: publish
author: harumonia
categories:
  - 源流清泉
tags:
  - 漫谈
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

## 前言

最近在对 18 级的同学们进行培训，正好讲到 jinja2 这一块，在进行了仔细的梳理之后，忽然发现 jinja2 这种渲染模式与国内目前的潮流--前后端分离所不符合。
所以作为一个负责的老学长，我写下这一篇，来给 18 级的学弟学妹们介绍、分析一下，免得入了歧途。

## 传统的开发模式

前端写好静态的 HTML 页面交付给后端开发。静态页面可以本地开发，也无需考虑业务逻辑只需要实现 View 即可。
后端使用模板引擎去套模板，当年使用最广泛的就是 jsp，freemarker 等等，同时内嵌一些后端提供的模板变量和一些逻辑操作。
然后前后端集成对接，遇到问题，前台返工，后台返工。
然后在集成，直至集成成功。

## 前后端分离的开发模式

前后端分离并不只是开发模式，而是 web 应用的一种架构模式。在开发阶段，前后端工程师约定好数据交互接口，实现并行开发和测试；在运行阶段前后端分离模式需要对 web 应用进行分离部署，前后端之前使用 HTTP 或者其他协议进行交互请求。

客户端和服务端采用 RESTFul API 的交互方式进行交互

前后端代码库分离

### 如何分离

对于 node.js 这类可以直接在前端进行处理的,由前端负责 view 和 controller 层,后端只负责 model 层，业务处理与数据持久化等
但是对于我们所使用的纯粹 flask 开发,MVC 就全部交由后端来负责,前端只需要完成静态页面的开发即可.

## 如何取舍

如何取舍的问题归根到底是如何分工的问题
比如工作室的项目,在新的成员加入进来之前,我在负责了前后端的全部工作,所以我选择了耦合度较高的前后端结合开发模式.
这样的好处是开发迅速,而且高耦合往往意味着高效率.
但是这对后期接手的人不太友好,因为并不是每一个人对前后端都有所了解.

所以在后期,工作室的其他人加入进来之后,我就选择了前后端分离的开发模式.
注意,低耦合度的 API 交互的形式比直接渲染,数据的冗余度要高很多.如果 API 交互过于频繁,会给服务器造成很大的压力.
并且，解耦合后，可能会出现一些安全性的问题，要注意应对恶意请求。

再往后面 API 会讲一下 API 设计的相关内容.

## (补充)前后端分离架构后的优点

### 为优质产品打造精益团队

通过将开发团队前后端分离化，让前后端工程师只需要专注于前端或后端的开发工作，是的前后端工程师实现自治，培养其独特的技术特性，然后构建出一个全栈式的精益开发团队。

### 提升开发效率

前后端分离以后，可以实现前后端代码的解耦，只要前后端沟通约定好应用所需接口以及接口参数，便可以开始并行开发，无需等待对方的开发工作结束。与此同时，即使需求发生变更，只要接口与数据格式不变，后端开发人员就不需要修改代码，只要前端进行变动即可。如此一来整个应用的开发效率必然会有质的提升。

### 完美应对复杂多变的前端需求

如果开发团队能完成前后端分离的转型，打造优秀的前后端团队，开发独立化，让开发人员做到专注专精，开发能力必然会有所提升，能够完美应对各种复杂多变的前端需求。

### 增强代码可维护性

前后端分离后，应用的代码不再是前后端混合，只有在运行期才会有调用依赖关系。应用代码将会变得整洁清晰，不论是代码阅读还是代码维护都会比以前轻松。

## 后记

- 又是不知道干了啥的一天

- 于学姐冲冲冲