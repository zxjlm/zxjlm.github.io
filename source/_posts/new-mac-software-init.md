---
title: 开发人员的Mac软件推荐列表(持续更新)
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2022-05-14 15:35:54
updated:
categories:
  - 源流清泉
  - Mac
tags:
  - Mac
  - software
customSummary:
thumb:
thumbDesc:
thumbSmall:
---


开发者新Mac配置推荐. 本列表以开源免费的软件为主, 以及部分实用的收费软件. 不会包含盗版软件获取途径与软件破解方法, 取而代之的是, 会提供一些优惠获取途径.

收费软件会以*进行标识

> 警惕盗版\破解版可能造成的风险. 包括但不限于后门\律师函\版本迟滞等

!!! 确保能够正常使用外网的服务 !!!
!!! 确保能够正常使用外网的服务 !!!
!!! 确保能够正常使用外网的服务 !!!

## ClashX

[ClashX](https://github.com/yichengchen/clashX/releases)

## 基础

基础软件是所有后续操作的基础.

[homebrew](https://docs.brew.sh/Installation)

homebew 在安装过程中会顺带着把 _xcode command line tools_ 安装好, 包含了 _Python3_ 这些基础软件.

## 开发

### IDEs

*[jetbrain tool box](https://www.jetbrains.com/toolbox-app/), toolbox 能够用来安装和管理J社全家桶.

J社全家桶虽然是收费软件, 不过可以通过学生优惠、开发者优惠等渠道获得正版权限.

另外还推荐J社的 __Datagrip__ 作为数据库GUI工具, Navicat虽然好用, 不过破解版前不久有过后台丑闻, 所以破解版在笔者这里已经是下下之选了.

[vscode](https://code.visualstudio.com/download)

宇宙第一编辑器, 搭配各种插件, 能够应付绝大多数的开发情境.

### Node

#### NVM

[nvm install](https://github.com/nvm-sh/nvm#install--update-script)

### 通用

#### iterm2

[iterm2](https://iterm2.com/)

iterm2 可以用来作为自带的终端工具 __Terminal__ 的替代品. 拥有更丰富的功能和更美观的界面.

##### oh-my-zsh

oh-my-zsh 是zsh的增强组件, 具体安装及配置可见于[ubuntu初始化](https://blog.harumonia.moe/ubuntu-initial/) 的 oh-my-zsh 一节.

#### *Dash

[dash](https://kapeli.com/dash)

文档管理工具  _dash_ 能够方便地管理各种类型的文档, 其官方维护了很多的文档, 并且对于 _Go_ 之类自带文档的, 或者文档在Github上面的, 都有很好的支持.

将dash管理的文档是在本地的, 所以即使断网了也不影响开发工作.

## 办公

### *ms office

微软的office套件是绝对的办公利器. 可以拼车家庭版, 每年只需要40+就可以享受全部的订阅服务.

- outlook: 邮箱管理, 支持无代理收发Gmail. 实测除了163, 其他几家的支持情况都挺好的. 除 _网易邮箱管理大师_ 之外的很多邮箱工具都对163支持不佳, 所以笔者现在逐渐将163的各个订阅服务转移至gmail.
- onedrive: 网盘工具, 订阅office365后自带1T的容量, OneDrive提供全平台支持.

## 其他

### Maccy

[Maccy](https://github.com/p0deje/Maccy)

Maccy 能够记录剪切板的历史, 可以包含文字\图片等内容. 它有收费版(appstore) 和 [开源版](https://github.com/p0deje/Maccy), 使用开源版即可.

### Command One

[command one](https://apps.apple.com/us/app/commander-one-file-manager/id1035236694?mt=12) 是文件管理工具, 支持ftp等远程文件传输管理.

### *istat menus

[istat menus](https://bjango.com/mac/istatmenus/) 一款菜单栏上的系统监视器, 能够展示CPU\内存\显存\风扇\磁盘用量等非常多的系统参数, 它的缺点就是会占用很大一片菜单栏的位置, 笔者使用的16寸Mac依然无法显示全貌, 再没有更大的显示屏幕的情况下, 需要配合 Dozer \ hidden bar 等软件使用.

#### hidden bar

[hidden bar](https://apps.apple.com/cn/app/hidden-bar/id1452453066?mt=12) 可以让菜单栏折叠, 把不常用的一些软件, 如 Docker Desktop \ 剪切板 等隐藏起来, 为其他的软件腾出空间.

### switch hosts

[switch hosts](https://github.com/oldj/SwitchHosts/releases) 是用来切换hosts文件配置的. 对于需要mock host或者其他host频繁切换的情境非常适合.

### *alfred

[Alfred](https://www.alfredapp.com/) 自动化管理工具, 功能十分强大齐备, 可以取代 __聚焦__ \ __Maccy__ 等软件. 通过 _apple script_ 可以和很多的 Mac 软件进行 "梦幻联动" .

#### 联动指南

- [iterm2](https://github.com/vitorgalvao/custom-alfred-iterm-scripts)
- [1password](https://github.com/alfredapp/1password-workflow#readme)
