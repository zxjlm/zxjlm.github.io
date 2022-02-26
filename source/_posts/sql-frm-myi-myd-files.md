---
title: 数据库中的.frm\.myi\.myd文件
author: harumonia
layout: post
date: 2020-12-07 17:44:26
updated: 2020-12-07 23:12:00
categories:
  - 源流清泉
  - DataBase
tags:
  - mysql
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
---

最近在寻找一些毕设要用到的数据，医药相关的，恰好在某个网站上面找到了备份数据库(手段不太光彩，这里就不细说了)，省去了写爬虫的麻烦。

不过这些备份文件是 _.MYD / .MYI / .frm_ 这样的后缀，emmmmm，对于用惯了 _.sql_ 的我来说，还是很头大的。

本篇的主要内容就是如何使用 _.frm / .MYI / .MYD_ 文件来恢复数据库，同时，做了一些关联的延申。

<!-- more -->

## 恢复文件

直接先 po 出我恢复文件的方法。这里需要根据 mysql 的版本不同分一下情况。

### 5.x

对于 **mysql5.x** 来说，恢复文件就是直接把 _.MYD / .MYI / .frm_ 文件放到 mysql 的 data\数据库 文件夹下面就行了。

这里提供一下默认情况下 mysql 的 data 文件夹路径:

- Windows : C:\ProgramData\MySQL\MySQL Server 8.0\Data\数据库名
- Linux : /var/lib/mysql/数据库名
- macos : 如果我的 mac 还在的话就不会知道 Windows 的路径了= =

移动完文件之后刷新一下数据库就能看到了。

### 8.x

我的 Windows 上使用的就是 **mysql8.0**, 5.x 的恢复方法在 8.x 上面是行不通的，最简单粗暴的办法就是再装一个 5.x.

考虑到平时基本上不会用 5.x 版本的 mysql，所以选择使用 docker 部一个临时性质的 mysql。

```shell
# 获取5.7镜像
docker pull mysql:5.7.16

# 运行
# -e 指定 mysql 的密码
# 默认的 3306 端口被 mysql8.0 占用了，所以映射到 3308 端口
docker run --name=mysql1 --restart on-failure -p 3308:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.16

# 将备份数据放入docker - container 数据库
docker cp 备份数据 mysql1:/var/lib/mysql/数据库名/
```

这样，通过 _mysql workbench_ 或者 _navicat_ 之类的 GUI 就可以看到数据了。之后是同步到 8.0 还是直接导出就自己选择了。

![image-20201207214445489](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20201207214445489.png)

## 延申

延申中主要了解了如下的内容.

mysql 的两大常用存储引擎 **MyISAM** 和 **InnoDB** 的区别在哪里？

为什么一定要在 5.x 版本的 MyISAM 中恢复？可不可以直接在 8.x 版本的 MyISAM 中恢复？

是否可以通过挂载数据盘来简化上述的 _8.0_ 版本的操作?

### 为什么是.MYD/.MYI/.frm

数据库存在多种存储引擎，每个引擎有着不同的特性。_.MYD/.MYI/.frm_ 对应的是 **MyISAM** 引擎.

每个文件的作用如下

- .frm（存储表定义）
- .MYD（MYData，存储数据）
- .MYI（MYIndex，存储索引）

数据文件和索引文件可以放置在不同的目录，平均分布 IO，获得 **更快的速度** 。更快的访问速度，这就是 MyISAM 这个引擎的特点。

同样一个常见的存储引擎就是 **InnoDB** .InnoDB 存储引擎提供了具有提交、回滚和崩溃恢复能力的 _事务_ 安全。但是对比 MyISAM 的存储引擎，InnoDB 写的处理效率差一些，并且会占用更多的磁盘空间以保留数据和索引。同时,MySQL 支持外键的存储引擎 **只有** InnoDB.

以上所说的不同就是课本上所讲的 _事务与完整性_ , MyISAM 和 InnoDB 的另一个不同就是 **并发(concurrency)**.使用 MyISAM，DML 语句将在表上获得排他锁，并且在保持该锁的同时，没有其他会话可以在表上执行 SELECT 或 DML 操作。

