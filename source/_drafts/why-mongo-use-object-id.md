---
title: 为什么 mongodb 使用 ObjectId, 而 Mysql 使用自增 id
tags:
---

## Mongodb

官网描述: ObjectIds are small, likely unique, fast to generate, and ordered

从[官方文档](https://docs.mongodb.com/manual/reference/method/ObjectId/)来看, `ObjectId` 由以下的部分组成.

- a 4-byte timestamp value, representing the ObjectId’s creation, measured in seconds since the Unix epoch
- a 5-byte random value
- a 3-byte incrementing counter, initialized to a random value

在 MongoDB 2.x 的版本中, 第二点的 5-byte 又可以细分为

- a 3-byte machine identifier
- a 2-byte process id

mongoDB 可以使用如下命令实现按入库的顺序逆序排列, 并且性能消耗普通的查找排序要低很多(TODO:展开).

```shell
db.getCollection('goudi_new_new').find({}).sort({$natural:-1}).limit(5)
```

## MySql

在讨论 mysql 为什么使用自增 id 为主键之前, 有一个问题, mysql 有哪些主键选择.

在常规的数据库中, 主键存在两种选择, 也就是 auto-increment (int\bigint) 和 uuid (Universally Unique Identifier) (varchar).

### 自增主键

自增主键用来为新的数据项生成一个在数据表中唯一的 id.

在数据表中的数据量膨胀到一个峰值时，需要对数据表进行分片，而分片很容易就会导致数据表的自增 id 不再唯一。

也就是说，**正常情况下，自增主键在分布式的数据库中表现很糟糕**。

### UUID

UUID 同样是一个唯一的 id, 它的唯一不再局限于数据表, 而是在 "整个宇宙" 中都独一无二。

这种说法当然有欠考虑，UUID 不是"绝对"的唯一，但是在日常的使用中可以将其看作绝对唯一。它的这个特性可以用来解决分布式数据库中的 _主键唯一性_ 问题.

但是 UUID 的缺点也很明显。

1. 查找效率
2. 占用更多的存储空间
3. 排序问题
4. 插入操作时性能很低

#### 查找效率

最直观的看，相比起 _1,2,3_ 这样简单的数字, 36 位的 UUID 在做查找时显然更加吃力.当然我们所说的查找效率并不会如此肤浅。

由于主键天然就是索引，所以在大量数据的情况下做准确查找(=)时，二者的查找效率相差并不明显。但是在做模糊查找(LIKE)时，自增 ID 的效率会高于 UUID。

#### 占用更多的存储空间

- UUID 本身占用的存储空间是自增 id 的 4 倍. (varchar(32) vs bigint)

- 根据 UUID 所建立的索引也会占用更多的存储空间.

二者结合起来，存储空间的差距可以看一下 [UUID 和自增 ID 存储空间对比](#UUID和自增ID存储空间对比)

##### 优化

针对存储空间的一个优化，就是使用 binary UUID, 在 MySQL 中自带一个将 UUID 从 varchar 转换为 binary 的函数 -- UUID_TO_BIN(), 同样, 可以使用 BIN_TO_UUID() 来逆向这个过程.

#### 排序问题

自增 id 能够直接用来进行排序，但是 UUID 显然不具备这个特性。

#### 插入效率

数据表分页时的效率。(TODO)

### UUID 和自增 ID 存储空间对比

| TABLE_NAME              | DATA   | TIME(sec) |
| ----------------------- | ------ | --------- |
| test_for_auto_increment | 0.33MB | 77.594    |
| test_for_uuid           | 1.52MB | 80.000    |
| test_for_uuid_bin       | 0.45MB | 74.250    |

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
    INSERT INTO `test_for_uuid_bin` (`id`,`val`) VALUES (
    UUID_TO_BIN(UUID()),
      ROUND(RAND()*100,2)
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
    INSERT INTO `test_for_uuid` (`id`,`val`) VALUES (
      UUID(),
      ROUND(RAND()*100,2)
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
      ROUND(RAND()*100,2)
    );
    SET i = i + 1;
  END WHILE;
END$$
DELIMITER ;

call generate_data_auto_increment()
```
