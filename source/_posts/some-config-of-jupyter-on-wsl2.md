---
title: wsl2上的jupyter配置
date: 2020-12-11 10:46:19
updated: 2020-12-11 10:46:19
categories:
  - 源流清泉
  - wsl
tags:
  - wsl
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

由于之前疏于对公司电脑上面的 C 盘的管理，它的存储空间不出意外地炸了。

于是就开始了繁琐的清理工作。首先通过 设置 -> 存储 找到 C 盘占用空间的大头。也就是微信文件和 miniconda，微信由于日常的工作联系等积压了大约 5G 左右，miniconda...emmm...8G = =

看了一下，pytorch、tensorflow 等一系列的包、环境，这个手术动起来还是挺麻烦的，牵连太多了。

不过随着工作任务的固定，有些包和环境确实也不需要了，于是就有了接下来的一些迷惑操作。

<!-- more -->

## 删除环境

本来只是打算清理一下各种环境，于是在网上找到了一个邪道的方法。

```shell
pip freeze > req.txt
pip uninstall -r req.txt -y
```

之所以说邪道，因为这个操作看似合理，实际上直接把我的 miniconda 折腾残了，字面上的意思，损坏了关键文件，打不开了 = =

~~还不如直接删~~

不过再仔细想想，感觉对于现在的工作，miniconda 的各种特性并不是刚需，于是出于释放存储空间的根本目的，直接将 miniconda 连根拔起。

ps. 关于 pip 和 conda 的关系,可以看[Understanding Conda and Pip](https://www.anaconda.com/blog/understanding-conda-and-pip)

## jupyter lab

miniconda 虽然没了，但是一直放在上面的 jupyterlab 还是要用的。

刚入职的时候还是老老实实的 windows 开发，后来入了 wsl 邪教之后开发就全部放在了 wsl 上，于是早期工作相关的会使用 windows，现在工作相关的会使用 wsl，跳来跳去还挺麻烦的，些许的强迫症让我决定就趁着这个机会将早期工作的大头--jupyter，迁移到 wsl 上面。

主要的参考文章 : [Setting up JupyterLab on Windows 10 with WSL 2](https://davidbailey.codes/blog/2020-07-10-setting-up-jupyterlab-on-windows-10)

然后在实际操作的过程中遇到的问题还挺多，所以在这里重新梳理一下。

### 预处理

当然不能再放在 wsl 原装的 python 上面，不然省个锤子的空间

```shell
# 在D盘建立一个虚拟环境 env_jupyter
mkdir -p /mnt/d/wsl_venv/
cd /mnt/d/wsl_venv/
python3 -m venv env_jupyter
```

(可选)为了方便快速进入虚拟环境，可以在 bashrc 或者 zshrc 中加入启动别名(alias)

```shell
alias venv_jupyter="source /mnt/d/Project/Python/venv_wsl/jupyter/bin/activate"
```

### 安装

```shell
pip install jupyterlab
```

之后就可以使用 **jupyter lab** 启动了，我这里出现了这样一个错误.

> Start : This command cannot be run due to the error: The system cannot find the file specified.

原因是确实了配置文件,当然，它是由默认配置的，这个错误并不影响使用，可以使用如下命令解决。

```shell
# 生成配置文件
jupyter notebook --generate-config
```

### 更改启动目录

我的 jupyter 相关的文件\项目都是集中放在同一个文件夹下，然后使用 git 实现公司\家\服务器的同步的，所以可以直接将启动目录定死。

在 [安装](#安装) 中生成了配置文件之后，这个文件的位置是 `/root/.jupyter/jupyter_notebook_config.py`， 可以使用 _vim_ 或者 _vs code(`code .`)_ 等手段编辑。

```python
## The directory to use for notebooks and kernels.
c.NotebookApp.notebook_dir = '/mnt/d/Project/myLearnningLab/jupyter/'
```

### 直接打开浏览器

这里参考了 [Launching notebook to browser on WSL](https://github.com/jupyter/notebook/issues/4594)

先使用 `ln -s /mnt/c/Program\ Files\ \(x86\)/Google/Chrome/Application/chrome.exe /usr/bin/chrome` 建立 chrome 的软路由。(将 _/mnt/c/.../chrome.exe_ 替换成自己的浏览器安装路径，此步骤忽略则将下述 `chrome` 变更为浏览器安装路径 )

然后直接将如下代码加入配置文件即可。

```python
import webbrowser
webbrowser.register('chrome',None,webbrowser.GenericBrowser('/usr/bin/chrome'))
c.NotebookApp.browser = 'chrome'
```

### 解除 root 限制

到这里，jupyter 依然运行不了，提示 `Running as root is not recommended. Use --allow-root to bypass.`

可以直接将启动命令变更为 `jupyter lab --allow-root`

也可以在配置文件中将 `c.NotebookApp.allow_root`的值变更为 _True_

## Final

至此，配置完成。
