---
title: "为什么 mongodb 使用 ObjectId,  而 Mysql 使用自增 id"
cid: 230
slug: 230
date: 2021-03-30 18:07:14
updated: 2021-03-30 18:07:14
status: publish
author: harumonia
categories:
  - 源流清泉
tags:
  - DataBase
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
---

## 前言

首先需要说明的一点是, 本篇并不是为了讨论 ObjectId 和自增 id 谁更好用.在笔者看来, 文档型数据库和关系型数据库的使用场景不同, 有不同的使用倾向是理所当然的事情, 没有必要拉到一块儿"关公战秦琼".

本篇单从设计的角度来说, 为什么 ObjectId 和 自增 id 分别使用于各自的使用场景.

<!-- more -->

## MySql

在讨论 mysql 为什么使用自增 id 为主键之前, 有一个问题, mysql 有哪些主键选择.

在常规的数据库中, 主键存在两种选择, 也就是 auto-increment (int\bigint) 和 uuid (Universally Unique Identifier) (varchar).

### 自增主键

自增主键用来为新的数据项生成一个在数据表中唯一的 id.

在数据表中的数据量膨胀到一个峰值时, 需要对数据表进行分片, 而分片很容易就会导致数据表的自增 id 不再唯一.

#### 引申: 自增主键的数值极限

先说结论, **实际使用基本上达不到自增主键的极限** .

自增主键一般选用三个类型, int、unsigned int、bigint.

int 的取值范围是 0~2147483648, unsigned 是其两倍.

寻常单数据库在达到这个数量级之前, 存储空间就要告急了, 这种情况下, 一般会选择进行分库分表, 而分库分表之后, 再想要使用自增主键, 就需要进行一系列严格的规划设计.通常, 我们会改用下文的 UUID 来作为主键.

### UUID 主键

UUID 同样是一个唯一的 id, 它的唯一不再局限于数据表, 而是在 "整个宇宙" 中都独一无二.

这种说法当然有欠考虑, UUID 不是"绝对"的唯一, 但是在日常的使用中可以将其看作绝对唯一.它的这个特性可以用来解决分布式数据库中的 _主键唯一性_ 问题.

但是 UUID 的缺点也很明显.

1. 查找效率
2. 占用更多的存储空间
3. 排序问题
4. 插入操作时性能很低

#### 查找效率

最直观的看, 相比起 _1, 2, 3_ 这样简单的数字, 36 位的 UUID 在做查找时显然更加吃力.当然我们所说的查找效率并不会如此肤浅.

由于主键天然就是索引, 所以在大量数据的情况下做准确查找(=)时, 二者的查找效率相差并不明显.但是在做模糊查找(LIKE)时, 自增 ID 的效率会高于 UUID.

#### 占用更多的存储空间

- UUID 本身占用的存储空间是自增 id 的 4 倍. (varchar(32) vs bigint)

- 根据 UUID 所建立的索引也会占用更多的存储空间.

