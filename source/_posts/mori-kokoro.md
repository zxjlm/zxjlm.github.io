---
layout: post
title: Mori Kokoro 开发记录
date: 2020-11-05 10:52:26
updated: 2020-11-09 14:54:26
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - diyTools
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

## 前言

目前主要接触的爬虫开发主要有两种：

1. 静态网页
2. api

我司已经有静态网页的检测工具,不过随着 api 类爬虫日益增加,需要一个新的可以用来检测 api 变动的脚本.

这里我选择开发一个命令行工具,而非 web 平台服务.理由是前者更加 geek && cool,同时,前者只要稍作改动,就可以很好地兼容后者.

<!-- more -->

## 需求分析

### 核心需求

1. 检测 api 是否仍然可用
2. 检测 api 的格式是否有变化
3. ~~检测 api 对应的位置是否有对应的值~~

### 隐藏需求

1. 并发效率.需要检测的爬虫不是简单的十几个,如何在尽可能短的时间内完成大量的爬虫检测？
2. 形成报告/发送邮件.每次的检测结果需要形成记录报告,固化结果,不过这并不是刚需.
3. 可扩展性.可扩展性主要分为三个方面.

- 参数扩展.主要体现在请求头的扩展
- 反反爬虫扩展
- 解密扩展
  某些网站的 api 并不是简单就能申请到数据,但是每个网站的反爬虫、加密都不一样,不存在通解的写法,这里作为脚本的开发者,需要提供对应的接口给使用者.

