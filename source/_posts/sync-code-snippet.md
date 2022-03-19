---
title: 通过github同步代码片段
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2022-03-19 11:56:55
updated: 2022-03-19 11:56:55
categories:
  - 源流清泉
  - Shell
tags:
  - Trick
customSummary:
thumb:
thumbDesc:
thumbSmall:
---


工作快一年了, 积累了很多的 代码片段(`code snippet`), 所以需要一个小工具来实现公司\家庭\开发\私人服务器等地方的代码片段的同步.

同步的方法有很多, 我试过onedriver \ codemass \ gist 等手段, 但是各有各的缺点(后文补充), 所以最后还是选择了一个相对折中的方案, GitHub.

本文主要介绍的就是如何通过GitHub实现自动代码片段的同步.

代码环境:

- macos
- ubuntu
- centos

<!-- more -->

## 常见方案

### mass code

[mass code](https://masscode.io/)是一款开源的代码片段同步工具, 但是其本身不具备代码片段同步的功能, 官方给出的一个方案是[使用第三方网盘](https://masscode.io/documentation/essentials/sync.html)来实现同步的功能.

笔者惯用的是Onedrive, 但是在Ubuntu上, 并没有官方的Onedrive程序, 而第三方的[onedrive](https://github.com/abraunegg/onedrive)同步工具在使用过程中总有各种奇怪的问题, 导致代码片段在同步的过程中出现丢失的现象. 这是笔者选择放弃 `masscode` 的主要原因.

### gist

在尝试了masscode之后, 再使用gist总是有很多的不习惯, 最主要的是, masscode能够根据代码的 __种类__ \ __用途__ 进行分类管理, 而gist则不能这么做.

## 使用git仓库

在GitHub中有不少代码片段的仓库, 其中不乏一些高星的仓库. 不过我们的代码片段是私人性质的, 因为其中还有 token \ smtp 等敏感信息.

使用git来管理代码片段, 本身并没有什么难度, 按照正常的git使用流程来即可.

接下来主要的内容是, 如何实现自动化的代码片段同步功能, 以及一些让使用更加人性化的技巧.

核心的思路是: __一个自动同步代码仓库的脚本__ + __定时任务__, 由于代码片段的使用是个人性质的, 所以使用的流程基本上是线性流程, 在设计过程中不需要考虑代码冲突的问题.

## crontab定时任务

crontab 是Linux系统的定时任务程序, 在Ubuntu \ Centos\ MacOS上都可以直接使用. 这里给出一个[生成网站](https://crontab.guru/), 用来快速生成一个crontab配置.

```shell
# 每隔10分钟执行一次同步脚本
*/10 * * * * [path-to-your-script]
```

## notification同步成功通知

```shell
os_type=$(uname -s)
# validate os is ubuntu or mac
if [ "${os_type}" = "Darwin" ]; then
    # mac os
    notification="display notification \"${now_date} code snippet git sync done\""
    osascript -e "$notification"
elif [ "${os_type}" = "Linux" ]; then
    # ubuntu os
    notify-send CrontabTask "${now_date} code snippet git sync done"
else
    echo "unknown os ${os_type}"
fi
```

## 问题

### 检查是否是git目录

__crontab__ 执行时, 通过文件路径的方式执行的话, 启动的路径并不是在我们的代码片段仓库的根目录下, 所以需要检查一下是否是 git 目录.

笔者的同步脚本存放在仓库的 _shell/_ 目录下, 所以就有了如下的检查代码.

```shell
dir_of_path=$(dirname "$0")   # 得到脚本所在目录 /shell/
dir_of_path=$(dirname "$dir_of_path")  # 得到脚本所在根目录 /
cd $dir_of_path
echo $(pwd)

# 检查是否是git目录
if [ !$(git status) ]; then
    echo "$(pwd) is not a git repository"
    exit 1
fi
```

## 附录

这里给出完整的脚本代码

```shell
#!/bin/bash
# */10 * * * * [script-path]

dir_of_path=$(dirname "$0")
dir_of_path=$(dirname "$dir_of_path")
now_date=$(date +%Y-%m-%d)

cd $dir_of_path
echo $(pwd)

if [ !$(git status) ]; then
    echo "$(pwd) is not a git repository"
    exit 1
fi

git add .
git commit -m "auto-commit: $now_date"

git pull
git push

echo "$(date) git sync done" >>/tmp/git-auto-pull.log

os_type=$(uname -s)
# validate os is ubuntu or mac
if [ "${os_type}" = "Darwin" ]; then
    # mac os
    notification="display notification \"${now_date} code snippet git sync done\""
    osascript -e "$notification"
elif [ "${os_type}" = "Linux" ]; then
    # linux os
    notify-send CrontabTask "${now_date} code snippet git sync done"
else
    echo "unknown os ${os_type}"
fi
```

## Reference

[Bash脚本](https://wangdoc.com/bash/index.html)
[Crontab生成网站](https://crontab.guru/)