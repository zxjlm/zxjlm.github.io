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

## Reference

1. [What Is MongoDB's \_id Field and How to Use It](https://orangematter.solarwinds.com/2019/12/22/what-is-mongodbs-id-field-and-how-to-use-it/)
