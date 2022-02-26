---
layout: post
cid: 204
title: Linux常用命令复习1
slug: 204
date: 2020/01/17 23:03:00
updated: 2020/01/18 07:42:04
status: publish
author: harumonia
categories:
  - 源流清泉
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

## 文件 && 目录

### 目录大小 && 浏览和切换目录

- pwd 当前路径
- which 搜索可执行文件路径
- ls 列出当前目录
  - -a all
  - -l list
  - -h 便于人类阅读
  - -t 按最近一次修改时间排序
  - -i 显示 inode
- cd 切换目录
- du 显示目录包含的 **文件** 大小 **du 会深入遍历目录的每个子目录**

  - -a 显示目录和文件的大小
  - -h
  - -s 只显示总计大小(summary)

<!-- more -->

### 文件浏览和创建

- cat && less 显示文件内容 less-分页显示内容

  - space 读取下一个屏幕的内容
  - ↓ 下一行
  - d 前进半页
  - b 后退一页 = Pageup
  - y 后退一行 = ↑
  - u 后退半个屏幕
  - q 退出

  - = 显示在文件中的位置
  - / 进入搜索模式 在斜杠后面输入要搜索的文字
    - n 下一个符合条件的搜索结果
    - N 上一个符合条件的搜索结果

- head 显示前几行
  - n 前 n 行
- tail 显示尾几行

  - -n
  - -f 实时追踪文件更新
    - -s 每隔 s 秒检查一次

- touch 常见一个空白文件(注意:linux 中文件名尽量不要包含空格)
- mkdir 创建文件夹 make directory
  - -p 递归地创建文件夹 e.g. mkdir -p one/two/three

## 文件复制和移动

- cp 拷贝文件 cp new_file new_file_copy
  - -r 拷贝目录 cp -r dir dir_copy
  - 通配符 cp \*.txt folder 把当前目录下所有 txt 文件拷贝到 folder 目录中
- mv 移动文件或目录 or 重命名文件
- rm 删除文件
  - -i 向用户确认是否删除
  - -f 强制删除
  - -r 递归删除 删除目录
- rmdir 删除 空 目录

## 链接

- ln 创建链接(区别)
  - 硬链接
  - 软链接 -s

## 用户管理

如果不设置用户的群组,默认会创建一个和它的用户名一样的群组

- useradd username 添加用户
- passwd username 设置密码
- userdel username 删除用户
  - -r or --remove 删除家目录

### 群组管理

- groupadd 添加群组
- usermod 修改用户的群组
  - -l 对用户重命名(家目录名字需要手动更改)
  - -g groupname username 修改用户群组
  - -G groupname1,groupname2... username 修改用户群组(多个)
    - -a 以追加形式添加
- groups [username] 查看用户所在群组(默认显示当前用户)
- groupdel 删除一个已存在的群组
- chown (change owner) 更改文件所有者(群组)

  - chown username filename
  - chown username:groupname filename
  - -R 递归修改目录的所有子目录和文件的所有者(群组)

- chgrp (change group)
  chgrp groupname filename

- chmod 修改访问权限
  r:read - 4
  w:write - 2
  x:execute - 1

  第一组 rwx 表示文件的所有者对于此文件的访问权限
  第二组 rwx 表示文件的所属群组的其他用户对于此文件的访问权限
  第三组 rwx 表示文件的除前两组的其他用户对于此文件的访问权限

  - 数字分配
    chmod number filename
  - 字母分配
    - 追加
      - chmod u+r file 给 user 添加读的权限
      - chmod g+w file 给 group 添加写的权限
    - 移除
    - = 修改

## Nano 文本剪辑器

nano filename 打开文件

- -m 激活鼠标
- -i 激活自动缩进功能
- -A 激活智能 Home 功能

> 配置文件多以 rc 结尾(run commands)

profile 和 bashrc 的区别
profile 是非图形界面的终端的配置文件
bashrc 是图形化终端的配置文件
profile 会调用 bashrc

