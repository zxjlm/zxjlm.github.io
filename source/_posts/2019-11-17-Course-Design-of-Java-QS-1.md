---
layout: post
cid: 164
title: Java课设中的问题以及解决方案(一)
slug: 164
date: 2019/11/17 09:15:00
updated: 2019/11/23 15:02:58
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

# 前言

## 开发环境

- 系统环境: macOS Catalina 10.15
- java 版本: JDK12
- 开发环境: eclipse 2019-06 (4.12.0)
- 绘图工具: notebility\Procreate

Ps.界面设计全靠手绘...

[github 上可以看到源码](https://github.com/zxjlm/TCM_analize_tools)
(预计更新时间:2019 年 11 月 18 日)

不过肯定是运行不了的啦,因为涉及到一些需要保密的东西.

# 问题以及解决

## 数据库连接问题

导入 _java.sql.Connection_ 依赖包

```java
Class.forName("com.mysql.jdbc.Driver");
			con = DriverManager.getConnection("jdbc:mysql://localhost:3306/TCM_DICT","root","root");
```

目前网络上主流的连接方式为上述语句

不过在实际操作中发现,这种语句会出现一个红色的 warning. 因为 **mysql5.6** 以上的版本要求进行 ssl 验证,所以进行如下的改动.

```java
Class.forName("com.mysql.jdbc.Driver");
			con = DriverManager.getConnection("jdbc:mysql://localhost:3306/TCM_DICT?useSSL=false","root","root");
```

加上 **useSSL=false** ,取消验证即可.

### 遗留问题

在进行 Java-SQL 连接时,进行了一些尝试,最终导致现在每次连接本地数据库都会报错(但是可以正常使用),因为不影响开发,同时也无法找到类似问题的解决方案,所以暂时搁置了,以后会考虑解决.

## Java 包管理问题

开发过程中不可避免地要用到很多的网络上的包,一开始我是一个一个下载的,体验极差.
后来转念一想,python 有 pip\conda,那么 Java 是否有对应的包管理工具呢?
一查,还真就找到了这样一个~~~

### maven

_注意:搜索排行第一页,有几篇文章(知乎\csdn)不要看,巨坑无比_

maven 其实不只是一个包管理工具啦.
具体的 maven 说明和安装使用,可以查阅[菜鸟教程的 maven 介绍](https://www.runoob.com/maven/maven-tutorial.html)

主要是以下几点:

- maven 安装
- maven 项目建立
- maven 坐标如何导入

**最终,能够通过几行 xml,完成 jar 包的导入**

下述示例为导入 fastjson 包,是否比自己下载要方便很多呢?

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.47</version>
</dependency>
```

同时,推荐一个[maven 仓库](https://mvnrepository.com),大多数的依赖包的 maven 坐标可以从中获取.

## 多线程问题

### 实现一个类似于异步进度条的功能

课设涉及到一个本地和服务器端交互过程,所以想要设计一个进度条,不然交互的那段时间(5s-1min,视用户分析的数据量决定)实在是煎熬.
预想的是类似 bash 交互,Waiting... -> success 这样.

Demo 的代码比较少,所以就直接列出来了.

参照课本上的多线程一章(明明后面有很多很重要的章节,但是竟然不讲,实在是一言难尽).

```Java
 class labelControl1 extends Thread{
	 public JLabel matrixLoder;

	 public labelControl1(JLabel matrixLoder) {
		 this.matrixLoder = matrixLoder;
	 }

	@Override
	public void run() {
		String str = "Waiting " ;
		while(true) {
			if(global_bool.laberFlag1) {
				matrixLoder.setText("success");
				break;
			}
			System.out.println("111111");
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}

			if(str.equals("Waiting ......")) {
				str = "Waiting ";
			}
			str += ".";
			matrixLoder.setText(str);
		}
	}

}
```

## csv 转 json

本来是准备 excel 转 json 的,POI 都下载好了,后来发现只是 csv 转 json 而已~再一次深刻体会到了 csv 与 excel 的差别.

核心代码:

```Java
public static String json_str(String path) throws Exception {
    	File input = new File(path);

        CsvSchema csvSchema = CsvSchema.builder().setUseHeader(true).build();
        CsvMapper csvMapper = new CsvMapper();

        List readAll = csvMapper.readerFor(Map.class).with(csvSchema).readValues(input).readAll();

        ObjectMapper mapper = new ObjectMapper();

        return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(readAll);
    }
```

返回的为符合 JSON 格式要求的 String 类型,再将它转换为 JSON 即可.

## 网络编程

### 中文乱码

编码问题是每一个非英文程序员都要经历的的噩梦吧^\_^

```Java
StringEntity entity = new StringEntity(js,Charset.forName("UTF-8"));
```

### post 请求

核心代码如下

```Java
public static String sendPost(String js,String url) throws Exception {
    	Map<String, Object> paramMap = new HashMap<String, Object>();
    	paramMap.put("data",js);

    	CloseableHttpClient httpClient = null;
        CloseableHttpResponse httpResponse = null;
        String result = "";
        // 创建httpClient实例
        httpClient = HttpClients.createDefault();
        // 创建httpPost远程连接实例
        HttpPost httpPost = new HttpPost(url);
        // 配置请求参数实例
        RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(350000)// 设置连接主机服务超时时间
                .setConnectionRequestTimeout(350000)// 设置连接请求超时时间
                .setSocketTimeout(600000)// 设置读取数据连接超时时间
                .build();
        // 为httpPost实例设置配置
        httpPost.setConfig(requestConfig);
        // 设置请求头
        httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");
        // 封装post请求参数
        if (null != paramMap && paramMap.size() > 0) {
            List<NameValuePair> nvps = new ArrayList<NameValuePair>();
            // 通过map集成entrySet方法获取entity
            Set<Entry<String, Object>> entrySet = paramMap.entrySet();
            // 循环遍历，获取迭代器
            Iterator<Entry<String, Object>> iterator = entrySet.iterator();
            while (iterator.hasNext()) {
                Entry<String, Object> mapEntry = iterator.next();
                nvps.add(new BasicNameValuePair(mapEntry.getKey(), mapEntry.getValue().toString()));
            }
            StringEntity entity = new StringEntity(js,Charset.forName("UTF-8"));
			httpPost.setEntity(entity);
        }
        try {
            // httpClient对象执行post请求,并返回响应参数对象
            httpResponse = httpClient.execute(httpPost);
            // 从响应对象中获取响应内容
            HttpEntity entity = httpResponse.getEntity();
            result = EntityUtils.toString(entity);
        } catch (ClientProtocolException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            // 关闭资源
            if (null != httpResponse) {
                try {
                    httpResponse.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (null != httpClient) {
                try {
                    httpClient.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
//        System.out.println(result);
        return result;
    }
```

本次的开发中没有用到 get 请求,不过掌握了 post 请求,那么逻辑更加简单的 get 还不是手到擒来.

## 关于全局变量

Java 的全局变量机制与 C#类似,都是访问类的静态成员变量.

所以我建立了一个 Global_pool 来维护基本全局变量.

示例:

```Java
package haru.utils;

public class global_bool {
	public static boolean laberFlag1,labelFlag2,labelFlag3;
	public static String url1 = "http://127.0.0.1:5000/admin/api/java_homework_01_matrix";
	public static String url2 = "http://127.0.0.1:5000/admin/api/java_homework_content";
	public static String url3 = "http://127.0.0.1:5000/admin/api/java_homework_pro";

	public static String url4 = "http://127.0.0.1:5000/admin/get_excel_recipe_html_java";
	public static String url5 = "http://127.0.0.1:5000/admin/get_truely_network_graph";
}

```

## macOS 如何打开网页

对于 Windows 用户来说,使用一个简单的 Desktop 类就能简单解决的问题,在 Mac 用户这里就成了问题.
找了很多的回答,所谓的万能方案,emmmm,好吧已经老得跟不上版本了.
最终,我在[stackoverFlow](https://stackoverflow.com/questions/38754219/java-how-to-open-url-with-command-on-mac)上找到了答案.
直接调用 terminal 执行命令.
啊,又打开了一扇新世界的大门(可以通过后台实现更多的功能哦).

```Java
String Command="open "+"http://google.ca";
Process Child=Runtime.getRuntime().exec(Command);
```

Ps. _runtime_ 是隶属于 _java.lang_ 的,不用下载~

## Jtable 列数太多,要实现横向的滑动

去掉自动大小变换就行了

```Java
tb.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);
```

同时,献上自己写的 json2table 的核心代码

```Java
import java.awt.BorderLayout;
import java.awt.Container;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTable;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;


public class json2table extends JFrame{
	JTable tb;
	Object a[][],b[];


	public json2table(String s1,String name) {
		JSONObject js = new JSONObject();
		js = JSON.parseObject(s1);


		HashSet<String> row =new HashSet<String>();
		List<String> cols = new ArrayList<>(js.keySet());
		List<String> rows = new ArrayList<>(js.getJSONObject(cols.get(0)).keySet());



		a = new Object[rows.size()][cols.size()];

		for (int i = 0; i < cols.size(); i++) {
			JSONObject eachcol = js.getJSONObject(cols.get(i));
			for (int j = 0; j < rows.size(); j++) {
//				System.out.println(eachcol.getString(rows.get(j)));
				a[j][i] = eachcol.getString(rows.get(j));
			}
		}

		tb = new JTable(a,cols.toArray());

		System.out.println(rows);
		System.out.println(cols);

		Container con = getContentPane();

		getContentPane().add(new JScrollPane(tb),BorderLayout.CENTER);

		tb.setAutoResizeMode(JTable.AUTO_RESIZE_OFF);

		setTitle(name);
		setSize(10000,10000);
		setVisible(true);
		validate();
		setDefaultCloseOperation(HIDE_ON_CLOSE);

	}

}
```

因为也算是半个初学者,直觉告诉我泛型的运用上还有很大的改进余地.

## 后记

- 肝疼,又是一次一个人的大作业,之所以一鼓作气写完,是因为,老实说,队友和心态问题,没啥干劲了.

---

- 现实是残酷的,但是理想必须要是美好的.
- 最我们感到目盲的，往往不是彻夜的黑暗,而是黑暗过后的第一缕光.

---

- 最后,谢谢^\_^
