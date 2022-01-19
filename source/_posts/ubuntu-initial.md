---
title: Ubuntu初始环境配置(持续更新中)
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: "no"
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2022-01-05 10:19:25
updated: 2022-01-07 10:14:56
tags:
customSummary:
thumb:
thumbDesc:
thumbSmall:
---

本想改造一下公司电脑的 Windows,后来干脆直接给电脑刷了个 Windows, 于是, 风扇不再是噪声源, 电脑不再是暖手宝, 一切都变得清爽了起来.

唯一美中不足的是 ubuntu 上的软件和 Windows 还是有些差异的, 所以就有了本篇, 将各个常用的软件(从程序员的角度)的安装和坑点列出来.

另附一个开发中的 [Ubuntu 初始化脚本](https://github.com/zxjlm/ubuntu-dev-setup-especially-for-cn).

<!-- more -->

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

[github 项目下载地址](https://github.com/Dreamacro/clash/releases)

```shell
sudp mkdir -p /opt/clash
sudo chmod -R 777 /opt/clash
gunzip -k  **.gz >/opt/clash/clash
```

随后手动启动 clash 即可.

当然, 每次开机都需要手动运行一次还是挺麻烦的, 所以推荐使用 **systemd** 托管. 参考 [clash-as-a-daemon](https://github.com/Dreamacro/clash/wiki/clash-as-a-daemon)

[Web UI](https://clash.razord.top/#/proxies)

## git

```shell
git config --global user.name "$git_config_user_name"
git config --global user.email "$git_config_user_email"
```

### github 加速

修改 .gitconfig 文件. 以上文安装的 clash 为例.

```plain_text
[core]
    gitproxy = socks5://127.0.0.1:7890
[http]
    proxy = socks5://127.0.0.1:7890
[https]
    proxy = socks5://127.0.0.1:7890
```

### git GUI

由于常用的 git GUI [sourceTree](https://www.sourcetreeapp.com/) 并不支持 ubuntu, 所以这里推荐使用 [GitKraken](https://www.gitkraken.com/).

这个 GUI 工具是付费的, 破解方法见于 [GitKraken 工具的破解、BeyondCompare 配置](https://xinghailin.vip/2021/08/gitkraken%E5%B7%A5%E5%85%B7%E7%9A%84%E7%A0%B4%E8%A7%A3%E3%80%81beyondcompare%E9%85%8D%E7%BD%AE/).

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


# 可选
## 为当前用户赋予docker权限
# sudo usermod -aG docker $USER && newgrp docker
sudo groupadd docker
sudo usermod -aG docker $USER
sudo chmod 777 /var/run/docker.sock
```

## zsh

```shell
apt install zsh
```

### on-my-zsh

需要先配置代理

```shell
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

#### plugins

1. zsh-autosuggestions

```shell
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

## update to .zshrc
# plugins=(
#     # other plugins...
#     zsh-autosuggestions
# )
```

## 数据库可视化工具

[dbeaver v21.3.0](https://github.com/dbeaver/dbeaver/releases)

```shell
wget https://github.com/dbeaver/dbeaver/releases/download/21.3.0/dbeaver-ce_21.3.0_amd64.deb

sudo dkpg -i dbeaver-ce_21.3.0_amd64.deb

rm -f dbeaver-ce_21.3.0_amd64.deb
```

## 文件同步

### onedrive

由于微软官方并没有给出一个 onedrive linux 版本, 所以只能够使用第三方的服务来进行 onedrive 同步.

笔者使用的是 GitHub 上面的[ondrive](https://github.com/abraunegg/onedrive)项目.

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

## wine

### 微信(wechat)

#### 问题

1. 无法显示、发送图片

```shell
sudo apt-get install libjpeg62:i386
```

## 关于 kubernetes

### minikube

[文档](https://kubernetes.io/docs/tasks/tools/install-minikube/)

国内的启动命令推荐为:

```shell
minikube start --registry-mirror=https://registry.docker-cn.com --image-repository=registry.cn-hangzhou.aliyuncs.com/google_containers
```

## 快捷键冲突

一. 和 idea 的冲突 (_ctrl + alt + <-_ 和 _ctrl + alt + ->_)

```shell
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-left "[]"
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-right "[]"
```

二. 简繁体转换和全局搜索的冲突 (Ctrl + Shift + F)

```plain_text
右上角输入法图标 -> 配置当前输入法 -> 附加组件 -> 简繁转换 -> 配置
```

一般也用不到繁体, 使用 `esc` 键禁掉即可.

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
