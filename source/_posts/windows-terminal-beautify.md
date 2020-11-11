---
layout: post
cid: 230
title: Windows下的终端优化方案
slug: 230
date: 2020/07/19 22:13:08
updated: 2020/07/19 22:13:08
status: publish
author: harumonia
categories:
  - 源流清泉
tags:
  - 美化
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumb:
thumbChoice: default
thumbDesc:
thumbSmall:
thumbStyle: default
hidden: false
---

## 前言

在 Mac 上面安装了 [iTerm2](https://www.iterm2.com/) 之后，逐渐难以忍受 _Windows_ 上面简陋的终端界面，**CMD** 就不谈了，即使了 Windows10 加入的 **PowerShell** ，也依旧差强人意。

PowerShell 强化了 Windows 命令，并且能够让电脑使用部分的 Linux 命令，这是一个重大的进步。其缺点依旧明显，Linux 命令并不完整，对于习惯了使用 Linux 命令行来实现一些骚操作的人来说，难免有点束手束脚。其次，PowerShell 的界面也不太令人满意。

所以这次按照 [Windows Terminal Docs](https://docs.microsoft.com/zh-cn/windows/terminal/) , DIY 一个美观的 Terminal。

<!-- more -->

![图1. 我所期待的界面](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20200719204740685.png)

<center> <u>Figure1</u>:  我所期待的终端界面</center>

![image-20200719204803738](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20200719204803738.png)

<center> <u>Figure2</u>:  PowerShell所展示的终端界面</center>

这实在是令人难受。

那么，本篇所解决的问题，就是如何在 Windows 中搞一个花哨的命令行界面。

## 正文

### 解决外观问题

#### cmder

一开始我选择使用 [cmder](https://cmder.net/) 来做一个基于 PowerShell 的终端界面。

![image-20200719205641389](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20200719205641389.png)

<center> <u>Figure3</u>:  cmder所展示的终端界面</center>

> Cmder is a software package created out of pure frustration over the absence of nice console emulators on Windows. It is based on amazing software, and spiced up with the Monokai color scheme and a custom prompt layout, looking sexy from the start.

但是在我进行一些 DIY 的时候，总是会一些奇奇怪怪的 UI 错误，所以在经历了几次令人迷惑的 bug 之后，我开始寻找其它的替代方案。

#### Windows Terminal

[Windows Terminal](https://www.microsoft.com/zh-cn/p/windows-terminal/9n0dx20hk701?rtc=1&activetab=pivot:overviewtab#) 是一个官方的 ui 壳子，他所展示的界面如下。

![image-20200719210053548](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20200719210053548.png)

<center> <u>Figure4</u>:  Windows Terminal所展示的终端界面</center>

> Windows 终端程序是一款新式、快速、高效、强大且高效的终端应用程序，适用于命令行工具和命令提示符，PowerShell 和 WSL 等 Shell 用户。主要功能包括多个选项卡、窗格、Unicode、和 UTF-8 字符支持，GPU 加速文本渲染引擎以及自定义主题、样式和配置。

在界面上，与 cmder 所展示的极简风格相比，官网这个以基佬紫为基调，模糊透明背景的案例深得我心。于是果断下载下来。

使用的第一体验就是，非常地流畅，软件的本体只有 7M 不到，想要实现案例 UI，似乎是要另外使用一个 colorTool 来完成。这种插件式的构建方式很灵活，但是也很费时间。在大概地折腾了两下之后，它在我心中已经是一个合格 的 cmder 的替代方案了……如果没有遇到下面这位的话。

#### Terminus

这是我在 github 上面冲浪的时候无意中发现的一个界面，使用 JavaScript 开发。

![image-20200719210434085](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20200719210434085.png)

<center> <u>Figure4</u>:  Terminus所展示的终端界面</center>

> **Terminus** is a highly configurable terminal emulator for Windows, macOS and Linux
>
> - Integrated SSH client and connection manager
> - Theming and color schemes
> - Fully configurable shortcuts
> - Split panes
> - Remembers your tabs
> - PowerShell (and PS Core), WSL, Git-Bash, Cygwin, Cmder and CMD support
> - Direct file transfer from/to SSH sessions via Zmodem
> - Full Unicode support including double-width characters
> - Doesn't choke on fast-flowing outputs
> - Proper shell experience on Windows including tab completion (via Clink)

类似 cmder，这是一个一体化的软件，减少了很多用户可以配置的项目，而添加了一些成熟的配置方案供用户选择。另外，自带 SSH，大概地试了一下，感觉 xshell 也可以雪藏了。

总的来说，Windows Terminal 和 Termius 都能够实现我们的美化 UI 的需求，但是拓展功能方面有很大的差别。

### 拓展命令行

虽然 PowerShell 拓展了 windows 的命令行，使其更加接近 Linux，但是终究还是有所差距的。上文所以到的 Terminus 和 Windows Terminal，只是实现了 UI 上的强化，并没有完成命令行的拓展。

本来打算用过 **git bash** 来搞定，但是在 Windows 上依赖 git 附加的 bash，总感觉有点不伦不类的。于是使用 WSL 来搞一点炫酷的事情。

在新的 Windows 正式版本中，已经可以直接使用 WSL 了，记得年前安装 WSL 的时候，只能使用 Windows 先行版本，还为因此出现的各种 bug 头疼了好久。

根据官网的文档，几条命令，再重启一下电脑，就能够使用 wsl2 了。

![image-20200719212747796](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20200719212747796.png)

<center> <u>Figure5</u>:  Terminus + WSL2 所展示的终端界面</center>

emmmm，有点 Server 的味道了啊。

到这一步，已经实现了 **UI 美化、命令行强化** 的目标。

当然，UI 还能够进一步美化，那就是从内部美化。

这里我选择使用 zsh + ohmyzsh 套餐。

### oh-my-zsh

首先，使用如下命令来安装 zsh。

```bash
sudo apt install zsh
```

然后，在 [oh-my-zsh](https://ohmyz.sh/#install) 官网的文档上的命令完成安装。

> 补充说明：
>
> 1. 安装过程中会使用到 _git_ ，不过 git 默认安装在 wsl2 的 Ubuntu 中，所以就不用手动再装了。
> 2. 在下载.sh 文件时，可能会遇到无法连通 github 的情况，可以修改 host，更懒人的办法是，直接把.sh 文件手动 copy 到本地，然后用 sh 命令运行即可

![image-20200719214701704](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20200719214701704.png)

<center> <u>Figure6</u>:  Terminus + WSL2 + oh-my-zsh 所展示的终端界面</center>

清爽多了，不过比起这个默认的样式，我更习惯使用 **agnoster** 这个样式。

> 更多的样式可以在[文档](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes)中寻到。

使用如下命令打开 zsh 的配置文件。(\*rc 文件，有兴趣的可以了解一下)

```bash
vim ~/.zshrc
```

然后将 ZSH_THEME 修改成所需要的样式的名称即可。

最后执行如下命令，重载 zsh。

```bash
source ~/.zshrc
```

![image-20200719220527894](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20200719220527894.png)

<center> <u>Figure6</u>:  最终的终端界面</center>

差不多就是这个味道了。后续还会做一些配色方面的 DIY。

> 关于 oh-my-zsh 的补充：
>
> 目前的一些教程会让下载其他的 oh-my-zsh 插件，但是有一些插件现在已经在 oh-my-zsh 之中了，不必下载，只需要在配置文件中把名字加上就可以使用。
>
> 详情可以查阅[文档](https://github.com/ohmyzsh/ohmyzsh/wiki/Plugins)
