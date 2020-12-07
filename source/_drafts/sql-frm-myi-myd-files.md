---
title: 数据库中的.frm\.myi\.myd文件
author: harumonia
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
---

最近在寻找一些毕设要用到的数据，医药相关的，恰好在某个网站上面找到了备份数据库(手段不太光彩，这里就不细说了)，省去了写爬虫的麻烦。

不过这些备份文件是 _.MYD/.MYI/.frm_ 这样的后缀，emmmmm，对于用惯了 _.sql_ 的我来说，还是很头大的。

本篇的主要内容就是如何使用 _.frm/.myi/.myd_ 文件来恢复数据库，同时，做了一些关联的延申。

## 恢复文件

直接先 po 出我恢复文件的方法。这里需要根据 mysql 的版本不同分一下情况。

### 5.x

对于 **mysql5.x** 来说，恢复文件就是直接把 _.frm/.myi/.myd_ 文件放到 mysql 的 data\数据库 文件夹下面就行了。

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
# 默认的 3306 端口被 mysql8.0 占用了，所以映射到 3307 端口
docker run --name=mysql1 --restart on-failure -p 3307:3306 -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.16

# 将备份数据放入docker - container 数据库
docker cp 备份数据 mysql1:/var/lib/mysql/数据库名/
```

这样，通过 _mysql workbench_ 或者 _navicat_ 之类的 GUI 就可以看到数据了。之后是同步到 8.0 还是直接导出就自己选择了。

**\*\*\*\***\*\*\*\***\*\*\*\***图片\***\*\*\*\*\***\*\***\*\*\*\*\***

## 延申

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

### “cant change permissions of ca-key.pem”的解决方法

在[8.x 的文件恢复](#8.x) 中，我是用的是从 host 拷贝文件到 container 的方法。后来觉得这个方法太麻烦，而且以后如果想要从 container 中取出文件也要经过一堆的操作命令。

于是就用 docker 的 -v 参数，挂载 host 的文件夹到 container.

这里引发了一个 Windows 特有的错误。

数据库引擎、不同的文件

    不同的引擎下的目录结构、文件类型

错误类型: https://serverfault.com/questions/992396/mysql-will-not-start-cant-change-permissions-of-ca-key-pem

https://github.com/docker-library/mysql/issues/302
