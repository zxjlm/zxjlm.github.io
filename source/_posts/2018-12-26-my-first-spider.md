---
layout: post
cid: 32
title: 我的第一只爬虫= =
slug: 32
date: 2018/12/26 09:20:00
updated: 2018/12/26 09:20:34
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - Python
  - 爬虫
  - 入门
thumb:
thumbStyle: default
hidden: false
---

基于参考资料《Python 网络爬虫从入门到实践》改编而成的用于爬取 typecho 框架下 handsome 主题的主标题信息的爬虫代码。

<!-- more -->

```py
#用于爬取typecho框架下handsome主题的主标题信息
#Author：harumonia

import requests
from bs4 import BeautifulSoup

def get_movies():
    headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    }
    movie_list1 = []
    #movie_list2 = []

    for i in range(1,10):
        link = 'https://www.moerats.com/page/' + str(i)+'/'
        r = requests.get(link, headers=headers, timeout= 10)
        print (str(i),"页响应状态码:", r.status_code)

        soup = BeautifulSoup(r.text, "lxml")
        div_list1 = soup.find_all('div', class_='post-meta wrapper-lg')
        #div_list2 = soup.find_all('div', class_='bd')

        for each in div_list1:
            movie = each.h2.a.text.strip()
            #print(each.a.span.next_sibling.next_sibling.text)
            movie_list1.append(movie)
        '''
        for each in div_list2:
            director=each.p.text.strip()
            movie_list2.append(director)
        '''
    return movie_list1

movies = get_movies()
for i in movies:
    print (i,end='\n')
#print (movies2)
```