## 脚本执行流程

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" id="SvgjsSvg1006" width="538" height="843" version="1.1"><defs id="SvgjsDefs1007"><marker id="SvgjsMarker1016" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1017" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker><marker id="SvgjsMarker1028" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1029" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker><marker id="SvgjsMarker1038" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1039" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker><marker id="SvgjsMarker1052" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1053" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker><marker id="SvgjsMarker1066" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1067" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker><marker id="SvgjsMarker1080" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1081" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker><marker id="SvgjsMarker1094" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1095" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker><marker id="SvgjsMarker1108" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1109" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker><marker id="SvgjsMarker1116" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1117" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker><marker id="SvgjsMarker1135" markerWidth="16" markerHeight="12" refX="16" refY="6" viewBox="0 0 16 12" orient="auto" markerUnits="userSpaceOnUse" stroke-dasharray="0,0"><path id="SvgjsPath1136" d="M0,2 L14,6 L0,11 L0,2" fill="#323232" stroke="#323232" stroke-width="2"/></marker></defs><g id="SvgjsG1008" transform="translate(60,25)"><path id="SvgjsPath1009" d="M 0 4Q 0 0 4 0L 92 0Q 96 0 96 4L 96 40Q 96 44 92 44L 4 44Q 0 44 0 40Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1010"><text id="SvgjsText1011" font-family="&quot;Comic Sans MS&quot;" text-anchor="middle" font-size="19px" width="76px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="&quot;Comic Sans MS&quot;" size="19px" weight="400" font-style="" opacity="1" y="7.15" transform="rotate(0)"><tspan id="SvgjsTspan1012" dy="23" x="48"><tspan id="SvgjsTspan1013" style="text-decoration:;">start</tspan></tspan></text></g></g><g id="SvgjsG1014"><path id="SvgjsPath1015" d="M108 69L108 100L108 100L108 131" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1016)"/></g><g id="SvgjsG1018" transform="translate(25,131)"><path id="SvgjsPath1019" d="M 20 0L 166 0L 146 60L 0 60L 20 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1020"><text id="SvgjsText1021" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="117px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="12.05" transform="rotate(0)"><tspan id="SvgjsTspan1022" dy="16" x="83.4"><tspan id="SvgjsTspan1023" style="text-decoration:;">input url、regex、</tspan></tspan><tspan id="SvgjsTspan1024" dy="16" x="83.4"><tspan id="SvgjsTspan1025" style="text-decoration:;">path、etc.</tspan></tspan></text></g></g><g id="SvgjsG1026"><path id="SvgjsPath1027" d="M108 191L108 216.5L108 216.5L108 242" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1028)"/></g><g id="SvgjsG1030" transform="translate(57,242)"><path id="SvgjsPath1031" d="M 0 33L 51 0L 102 33L 51 66L 0 33Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1032"><text id="SvgjsText1033" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="82px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="23.05" transform="rotate(0)"><tspan id="SvgjsTspan1034" dy="16" x="51"><tspan id="SvgjsTspan1035" style="text-decoration:;">status_code</tspan></tspan></text></g></g><g id="SvgjsG1036"><path id="SvgjsPath1037" d="M159 275L215.5 275L215.5 275L272 275" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1038)"/><rect id="SvgjsRect1040" width="37" height="16" x="197" y="267" fill="#ffffff"/><text id="SvgjsText1041" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="37px" fill="#323232" font-weight="400" align="top" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="265.05" transform="rotate(0)"><tspan id="SvgjsTspan1042" dy="16" x="215.5"><tspan id="SvgjsTspan1043" style="text-decoration:;">!=200</tspan></tspan></text></g><g id="SvgjsG1044" transform="translate(272,250)"><path id="SvgjsPath1045" d="M 16.666666666666668 0L 146.33333333333334 0C 168.55555555555554 0 168.55555555555554 50 146.33333333333334 50L 16.666666666666668 50C -5.555555555555556 50 -5.555555555555556 0 16.666666666666668 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1046"><text id="SvgjsText1047" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="143px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="15.05" transform="rotate(0)"><tspan id="SvgjsTspan1048" dy="16" x="81.5"><tspan id="SvgjsTspan1049" style="text-decoration:;">error(status_code)</tspan></tspan></text></g></g><g id="SvgjsG1050"><path id="SvgjsPath1051" d="M108 308L108 340.5L108 340.5L108 373" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1052)"/><rect id="SvgjsRect1054" width="42" height="16" x="87" y="332.5" fill="#ffffff"/><text id="SvgjsText1055" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="42px" fill="#323232" font-weight="400" align="top" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="330.55" transform="rotate(0)"><tspan id="SvgjsTspan1056" dy="16" x="108"><tspan id="SvgjsTspan1057" style="text-decoration:;">==200</tspan></tspan></text></g><g id="SvgjsG1058" transform="translate(55.5,373)"><path id="SvgjsPath1059" d="M 0 35L 52.5 0L 105 35L 52.5 70L 0 35Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1060"><text id="SvgjsText1061" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="85px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="25.05" transform="rotate(0)"><tspan id="SvgjsTspan1062" dy="16" x="52.5"><tspan id="SvgjsTspan1063" style="text-decoration:;">path is exist?</tspan></tspan></text></g></g><g id="SvgjsG1064"><path id="SvgjsPath1065" d="M160.5 408L216.75 408L216.75 408L273 408" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1066)"/><rect id="SvgjsRect1068" width="29" height="16" x="202.25" y="400" fill="#ffffff"/><text id="SvgjsText1069" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="29px" fill="#323232" font-weight="400" align="top" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="398.05" transform="rotate(0)"><tspan id="SvgjsTspan1070" dy="16" x="216.75"><tspan id="SvgjsTspan1071" style="text-decoration:;">false</tspan></tspan></text></g><g id="SvgjsG1072" transform="translate(273,383)"><path id="SvgjsPath1073" d="M 16.666666666666668 0L 145.33333333333334 0C 167.55555555555554 0 167.55555555555554 50 145.33333333333334 50L 16.666666666666668 50C -5.555555555555556 50 -5.555555555555556 0 16.666666666666668 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1074"><text id="SvgjsText1075" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="142px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="15.05" transform="rotate(0)"><tspan id="SvgjsTspan1076" dy="16" x="81"><tspan id="SvgjsTspan1077" style="text-decoration:;">error(path change)</tspan></tspan></text></g></g><g id="SvgjsG1078"><path id="SvgjsPath1079" d="M108 443L108 471L108 471L108 499" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1080)"/><rect id="SvgjsRect1082" width="25" height="16" x="95.5" y="463" fill="#ffffff"/><text id="SvgjsText1083" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="25px" fill="#323232" font-weight="400" align="top" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="461.05" transform="rotate(0)"><tspan id="SvgjsTspan1084" dy="16" x="108"><tspan id="SvgjsTspan1085" style="text-decoration:;">true</tspan></tspan></text></g><g id="SvgjsG1086" transform="translate(52.5,499)"><path id="SvgjsPath1087" d="M 0 32.5L 55.5 0L 111 32.5L 55.5 65L 0 32.5Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1088"><text id="SvgjsText1089" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="91px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="22.55" transform="rotate(0)"><tspan id="SvgjsTspan1090" dy="16" x="55.5"><tspan id="SvgjsTspan1091" style="text-decoration:;">anchor(regex)</tspan></tspan></text></g></g><g id="SvgjsG1092"><path id="SvgjsPath1093" d="M163.5 531.5L223.25 531.5L223.25 535L283 535" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1094)"/><rect id="SvgjsRect1096" width="29" height="16" x="208.75" y="525.25" fill="#ffffff"/><text id="SvgjsText1097" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="29px" fill="#323232" font-weight="400" align="top" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="523.3" transform="rotate(0)"><tspan id="SvgjsTspan1098" dy="16" x="223.25"><tspan id="SvgjsTspan1099" style="text-decoration:;">false</tspan></tspan></text></g><g id="SvgjsG1100" transform="translate(283,510)"><path id="SvgjsPath1101" d="M 16.666666666666668 0L 135.33333333333334 0C 157.55555555555554 0 157.55555555555554 50 135.33333333333334 50L 16.666666666666668 50C -5.555555555555556 50 -5.555555555555556 0 16.666666666666668 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1102"><text id="SvgjsText1103" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="132px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="15.05" transform="rotate(0)"><tspan id="SvgjsTspan1104" dy="16" x="76"><tspan id="SvgjsTspan1105" style="text-decoration:;">error(anchor)</tspan></tspan></text></g></g><g id="SvgjsG1106"><path id="SvgjsPath1107" d="M108 564L108 604L108 604L108 644" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1108)"/><rect id="SvgjsRect1110" width="25" height="16" x="95.5" y="596" fill="#ffffff"/><text id="SvgjsText1111" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="25px" fill="#323232" font-weight="400" align="top" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="594.05" transform="rotate(0)"><tspan id="SvgjsTspan1112" dy="16" x="108"><tspan id="SvgjsTspan1113" style="text-decoration:;">true</tspan></tspan></text></g><g id="SvgjsG1114"><path id="SvgjsPath1115" d="M163.5 531.5L200.75 531.5L200.75 656L238 656" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1116)"/></g><g id="SvgjsG1118" transform="translate(238,619)"><path id="SvgjsPath1119" d="M 20 0L 0 0L 0 74L 20 74" stroke="rgba(50,50,50,1)" stroke-width="2" fill="none"/><path id="SvgjsPath1120" d="M 0 0L 275 0L 275 74L 0 74Z" stroke="none" fill="none"/><g id="SvgjsG1121"><text id="SvgjsText1122" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="255px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="19.05" transform="rotate(0)"><tspan id="SvgjsTspan1123" dy="16" x="137.5"><tspan id="SvgjsTspan1124" style="text-decoration:;">strict mode:check all items</tspan></tspan><tspan id="SvgjsTspan1125" dy="16" x="137.5"><tspan id="SvgjsTspan1126" style="text-decoration:;">nomarl mode:only one</tspan></tspan></text></g></g><g id="SvgjsG1127" transform="translate(42,644)"><path id="SvgjsPath1128" d="M 20.333333333333332 0L 132 0L 111.66666666666667 61L 0 61L 20.333333333333332 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1129"><text id="SvgjsText1130" font-family="微软雅黑" text-anchor="middle" font-size="13px" width="93px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="微软雅黑" size="13px" weight="400" font-style="" opacity="1" y="20.55" transform="rotate(0)"><tspan id="SvgjsTspan1131" dy="16" x="66.3"><tspan id="SvgjsTspan1132" style="text-decoration:;">output result</tspan></tspan></text></g></g><g id="SvgjsG1133"><path id="SvgjsPath1134" d="M108 705L108 736.5L108 736.5L108 768" stroke="#323232" stroke-width="2" fill="none" marker-end="url(#SvgjsMarker1135)"/></g><g id="SvgjsG1137" transform="translate(58,768)"><path id="SvgjsPath1138" d="M 16.666666666666668 0L 83.33333333333333 0C 105.55555555555556 0 105.55555555555556 50 83.33333333333333 50L 16.666666666666668 50C -5.555555555555556 50 -5.555555555555556 0 16.666666666666668 0Z" stroke="rgba(50,50,50,1)" stroke-width="2" fill-opacity="1" fill="#ffffff"/><g id="SvgjsG1139"><text id="SvgjsText1140" font-family="&quot;Comic Sans MS&quot;" text-anchor="middle" font-size="19px" width="80px" fill="#323232" font-weight="400" align="middle" anchor="middle" family="&quot;Comic Sans MS&quot;" size="19px" weight="400" font-style="" opacity="1" y="10.15" transform="rotate(0)"><tspan id="SvgjsTspan1141" dy="23" x="50"><tspan id="SvgjsTspan1142" style="text-decoration:;">end</tspan></tspan></text></g></g></svg>

