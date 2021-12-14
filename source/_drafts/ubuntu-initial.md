---
title: Ubuntu初始环境配置
date: 2021-12-08 10:19:25
tags:
---

## 前言

### 系统环境

```plain_text
Laptop: ThinkPad T480

BIOS Information
    Vendor: LENOVO
    Version: N24ET37W (1.12 )
    Release Date: 03/14/2018
    Address: 0xE0000
    Runtime Size: 128 kB
    ROM Size: 16 MB

CPU Information
Architecture:        x86_64
CPU op-mode(s):      32-bit, 64-bit
```

## 安装 Ubuntu

ubuntu 的安装教程网上多种多样, 这里笔者是按照[官网的流程](https://ubuntu.com/tutorials/install-ubuntu-desktop#1-overview)进行安装.

### 关于换源

GUI 版的 ubuntu 默认会在中文环境下选择中国区的服务源, 所以不需要再手动换源.

## 安装 ssh 服务

由于 ubuntu 自带安装 ssh client, 所以如果只是连接其他服务器, 则不需要安装额外的东西. 如果是想要将本机作为 ssh 服务器, 则需要安装 ssh server.

```shell
sudo apt install openssh-server
```

### ssh GUI

ubuntu 自带一个 ssh GUI, 也就是 **Remmina** . 不只是 ssh, rdp(远程桌面协议) 和 vnc 也很好地得到了支持. 搭配 ssh-config, 即使没有 Windows 上傻瓜式的 xshell, 也可以得到极佳的 ssh 终端体验.

## clash

[Web UI](https://clash.razord.top/#/proxies)

## git

### github 加速

修改 .gitconfig 文件.

```plain_text
[core]
    gitproxy = socks5://127.0.0.1:7890
[http]
    proxy = socks5://127.0.0.1:7890
[https]
    proxy = socks5://127.0.0.1:7890
```

## Docker

[文档地址](https://docs.docker.com/engine/install/ubuntu/)

```shell
# 基础依赖
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 配置证书
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 使用稳定版docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io
```

## 数据库可视化工具

[dbeaver v21.3.0](https://github.com/dbeaver/dbeaver/releases)

```shell
wget https://github.com/dbeaver/dbeaver/releases/download/21.3.0/dbeaver-ce_21.3.0_amd64.deb

sudo dkpg -i dbeaver-ce_21.3.0_amd64.deb

rm -f dbeaver-ce_21.3.0_amd64.deb
```

## 欧陆词典

[下载页面](https://www.eudic.net/v4/en/app/download)

```shell
wget https://www.eudic.net/download/eudic.deb?v=2021-09-29


```

## 远程桌面

### 向日葵

[下载页面](https://sunlogin.oray.com/download/)

### rdp

```shell
sudo apt-get install xrdp

sudo systemctl enable xrdp

sudo ufw allow 3389/tcp
```

#### 连接后黑屏

```shell
sudo nano /etc/xrdp/startwm.sh

## 在 line 30 (也就是 */etc/profile* 那一行) 前, 添加如下内容
unset DBUS_SESSION_BUS_ADDRESS
unset XDG_RUNTIME_DIR
##

sudo systemctl restart xrdp
```

## 多版本 Python

Ubuntu 20.04 默认的 Python 版本是 3.8， 如果需要其他版本, 如 3.6， 可以通过如下方式安装.

[参考链接](https://towardsdatascience.com/installing-multiple-alternative-versions-of-python-on-ubuntu-20-04-237be5177474)

## 快捷键冲突

1. 和 idea 的冲突

```shell
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-left "[]"
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-right "[]"
```

## 扩展功能

### 搭建 smb 服务

smb 可以用来共享局域网文件共享服务, 打破 Linux \ Mac \ Windows 的文件壁垒. 同时 iPad 上的一些软件, 如 VLC, 也可以通过 smb 来获取服务器上的共享文件进行播放, 十分方便.

[官方教程](https://ubuntu.com/tutorials/install-and-configure-samba#4-setting-up-user-accounts-and-connecting-to-share)

## 参考

```shell
TEMP_DEB="$(mktemp)" &&
wget -O "$TEMP_DEB" 'http://path.to/my.deb' &&
sudo dpkg -i "$TEMP_DEB"
rm -f "$TEMP_DEB"
```

https://post.smzdm.com/p/a4wkl5el/