source bashrc 使 bashrc 的改动立即生效

## 软件安装

软件仓库的概念
如何更改软件仓库的源

## man && apropos

man 查看命令的具体内容
apropos 根据关键字查找命令
whatis man 的精简版

## 查找文件

### locate

locate 搜索包含关键字的文件或目录 - locate 在问价你的数据库中查找,对于新创建的文件,可能无法检索到 - updatedb 更新数据库,这样就能够检索到文件了

### find

find 只会查找完全符合条件的文件,可以通过\*来扩展查找范围
find 命令可以限定查找目录

- -name 根据名字查找 find /var/log -name "syslog"
- -size 根据大小查找 find /var -size -50k 查找小于 50k 的文件
- -atime 根据修改时间查找 find /var/log -name "syslog" -atime -7 近 7 天访问的文件
- -type d 只查找目录类型 f 只查找文件类型

find 可以对查找到的结果进行操作

```bash
find -name "*.txt" -printf "%p - %u\n"
find -name "*.txt" -delete
```

关于调用命令

```bash
find -name "*.txt" -exec chmod 600 {} \ ;
```

**chmod 600 {} \ ;** 不必用双引号括起来
{}会用查找到的每个文件来替换
\;是必须的结尾

## 数据操作

### grep

**G** lobally search a **R** egular **E** xpression and **P** rint

grep 字符串 文件

- -i 忽略大小写
- -I 排除二进制文件
- -v 只显示文本不在的行 invert
- -r 在所有子目录和子文件中查找 recursive

- E 使用正则表达式
  grep -E ^path /etc/profile
  **大部分系统中默认激活正则表达式**

sort 为文本排序

- -o filename 将排序的结果存储到新的文件
- -r 倒序排序
- -R 随机排序
- -n 对数字排序

wc 文件的统计
可以用来统计行数\字符数\字节数

- -l lines
- -w words
- -c 统计字节数
- -m 统计字符数

unique 删除文件中的重复内容

- unique filename
- unique filename newfilename
- -c 统计重复的行数
- -d 只显示重复行的值

cut 剪切文件的一部分内容

- -d 分割符
- -f 指定第几部分

```bash
cut -d , -f 1,3 notes.csv
```

## 流&&管道&&重定向

重定向 把本来要显示在终端的命令结果,输送到别的地方
管道 一个命令的输出作为另一个命令的输入

### 输出重定向

- \> 重定向到新的文件

```bash
cut -d , -f 1,3 notes.csv > redirect.txt
```

黑洞文件 /dev/null 总是空的文件

```bash
cut -d , -f 1,3 notes.csv > /dev/null
```

这样就没有输出了

- \>\> 重定向到文件的末尾

### 重定向错误输出

| 文件描述符 | 名字   | 解释         |
| ---------- | ------ | ------------ |
| 0          | stdin  | 标准输入     |
| 1          | stdout | 标准输出     |
| 2          | stderr | 标准错误输出 |

2>&1 合并输出

```bash
cat not_exist_file.csv > result.txt 2> errors.log
# 加入文件存在,则写入result.txt,如果错误,则写入errors.log

cat not_exist_file.csv > result.txt 2>&1
# 将标准输出和标准错误输出都重定向到result.txt中

cat not_exist_file.csv >> result.txt 2>&1
# 将标准输出和标准错误输出都追加重定向到result.txt中

```

### 输入重定向

< 将输入重定向为文件内容
<< 将输入重定向为键盘输入 | 以逐行输入的模式

```bash
sort -n << END
# 输入字符,遇到END停止(END为自定义的结束符,可更换)

sort -n << END > numbers_sorted.txt 2>&1
```

### 管道

一个命令的输出作为另一个命令的输入

```bash
du | sort -nr | head
# 列出当前目录下体积前10的文件\目录
```

## 后记

花自无情水自流。一种相思，两处闲愁。
