---
layout: post
title: Mori Kokoro 开发过程中遇到的问题(2) 以及使用代码收集
date: 2020-11-10 10:52:26
updated: 2020-11-19 17:03:26
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
email: zxjlm233@gmail.com
---

## 前言

距离 Mori v0.1 成形已经过了一周.这一周里面对这个代码进行了进一步的优化.

在 [Mori Kokoro 开发记录](https://blog.harumonia.moe/mori-kokoro/) 中已经对上个阶段开发中遇到的问题进行了一次汇总.本篇是对本阶段的问题的汇总.

另外.将一些实用的代码摘出.并进行注释说明.

![mori](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/mori.gif)

<!-- more -->

## 遇到的问题

### 关于 requests 的 hooks

Mori 中使用 hook 主要是用来进行时间统计.

在 requests 的 response 中已经存在的请求时间统计.代码如下.

```python
# Start time (approximately) of the request
start = preferred_clock()

# Send the request
r = adapter.send(request, **kwargs)

# Total elapsed time of the request (approximately)
elapsed = preferred_clock() - start
r.elapsed = timedelta(seconds=elapsed)
```

可以发现.这里仅仅统计了请求所花费的时间.但是我们需要的不仅仅是这个时间.而是从开始处理(包括 post-data 的渲染等)到请求结束的时间.

#### 为什么使用 hooks

在 [Event Hooks](https://2.python-requests.org/en/master/user/advanced/#id8) 中.给出将 hooks 应用于 requests.get()以及 Session()两种示例.这两种情况不能一概而论.get()是一次性的.而 Session()是持续的.实际上就是 _是否需要对请求的每一个 url 使用 hooks 处理_ 的这样一个问题.不过文档并没有解决我们的问题--为什么(或者说.什么情况下)使用 hooks?

而在 StackOverflow 的[Python Requests: Hook or no Hook?](https://stackoverflow.com/questions/17773028/python-requests-hook-or-no-hook)中给出了很具有参考价值的回答.

> Hooks should really therefore only be used to drive behaviours that will make things more predictable, not less. For example, Requests uses them internally to handle 401 responses for various kinds of authentication.

同样.在阅读了源码之后.我个人对于 hooks 的用法作出了一些简单的总结.

- 仅仅对请求成功的 response 进行处理
- 从设计的角度来看.这个处理是隐式的
- 可以将 hooks 与 session 绑定.来实现不同情况下的 response 处理
- hooks 如果存在返回值.那么这个返回值将会取代 response > hooks.py line 32~33

### 关于脚本中的重试

这是问题实际上是要在重试次数和高效爬取之间做出一个取舍.

从实际的情况出发.

如果在爬虫的代码中.考虑到了网站的不稳定性.从而进行了多段重试.那么.在 api 的检测中最好也要进行多段的重试.否则就会出现爬虫获取到了数据.但是检测脚本报 api 失效的情况.当然.这种情况是概率性的.如果服务端不稳定.那么无论如何增加重试次数.都会有不一致的情况出现.

而如果代码中就没有进行重试.那么脚本的重试就显得画蛇添足了.

### xlwt 的列宽问题

这里的列宽与在 excel 右击 column 所显示的列宽不同.

在[Widths & Heights with xlwt + Python](https://buxty.com/b/2011/10/widths-heights-with-xlwt-python/) 找到了解答.

> Columns have a property for setting the width. The value is an integer specifying the size measured in 1/256 of the width of the character ‘0’ as it appears in the sheet’s default font. xlwt creates columns with a default width of 2962, roughly equivalent to 11 characters wide.

也就是说：xlwt 中列宽的值表示方法：默认字体 '0' 的 1/256 为衡量单位.默认宽度值是 2960.大约是 11 个字符的宽度.

在实际的使用中.我是用的是 256\*40+180 这种计算方法.得到的更接近于 40 个字符的宽度.

## 摘出常用代码

### 邮件发送

```python
def send_mail(receivers: list, file_content, html, subject, mail_host, mail_user, mail_pass, mail_port=0):
    """
    发送邮件
    配置信息见README
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    sender = mail_user
    message = MIMEMultipart()
    message['From'] = sender
    message['To'] = ';'.join(receivers)
    message['Subject'] = subject

    if html:
        message.attach(MIMEText(html, 'html', 'utf-8'))

    part = MIMEText(file_content.getvalue(), "vnd.ms-excel", 'utf-8')
    part.add_header('Content-Disposition', 'attachment',
                    filename=f'{subject}.xls')
    message.attach(part)

    for count in range(4):
        try:
            if mail_port == 0:
                smtp = smtplib.SMTP()
                smtp.connect(mail_host)
            else:
                smtp = smtplib.SMTP_SSL(mail_host, mail_port)
            smtp.ehlo()
            smtp.login(mail_user, mail_pass)
            smtp.sendmail(sender, receivers, message.as_string())
            smtp.close()
            break
        except Exception as _e:
            print(_e)
            if count == 3:
                raise Exception('failed to send email')
```

### 将二维数组变成 html-table

在发送邮件时.邮件的内容可以是 html.所以将报表的结果变为 html-table.更方便查看.

```python
    def generate_table(self):
        th = ''
        for value in self.headers:
            th += f'<th style="border:1px solid">{value}</th>'
        thead = f'<thead style="background-color:gray;">{th}</thead>' # 表头的底色变为灰色
        tbody = ''
        for result in self.results:
            tr = ''
            for header in self.headers:
                tr += f'<td style="border:1px solid">{result[header]}</td>'
            if result['check_result'] != "OK":    # 判断结果是否是'OK',如果不是,则该行变为红色
                tbody += f'<tr style="color:red">{tr}</tr>'
            else:
                tbody += f'<tr>{tr}</tr>'
        return f'<p>Mori Result</p><table style="border:1px solid">{thead}{tbody}</table>'
```