二者结合起来, 存储空间的差距可以看一下 [UUID 和自增 ID 存储空间对比](#UUID和自增ID存储空间对比)

##### 优化

针对存储空间的一个优化, 就是使用 binary UUID, 在 MySQL 中自带一个将 UUID 从 varchar 转换为 binary 的函数 -- UUID_TO_BIN(), 同样, 可以使用 BIN_TO_UUID() 来逆向这个过程.

#### 排序问题

自增 id 能够直接用来进行排序, 但是 UUID 显然不具备这个特性.

#### 插入效率

在讨论插入效率之前, 先要理解一个概念, Innodb 的页是什么.

> Page 是 Innodb 存储的最基本结构, 也是 Innodb 磁盘管理的最小单位, 与数据库相关的所有内容都存储在 Page 结构里.

当插入一个新的 UUID 主键数据时, InnoDB 会查找应该将这个行放置在哪个数据页中, 如果数据页不再缓存中, 则会将这张数据页加载进来.也就是说, 当插入这样一条新的数据时, 整个 B 树都会受到影响, 这也是 UUID 插入效率低下的本质原因.

关于 UUID 和自增 ID 的插入效率, 在下文中同样有实践比较.

### UUID 和自增 ID 存储空间对比

这里列出了新建一张一万条数据的数据表时, UUID、BIN-UUID 和 auto-increment 三者的存储空间、插入时间对比.

相关的代码可见于[附录](#SQL).

| TABLE_NAME              | DATA   | TIME(sec) |
| ----------------------- | ------ | --------- |
| test_for_auto_increment | 0.33MB | 77.594    |
| test_for_uuid           | 1.52MB | 80.000    |
| test_for_uuid_bin       | 0.45MB | 74.250    |

### 总结

自增 id 有着极高的性能与使用效率, 并且足够应付绝大多数的情境.而 UUID 虽然有诸多的缺点, 但是天然适合分布式这样的业务情境.

除了 UUID 之外, 还有其他的, Nature Key、snowflake 等算法能够生成 varchar 类型的主键, 它们的缺点大同小异, 不过都在 UUID 的基础上有了不同方向、不同程度的优化.

在大二为 xminer 设计数据库时, 导师让我将主键更改为 UUID, 彼时对这种主键惊为天人, 不过在现在看来, 实在是没有什么必要 😉.

## Mongodb

现在将视角返回到 MongoDB, MongoDB 采用的是 ObjectID 作为“主键”.

> ObjectIds are small, likely unique, fast to generate, and ordered

_unique_ 这个特性是否能让你回想起之前提到的 UUID? 根据这个特性, 它的一个作用就明显了, _有利于分布式_.

文档型数据库海纳百川, 没有硬性的数据结构需求, "啥都可以往里面填" 的结果就是, 文档型数据库往往对应了很大的数据量以及高并发的业务需求.这也是 MongoDB 采用这种近乎唯一的 id 作为默认主键的原因.

虽然早早地就抛出了它的作用, 不过我们最好还是更加深入地了解以下, **什么是 ObjectID**.

### ObjectID

从[官方文档](https://docs.mongodb.com/manual/reference/method/ObjectId/)来看, `ObjectId` 由以下的部分组成.

- a 4-byte timestamp value, representing the ObjectId’s creation, measured in seconds since the Unix epoch
- a 5-byte random value
- a 3-byte incrementing counter, initialized to a random value

在 MongoDB 2.x 的版本中, 第二点的 5-byte 又可以细分为

- a 3-byte machine identifier
- a 2-byte process id

正因为`ObjectID`将时间戳纳入主键生成的范围, mongoDB 可以使用如下命令实现按入库的顺序逆序排列, 并且性能效率要比的查找排序要高很多.

```shell
db.getCollection('collection_name').find({}).sort({$natural:-1}).limit(5)
```

## Reference

1. [What Is MongoDB's \_id Field and How to Use It](https://orangematter.solarwinds.com/2019/12/22/what-is-mongodbs-id-field-and-how-to-use-it/)
2. [MySQL UUID Smackdown: UUID vs. INT for Primary Key](https://www.mysqltutorial.org/mysql-uuid/)
3. [THE CASE AGAINST AUTO INCREMENT IN MYSQL](https://blog.pythian.com/case-auto-increment-mysql/)
4. [auto-increment-keys-vs-uuid](https://mareks-082.medium.com/auto-increment-keys-vs-uuid-a74d81f7476a)
5. [mysql 中 InnoDB 引擎中页的概念](https://segmentfault.com/a/1190000008545713)

## SQL

### UUID_BIN

```mysql
-- drop table `test_for_uuid_bin`;

CREATE TABLE `test_for_uuid_bin`
(
 id BINARY(16) PRIMARY KEY,
    val VARCHAR(255)
);

DELIMITER $$
CREATE PROCEDURE generate_data_uuid_bin()
BEGIN
  DECLARE i INT unsigned DEFAULT 1;
  WHILE i < 10000 DO
    INSERT INTO `test_for_uuid_bin` (`id`, `val`) VALUES (
    UUID_TO_BIN(UUID()),
      ROUND(RAND()*100, 2)
    );
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

call generate_data_uuid_bin()
```

### UUID

```mysql
drop table `test_for_uuid`;

CREATE TABLE `test_for_uuid`
(
 id varchar(36) PRIMARY KEY,
    val VARCHAR(255)
);

DELIMITER $$
CREATE PROCEDURE generate_data_uuid()
BEGIN
  DECLARE i INT unsigned DEFAULT 1;
  WHILE i < 10000 DO
    INSERT INTO `test_for_uuid` (`id`, `val`) VALUES (
      UUID(),
      ROUND(RAND()*100, 2)
    );
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

call generate_data_uuid()
```

### AUTO_INCREMENT

```mysql
-- drop table `test_for_auto_increment`;

CREATE TABLE `test_for_auto_increment`
(
 id int auto_increment PRIMARY KEY,
    val VARCHAR(255)
);

DELIMITER $$
CREATE PROCEDURE generate_data_auto_increment()
BEGIN
  DECLARE i INT unsigned DEFAULT 1;
  WHILE i < 10000 DO
    INSERT INTO `test_for_auto_increment` (`val`) VALUES (
      ROUND(RAND()*100, 2)
    );
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

call generate_data_auto_increment()
```
