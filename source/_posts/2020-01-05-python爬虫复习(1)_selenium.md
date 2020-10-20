---
layout: post
cid: 198
title: python爬虫复习(1) selenium
slug: 198
date: 2020/01/05 19:49:45
updated: 2020/01/05 19:49:45
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - spider
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

## 写在前面

selenium 虽然是新手友好型的爬虫工具，但是个人觉得绝对不是适合新手入门的爬虫。
推荐在了解了 **requests 体系** 的爬虫，有了爬虫的一些常识之后，再来看 selenium。

**事实上，requests 体系的爬虫已经足够满足现阶段大多数网站的爬虫需求**

<!-- more -->

## 关于 Selenium

Selenium 诞生于 2014 年，创造者是 ThoughtWorks 公司的测试工程师 Jason Huggins。创造 Selenium 的目的就是做自动化测试，用以检测网页交互，避免重复劳动。
这个工具可以用来自动加载网页，供爬虫抓取数据。

[官方文档](https://www.seleniumhq.org/docs/)

### 安装

1. 从[这里](http://chromedriver.chromium.org/downloads)下载 chromedriver
   注意：与目前正在使用的 Chrome 版本相一致
   补充：对于 macOS 用户，可以把该文件放到 **/usr/local/bin/** 目录下，可以省去一些的配置烦恼
2. pip install selenium

### 使用

1. 设置配置
   option = webdriver.ChromeOptions()
   option.add_argument('headless')
2. 添加驱动
   driver = webdriver.Chrome(chrome_options=option)

## 牛刀小试

```python
# 与百度首页交互

from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

option = webdriver.ChromeOptions()
# option.add_argument('headless')

# 要换成适应自己操作系统的chromedriver
driver = webdriver.Chrome(chrome_options=option)


url = 'https://www.baidu.com'

# 打开网站
driver.get(url)

# 打印当前页面标题
print(driver.title)

# 在搜索框中输入文字
timeout = 5
search_content = WebDriverWait(driver, timeout).until(
    # lambda d: d.find_element_by_xpath('//input[@id="kw"]')
    EC.presence_of_element_located((By.XPATH, '//input[@id="kw"]'))
)
search_content.send_keys('python')

import time
time.sleep(3)

# 模拟点击“百度一下”
search_button = WebDriverWait(driver, timeout).until(
    lambda d: d.find_element_by_xpath('//input[@id="su"]'))
search_button.click()

# 打印搜索结果
search_results = WebDriverWait(driver, timeout).until(
    # lambda d: d.find_elements_by_xpath('//h3[@class="t c-title-en"] | //h3[@class="t"]')
    lambda e: e.find_elements_by_xpath('//h3[contains(@class,"t")]/a[1]')
)
# print(search_results)

for item in search_results:
    print(item.text)

driver.close()
```

    /usr/local/Caskroom/miniconda/base/envs/scikit/lib/python3.7/site-packages/ipykernel_launcher.py:13: DeprecationWarning: use options instead of chrome_options
      del sys.path[0]


    百度一下，你就知道
    python每天免费网上学习python
    Welcome to Python.org
    Python_百度百科
    Python 基础教程 | 菜鸟教程
    Download Python | Python.org
    Python教程 - 廖雪峰的官方网站
    Python_官方电脑版_华军纯净下载
    我们生活在“Python时代”
    Python 简介 | 菜鸟教程
    Python - 知乎
    Python基础教程,Python入门教程(非常详细)
    英特尔_Python_发行版
    唤境_不懂编程不会美术_也能轻松制作游戏
    免费全能的宝塔Linux面板_一键管理服务器

### 页面交互方法

```python
# 查找元素：
element = driver.find_element_by_id("passwd-id")
element = driver.find_element_by_name("passwd")
element = driver.find_element_by_xpath("//input[@id='passwd-id']")

# 输入文字：
element.send_keys("some text")

# 点击
element.click()

# 动作链
from selenium.webdriver import ActionChains
action_chains = ActionChains(driver)
action_chains.drag_and_drop(element, target).perform()

# 在页面间切换
window_handles = driver.window_handles
driver.switch_to.window(window_handles[-1])

# 保存网页截图
driver.save_screenshot('screen.png')
```

### 定位元素

```python
# 查找一个元素
find_element_by_id
find_element_by_name
find_element_by_xpath
find_element_by_link_text
find_element_by_partial_link_text
find_element_by_tag_name
find_element_by_class_name
find_element_by_css_selector

# 查找多个元素
find_elements_by_name
find_elements_by_xpath
find_elements_by_link_text
find_elements_by_partial_link_text
find_elements_by_tag_name
find_elements_by_class_name
find_elements_by_css_selector

# 通过id定位

<html>
 <body>
  <form id="loginForm">
   <input name="username" type="text" />
   <input name="password" type="password" />
   <input name="continue" type="submit" value="Login" />
  </form>
 </body>
<html>

login_form = driver.find_element_by_id('loginForm')

# 通过name定位

<html>
 <body>
  <form id="loginForm">
   <input name="username" type="text" />
   <input name="password" type="password" />
   <input name="continue" type="submit" value="Login" />
   <input name="continue" type="button" value="Clear" />
  </form>
</body>
<html>

username = driver.find_element_by_name('username')
password = driver.find_element_by_name('password')

# 通过链接文本定位

<html>
 <body>
  <p>Are you sure you want to do this?</p>
  <a href="continue.html">Continue</a>
  <a href="cancel.html">Cancel</a>
</body>
<html>

continue_link = driver.find_element_by_link_text('Continue')
continue_link = driver.find_element_by_partial_link_text('Conti')

# 通过标签名定位

<html>
 <body>
  <h1>Welcome</h1>
  <p>Site content goes here.</p>
</body>
<html>

heading1 = driver.find_element_by_tag_name('h1')

# 通过类名定位

<html>
 <body>
  <p class="content">Site content goes here.</p>
</body>
<html>

content = driver.find_element_by_class_name('content')

# 通过CSS选择器定位

<html>
 <body>
  <p class="content">Site content goes here.</p>
</body>
<html>

content = driver.find_element_by_css_selector('p.content')

# 两个私有方法
from selenium.webdriver.common.by import By

driver.find_element(By.XPATH, '//button[text()="Some text"]')
driver.find_elements(By.XPATH, '//button')

By后面可以用来定位的属性
ID = "id"
XPATH = "xpath"
LINK_TEXT = "link text"
PARTIAL_LINK_TEXT = "partial link text"
NAME = "name"
TAG_NAME = "tag name"
CLASS_NAME = "class name"
CSS_SELECTOR = "css selector"

# 推荐使用xpath定位
username = driver.find_element_by_xpath("//form[input/@name='username']")
username = driver.find_element_by_xpath("//form[@id='loginForm']/input[1]")
username = driver.find_element_by_xpath("//input[@name='username']")

# 推荐使用链接文本定位
continue_link = driver.find_element_by_link_text('Continue')
continue_link = driver.find_element_by_partial_link_text('Conti')
```

#### 关于元素的定位

推荐使用 [katalon](https://www.katalon.com/) ，该软件开启之后，可以记录浏览器的点击记录，进而一键生成 selenium 模拟点击的代码

<hr>
同时，通过浏览器的元素审查功能，在要定位的元素上右键，大部分浏览器都有直接复制xpath的功能

## 个人使用体会

优点：

- 新手友好，操作方便
- 天生适合爬取动态加载的页面
- 截图功能非常强大
- cookies 的存取十分方便,与 requests 搭配堪称邪教

缺点：

- 初始安装过程繁杂
- 速度慢，效率低
- 内存占用大

## For Tsat
