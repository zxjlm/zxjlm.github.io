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

在 MongoDB 2.x 的版本中, 第二点

- a 3-byte machine identifier
- a 2-byte process id

mongoDB 可以使用如下命令实现按入库的顺序逆序排列, 并且性能消耗普通的查找排序要低很多(TODO:展开).

```shell
db.getCollection('goudi_new_new').find({}).sort({$natural:-1}).limit(5)
```

| TABLE_NAME              | DATA   | TIME(sec) |
| ----------------------- | ------ | --------- |
| test_for_auto_increment | 0.33MB | 77.594    |
| test_for_uuid           | 1.52MB | 80.000    |
| test_for_uuid_bin       | 0.45MB | 74.250    |

## Reference

1. [What Is MongoDB's \_id Field and How to Use It](https://orangematter.solarwinds.com/2019/12/22/what-is-mongodbs-id-field-and-how-to-use-it/)
2. [MySQL UUID Smackdown: UUID vs. INT for Primary Key](https://www.mysqltutorial.org/mysql-uuid/)

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
