---
layout: post
cid: 188
title: 浅谈Linux的使用与应用
slug: 188
date: 2019/12/24 10:21:00
updated: 2019/12/24 10:39:26
status: publish
author: harumonia
categories:
  - 起居杂录
tags:
  - linux
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

这是 Linux 课程的大作业...

![head](https://harumona-blog.oss-cn-beijing.aliyuncs.com/old_articles/410079949.jpg?Expires=1602316585&)

<!-- more -->

## 正文

自大一开始接触 Linux，从最早的 centOS 到现在常用的 Ubuntu，如今对 Linux 的使用与应用，也算是有一点自己的小小的体会，所以本篇主要就是讲述我个人对于 Linux 使用与应用的一些心得和看法。

我对于 Linux 的使用主要集中在两个方面，一个是网站的部署，另一个就是数据挖掘和机器学习。
先谈谈网站部署吧。

大一时，租了一台阿里云的学生机，使用 LNMP 体系和 Typecho 框架，准备部署个人博客。作为 Linux 初学者，这无疑是很有挑战性的，事实也是如此，弯弯绕绕一个星期，终于把网站跑起来了。

于是这里引出第一个问题，像 CentOS 这类的 Linux 操作系统与 Windows 使用风格迥异，对于初学者来说，尤其是使用目标很低的初学者，学习成本太高了，如何降低这样的学习成本呢？

一种途径是图形化操作。以最近比较热门的 Debian、Ubuntu 为例，他们的操作界面都在向图形化较为成功的类 Unix 系统—macOS 上靠拢，建立一套学习成本低、使用亲民的图形化操作体系。

另一种途径是建立一个托管型的后端平台。这一方面做得比较好的是宝塔，在进行第二次的个人网站部署的时候，我所选择的就是宝塔，他的使用难度介乎于 macOS 和 CentOS 之间，往往需要与 Terminal 配合操作。

以上两者各有千秋，但是都有一个很明显的问题，那就是系统资源占用，尤其是对于一个使用着 1 核 2G 的学生机的学生来说，安装了图形化或者宝塔，那么就意味着大部分的性能将用来维护这些辅助的功能，而只能分出一小部分系统资源来运行个人网站。这无疑是本末倒置了。

后来，随着对 CentOS 的熟练度逐渐提高，我开始放弃宝塔，改为全终端操作，将服务器所有的资源都释放出来，来运行网站或者进行云计算。

上述所说的个人网站部署是基于 Typecho 的，外框架都提供好了，问题的重点只在于内容的填充，所以这时的部署只是不知底层的很浅显的部署。后来参加计算机设计大赛，开始使用 python 的 flask 来从零开始开发网页，这里主要讲一下开发完成之后的部署的问题。

最初的部署是使用 Nginx 和 uWsgi，需要更改很多的配置文件，对于新手，很容易就一不小心损坏了配置文件，这无疑是很不友好的。不过所幸第一次选择的是这种部署方式，使得我对于 Ubuntu 的底层有了一些更为深刻的理解。

第二次部署使用得是 Gunicorn，这是一个自动化程度比较高的部署方式，唯一所需要的只是很多的配置文件而已，不过这些配置文件独立于系统配置文件，基本上不会对系统造成损害。

再后来，开始接触 Docker。它是云服务技术上的一次创新，让应用程序布署在软件容器下的工作可以自动化进行，借此在 Linux 操作系统上，提供一个额外的软件抽象层，以及操作系统层虚拟化的自动管理机制。

这无疑比 Gunicorn 多出更多的好处，当然，两者本就不是同一个体量事物。

我的主要开发环境大抵是两个，一个是 Windows，一个是 macOS，Ubuntu 虽然也在用，不过不是作为主要的开发环境，而是作为一个单纯的部署环境使用的。这就引出一个问题，那就是系统不同导致 Python 代码上有一些细微的区别，虽然代码使用 git 同步时，可以避免掉一些问题，但是需要设置很多的东西，非常麻烦。有了 Docker 之后，所有的平台实现了真正的同步，这一点虚拟机也可以做到，但是虚拟机占用了更多的系统资源，并且响应速度极慢，很多情境下不能满足使用需求。
关于 Docker，由于最近还在进行更深入的研究，所以就只谈这么多。

再谈一谈数据挖掘和机器学习。最近也有在研究这方面的内容，不过自己的机器性能有限，并且很多时候不能把所有的性能都解放出来来进行计算，毕竟日常生活还是要用到电脑的。于是这就使得数据挖掘的进度非常地缓。后来，使用了学校的服务器，终于实际体会到了，云计算在当下如此热门的原因。

CentOS 这类的类 Unix 系统将大部分的硬件计算能力调动起来，并且熟练之后，比起 Windows 有着更为方便快捷的操作（脚本操作），Unix 这样一个与数据挖掘关联不大的东西，很可能可以作为一个区分数据挖掘能力的分水岭。

使用 Linux 已经有 3 年的时间了，选修了张老师的网络操作系统，这学期又选修了胡老师的嵌入式，获益良多。虽然大多时候它都只是一个辅助的操作系统，但也有了很多深刻的体会，Linux 是一个与程序员耦合度极高的系统，并且有着与其学习成本相称的价值。

-- harumonia 2019 年 12 月 24 日

## 后记

在书写的过程中,顺带着回顾了一下三年来的课外学习成果.

对技术的热爱贯穿了整个大学的课外学习生活,这样的感觉真的很棒.

最初,我觉得这样喜欢什么就学什么的学习方式,最大的问题在于不成体系.很多技术可能一时炫酷,以后可能就都用不到了.也曾迷茫过,不过我的个人性格比较跳脱,学习技术的核心不是为了提升自己这种冠冕堂皇的东西,而是单纯的追求炫酷的技术,以及在这种追求过程中的满足与快乐.

不过后来证明,学习的东西虽然零散,但是每一种技术(爬虫\运维\网页开发\机器学习等),都有其应用的场景,并且也给我带来了很多的回报,这也许就是所谓的无心插柳柳成荫吧(笑