## 脚本优化

### 对多个配置文件进行优化

不同的爬虫隶属的业务模块不同,笼统地使用一个配置文件在实际使用时还需要使用者手动再按照业务划分拆开检测结果,这属于"不必要的麻烦".

所以将配置文件扩展为可以在命令行参数中指定.

### 发送邮件

仅仅生成报告还是不够,在企业中常常使用邮件来作为记录媒介.

通常不仅是脚本的执行者需要知道结果,业务的相关负责人都有这方面的需求.所以加入邮件模块.

#### 发送邮件-优化

1. 发送邮件的同时,将 xls 报告 attach
2. 优化邮件内容,直接以 html-table 发送

### 使用 _rich_ 美化输出结果

[rich](https://github.com/willmcgugan/rich) 是 python 知名的一个第三方输出模块.

通过该模块可以得到更好的 console output 体验.

## 开发过程中遇到的问题

### xlwd 直接写入 stream

#### 1. BytesStream 而非 StringStream

邮件和形成 xls 报告虽然是两种业务情况,但是在代码上存在一定的从属关系.

在将 xls 报告 attach 到邮件时,没有必要在本地生成该文件浪费存储空间.

在 [xlwt write excel sheet on the fly
](https://stackoverflow.com/questions/15649034/xlwt-write-excel-sheet-on-the-fly) 中,提到可以使用 **StringIO 模块** ,不过在实际操作时,发现 xlwt 的 steam 并不是 String 流,而是 Bytes 流,所以代码改为如下的写法.

```python
from io import BytesIO

fs = BytesIO()
workbook = xlwt.Workbook(encoding='utf-8')
workbook.save(fs)
```

#### 2. getvalue() 而非 read()

在从 fs 中读取流数据时,有些网站教程的读取方式是使用 read().在实际测试过程中,read()仅能够取出初始化 stream 时的数据,而后期 write()的数据,无法读出.

在官方文档[io — Core tools for working with streams](https://docs.python.org/3/library/io.html#io.BytesIO)中,使用的读取案例代码如下.

```python
>>> b = io.BytesIO(b"abcdef")
>>> view = b.getbuffer()
>>> view[2:4] = b"56"
>>> b.getvalue()
b'ab56ef'
```

在改用 **getvalue()** 后,成功读出数据

### rich 的 traceback

为了美化输出结果,使用了 rich 模块,将所有的 print 更改为 rich 的 print,在输出 dict 结果时,有更好的视觉体验.

这里就衍生除一个需求,对于运行出错的配置项,需要一个 traceback 来追踪错误的成因.

当配置文件中存在多个检测配置时,遇到错误就立刻抛出打印这种做法不利于我们锁定具体是那个配置除了问题.所以,这个 traceback 最好是存储在结果列表中,然后随着结果一个个输出.

但是 rich 的 traceback 并不是可以存储的对象.

```python
try:
    do_something()
except:
    console.print_exception()
```

以上是调用代码.

在查阅源码之后,发现 exception 是先被捕获到一个 TraceBack 类中,然后以这个类作为对象,再调用 print 将其输出.

于是,提取出 TraceBack 类,将其暂存到结果中.在输出函数中,判断是否检测成功,如果失败,则输出 traceback 内容.
