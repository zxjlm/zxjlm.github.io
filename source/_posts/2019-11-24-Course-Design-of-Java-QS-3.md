---
layout: post
cid: 169
title: Java课设中的问题以及解决方案(三)
slug: 169
date: 2019/11/24 18:50:50
updated: 2019/11/24 18:50:50
status: publish
author: harumonia
categories:
  - 源流清泉
  - Java
tags:
  - Java课程设计
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

## 前言

这次进行 Java 的大作业,虽然是一拖三,不过还是准备做得漂亮一点.Java 还是很有趣的,并且可能以后工作室项目能用得到.

嗯,如果做得好了,就请自己去搓一顿!

## 思路

- 需求分析
- 架构
- 界面设计

### 需求分析

这是一个项目的开始,课程设计(非游戏类)应该是要去解决一个实际的问题,而不是单纯的应付差事.
这一次的项目需求与暑假项目相同,所以就不做赘述.

### 架构

项目架构是衡量一个项目的质量的重要指标.逻辑清晰的项目结构可以省去开发过程中的很多烦恼,同时,也能够极大地增加协同开发的效率.

我这次使用的是比较传统的 mvc 架构.

- 最上面的一层，是直接面向最终用户的"视图层"（View）。它是提供给用户的操作界面，是程序的外壳。
- 最底下的一层，是核心的"数据层"（Model），也就是程序需要操作的数据或信息。
- 中间的一层，就是"控制层"（Controller），它负责根据用户从"视图层"输入的指令，选取"数据层"中的数据，然后对其进行相应的操作，产生最终结果。

当然也可以将 mvc 混淆,都合并在少数的文件当中,事实上我在完成 C#的课程设计的时候就是这么做的,这样的后果也很明显,我现在已经看不懂我的 C#课设了...

当然,便于阅读维护只是 **MVC 模式下思路清晰** 的一个小小的伴生好处.
随着项目的膨胀,越来越多的功能涌入,mvc 甚至还需要再次进行划分.这个时候,你是选择凭借自己的记忆去记录各个接口之间的关系,还是寄托于 MVC 架构,简单明了地管理自己的项目呢?

再说一说协作开发的效率.
协作开发这个词估计不会存在于我四年大学生活之中了.不过我还是可以憧憬一下的.
mvc 模式下,各个模块功能明确,责任关系清晰,任务可以以极低的耦合度准确地分配到每个人的头上,如果,我是说如果,一群水平相当的开发者在这种模式下齐头并进,开发效率无疑是十分可怕的.

推而广之,这种模式的变体可以应用到社会的很多合作模式中...emmmm,好吧,这只是一篇讲技术的文章,就这样吧.

~~现在回头看看暑期的项目,一个人能开发到这个地步,我还是有点小小的得意的.~~

### 界面设计

每一个直男的噩梦,唉...暂且先挂起来吧...

## 数据库二三事

在[Java 课设中的问题以及解决方案(二)](http://www.harumonia.top/index.php/archives/167/)
和[Java 课设中的问题以及解决方案(一)](http://www.harumonia.top/index.php/archives/164/)
中,都有对数据库连接的一些叙述.不过都是一些比较粗浅的尝试.

在进行登录&注册模块的开发时,我对数据库进行了比较深入的了解和操作.

### prepareStatement 和 createStatement

prepareStatement 会先初始化 SQL，先把这个 SQL 提交到数据库中进行预处理，多次使用可提高效率.

createStatement 不会初始化，没有预处理，每次都是从 0 开始执行 SQL.
两者这代码上有显著的区别.

e.g.

```Java
// prepareStatement
ResultSet rs = null;
String sql = "select * from users where  username=? and userpwd=?";
PreparedStatement ps = con.prepareStatement(sql);
ps.setString(1,username);
pstmt.setString(2, userpwd);
//prepareStatement.setString() 给sql中的"?"赋值,这里将第一个?设置为username,第二个?设置为userpwd

// createStatement
ResultSet rs = null;
String sql = "select * from users where  username= '"+username+"' and userpwd='"+userpwd+"'";
createStatement ps = con.prepareStatement(sql);
rs = stmt.executeQuery(sql);
// createStatement没有?形式的格式化,直接使用
```

格式化的方法让我们在编写代码时思路更加清楚,代码的形式也更加的优雅.(试想一下,上述如果不是 2 个参数,而是十多个参数,那么 create 方法将会有多少个+和")

同时,预编译的方法还可以有效地抵御 sql 注入攻击.

e.g.

```Java
String sql = "select * from user where username= 'zxj' and userpwd='"+varpasswd+"'";
```

如果用户在密码栏中输入 `'or '1' = 1';drop table book;` 那么就构成了这样一条查询语句

```SQL
select * from user where username= 'zxj' and userpwd='or '1' = 1';
drop table usr;
```

这样的查询语句毫无疑问是成立并且是可以通过执行的.
所以,用户可以通过这种方法,在不获取数据库账号密码的情况下,删除你的 usr 表!~

而如果你使用`prepareStatement`,用 setString 的方法传递参数,再进行一次预编译,就可以有效地避免这种困扰.

**所以说,无论从代码的可读性和可维护性，还是从提高性能方面，或者说避免攻击方面，都应该使用 prepareStatement.**

### hash 加密

密码的明文传递一直是为业界所诟病的事情.
在进行暑假项目工作的时候,涛哥教我使用 hash 加密一次密码.

~~牢骚话:本来嘛,课设没必要做到这个地步,不过今天正好涛哥出国,这之后一年才能回来,所以传承一下他严谨的工作态度,算是一个纪念吧~~

```Java
public static String getSHA(String input) {
    MessageDigest md = MessageDigest.getInstance("SHA-256");

    byte[] messageDigest = md.digest(input.getBytes());

    BigInteger no = new BigInteger(1, messageDigest);

    String hashtext = no.toString(16);

    while (hashtext.length() < 32) {
        hashtext = "0" + hashtext;
    }

    return hashtext;
}
```

### datetime 处理

数据库的 datetime 数据是 xxxx-xx-xx xx : xx : xx 形式的,所以就用了一个比较土的办法...

```Java
Date date=new Date();
String date = String.format("%tF%n", date)+" "+String.format("%tT%n",date)
```

另外,关于 string 的格式化,推荐一篇[博客](https://blog.csdn.net/lonely_fireworks/article/details/7962171)

## 后记

- 等待,并心怀希望.
