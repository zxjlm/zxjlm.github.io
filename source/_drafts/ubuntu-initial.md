---
title: Ubuntu初始环境配置
date: 2021-12-08 10:19:25
tags:
---

## 安装 Ubuntu

todo

### 关于换源

GUI 版的 ubuntu 默认会在中文环境下选择中国区的服务源, 所以不需要再手动换源.

## 安装 ssh 服务

由于 ubuntu 自带安装 ssh client, 所以如果只是连接其他服务器, 则不需要安装额外的东西. 如果是想要将本机作为 ssh 服务器, 则需要安装 ssh server.

```shell
sudo apt install openssh-server
```

### ssh GUI

ubuntu 自带一个 ssh GUI, 也就是 **Remmina** . 不只是 ssh, rdp(远程桌面协议) 和 vnc 也很好地得到了支持. 搭配 ssh-config, 即使没有 Windows 上傻瓜式的 xshell, 也可以得到极佳的 ssh 终端体验.

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

## 向日葵

[下载页面](https://sunlogin.oray.com/download/)

## 快捷键冲突

1. 和 idea 的冲突

```shell
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-left "[]"
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-right "[]"
```

## 参考

```shell
TEMP_DEB="$(mktemp)" &&
wget -O "$TEMP_DEB" 'http://path.to/my.deb' &&
sudo dpkg -i "$TEMP_DEB"
rm -f "$TEMP_DEB"
```

https://post.smzdm.com/p/a4wkl5el/