更多的不同点，引用自[What's the difference between MyISAM and InnoDB?](https://stackoverflow.com/questions/12614541/whats-the-difference-between-myisam-and-innodb)

MYISAM:

1. MYISAM supports Table-level Locking
2. MyISAM designed for need of speed
3. MyISAM does not support foreign keys hence we call MySQL with MYISAM is DBMS
4. MyISAM stores its tables, data and indexes in diskspace using separate three different files. (tablename.FRM, tablename.MYD, tablename.MYI)
5. MYISAM not supports transaction. You cannot commit and rollback with MYISAM. Once you issue a command it’s done.
6. MYISAM supports fulltext search
7. You can use MyISAM, if the table is more static with lots of select and less update and delete.

INNODB:

1. InnoDB supports Row-level Locking
2. InnoDB designed for maximum performance when processing high volume of data
3. InnoDB support foreign keys hence we call MySQL with InnoDB is RDBMS
4. InnoDB stores its tables and indexes in a tablespace
5. InnoDB supports transaction. You can commit and rollback with InnoDB

### 为什么不能在 8.x 版本的 MyISAM 中恢复

存储文件的差异不仅存在于不同的物理引擎之间，使用不同版本的 MySQL，即使是相同的存储引擎，也会有存储文件上的差异。

从[Removal of File-based Metadata Storage](https://dev.mysql.com/doc/refman/8.0/en/data-dictionary-file-removal.html)可以看到，作为存储表定义的 _.frm 文件_ 已经遭到了废弃，这也是为什么我无法在 8.x 的 MyISAM 中直接恢复数据库。

这种备份实在是坑人坑己。大概一年之前，我大部分的开发都是无脑选择的 mysql5.6，最主要的原因就是引用参考的很多代码都是 5.6 的数据库，学校教的数据库也是老版本的。不过随着技术见闻日渐增长，也逐渐开始使用更新版本的 mysql8.0.如果我也是像这位网站管理一样使用这种备份方式，那么"恢复以前那么多数据库"这件事情的工作量就足够我放弃拥抱新技术，继续坐守 5.6 了。

#### 数据库备份法

毫无疑问这种备份法不值得提倡。那么如何正确地备份数据库呢？

> If we had to avoid the command line always, we would never have made it to the moon. Either get another astronaut or train harder.

在 [7.4 Using mysqldump for Backups](https://dev.mysql.com/doc/refman/8.0/en/using-mysqldump.html) 有提到的一种备份法,就是将数据库变成 sql 文件来保存。

```shell
# 将tcm_web数据库备份到tcm_web.sql文件
mysqldump -u root -p tcm_web > tcm_web.sql
```

这样做的最大的好处就是通用.上述的版本与物理引擎,都可以使用 sql 文件来恢复,并且恢复也就是一行命令的事情.

其次的一个好处就是,在一定程度上避免了考虑数据库的运行状态.这与其说是 mysqldump 的好处,不如说是直接复制文件的坏处.如果在删除数据库的地方发生了什么，或者在主数据库上执行了其他有害的 SQL，该怎么办？这些语句将复制到从属服务器并执行相同的操作，从而无法回滚到事件发生之前的某个时刻.

最后的一个好处就是简单方便.不需要去寻找数据库的 data 文件夹在哪里,也不需要复制粘贴各种调试,直接一行命令完成备份,一行命令完成恢复~

### “cant change permissions of ca-key.pem”的解决方法

在[8.x 的文件恢复](#8.x) 中，我是用的是从 host 拷贝文件到 container 的方法。后来觉得这个方法太麻烦，而且以后如果想要从 container 中取出文件也要经过一堆的操作命令。

于是就用 docker 的 -v 参数，挂载 host 的文件夹到 container.

这里引发了一个 Windows 特有的错误。

```shell
# 运行的日志如下
2020-12-07T13:04:27.056363Z 0 [Warning] TIMESTAMP with implicit DEFAULT value is deprecated. Please use --explicit_defaults_for_timestamp server option (see documentation for more details).
2020-12-07T13:04:27.064426Z 0 [Warning] Setting lower_case_table_names=2 because file system for /var/lib/mysql/ is case insensitive
2020-12-07T13:04:32.266049Z 0 [Warning] InnoDB: New log files created, LSN=45790
2020-12-07T13:04:32.967320Z 0 [Warning] InnoDB: Creating foreign key constraint system tables.
2020-12-07T13:04:33.077801Z 0 [Warning] No existing UUID has been found, so we assume that this is the first time that this server has been started. Generating a new UUID: bfe2230e-388c-11eb-93e3-0242ac110002.
2020-12-07T13:04:33.132017Z 0 [Warning] Gtid table is not ready to be used. Table 'mysql.gtid_executed' cannot be opened.
mysqld: Can't change permissions of the file 'ca-key.pem' (Errcode: 1 - Operation not permitted)
2020-12-07T13:04:33.350597Z 0 [ERROR] Could not set file permission for ca-key.pem
2020-12-07T13:04:33.350619Z 0 [ERROR] Aborting
```

主要就是权限的问题，这里需要挂载到 Windows 上面的文件夹的读写权限，偏偏 windows 的授权策略还挺麻烦的。

最后我在 GitHub 上面找到了[解决方案](https://github.com/docker-library/mysql/issues/302)。

> I tried what you suggested [@yosifkit](https://github.com/yosifkit), but no luck. Eventually, I changed the image version to `mysql:5.7.16` and now it is working fine. Sorry to disappoint you 😞

于是将版本换成 5.7.16，成功运行。

此时，进入到挂载数据盘的文件夹，container 中的数据就可以直接在 host 里面访问到了。(tcm_web 就是我备份的数据库文件夹)

![image-20201207215507998](https://picgo-zxj.oss-cn-shanghai.aliyuncs.com/image-20201207215507998.png)

## 后记

本来只是想记录一下 mysql 文件恢复的解决方案,不过后来发散开来,又查阅了很多的资料,才有了这一篇博客.(还是闲的~)

其实还有一些坑没有填上,比如在实际操作的过程中,我发现**5.7**的 data 文件夹内容结构和**5.7.16**的内容有些差距,这种情况的成因是什么?

这样发散下去是没有止境的,我所掌握的永远都只在圆圈以内罢了.
