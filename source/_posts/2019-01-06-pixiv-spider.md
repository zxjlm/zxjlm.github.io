---
layout: post
cid: 34
title: P站爬虫v2.0
slug: 34
date: 2019/01/06 14:22:00
updated: 2019/07/20 22:13:18
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - 爬虫
  - pixiv
thumb:
thumbStyle: default
hidden: false
---

经过半个月额折腾，终于完成了 P 站爬虫 v2.0，现在可以根据关注列表来爬取关注对象的图片，唯一要做的只是输入账号密码而已。

<!-- more -->

好了，上菜~

操作环境：macOS Mojave、JupyterLab，代理支持 wireguard

```python
from selenium import webdriver
import requests
from selenium.webdriver.chrome.options import Options
import time
from requests.cookies import RequestsCookieJar
import pickle
from bs4 import BeautifulSoup
import re
import os


import json



def Download(url,name,AthorName,urlFrom,typePic):
    print("start to Down "+AthorName+name)
    headers={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",'Referer': urlFrom}
    r = requests.get(url,headers=headers)
    path="/Users/zxjsama/Pictures/pixiv/spider/"+AthorName+"/"+name+"."+typePic
    print("to",path)
    with open(path, "wb") as code:
        code.write(r.content)
    print(AthorName+name+" over")

'''
def getPicId(picUrlFromPage):
    Athor = webdriver.Chrome(options=chrome_options)
    Athor.get("https://www.pixiv.net")
    for cookie in cookies:
        Athor.add_cookie(cookie)
    #Athor.get("https://www.pixiv.net/member_illust.php?mode=medium&illust_id=72253628")
    Athor.get(picUrlFromPage)
    time.sleep(5)
    soup=BeautifulSoup(Athor.page_source,"lxml")
    re_pic="https://i.pximg.net/img-original/img/.*?_p0.jpg"
    pic_url=re.findall(re_pic,str(soup))
    id_name=soup.div.h1.text
    #print(soup)
    print(pic_url)
    print(id_name+"over")
'''

def getPicUrl(url,AthorName,headers):
    Athor = webdriver.Chrome(options=chrome_options)

    #Athor=webdriver.Chrome()
    Athor.get("https://www.pixiv.net")
    for cookie in cookies:
        Athor.add_cookie(cookie)
    #Athor.get("https://www.pixiv.net/member_illust.php?id=22124330")
    Athor.get(url)
    headers['Referer']=url             #headers
    time.sleep(1)
    soup=BeautifulSoup(Athor.page_source,"lxml")

    picModel=soup.find_all(class_="bVmoIS4")
    for a in picModel:
        #print (a)
        #x=re.findall("/\d\d\d\d/\d\d/.{,14}/",str(a))
        #print(x)
        picNameF=a.findAll(class_="sc-eHgmQL dRvHnS")
        picNameF1=str(picNameF[0].text)
        if a.span:
            countPic=0
            s=re.findall('id=\d+',str(a))
            idmun=re.findall("\d+",s[0])
            JudgeName=picNameF1+"_"+str(idmun[0])+"_0"
            path="/Users/zxjsama/Pictures/pixiv/spider/"+AthorName+"/"+JudgeName+".jpg"
            if(os.path.exists(path)):
                print(JudgeName,"has existed")
                continue

            pic_num=a.span.text
            picPageUrl="https://www.pixiv.net/member_illust.php?mode=manga&illust_id="+str(idmun[0])
            #print(picPageUrl)
            Athor.get(picPageUrl)
            time.sleep(1)
            soup_picPage=BeautifulSoup(Athor.page_source,"lxml")

            re111="https://i.pximg.net/img-master/img.+?_p\d+_master1200.jpg"
            PicUrlList1=re.findall(re111,str(soup_picPage))
            PicUrlList=set(PicUrlList1)    #去除list中的重复元素（会变序）
            #print(PicUrlList)
            #picNameF=soup_picPage.find_all(class_="sc-dAOnuy kNAdSR")
            #print(picNameF)
            #print(idmun[0])
            for pic123 in PicUrlList:
                print(pic123)
                picName=picNameF1+"_"+str(idmun[0])+"_"+str(countPic)

                countPic+=1
                try:
                    Download(pic123,picName,AthorName,picPageUrl,"jpg")
                except TimeoutError:
                    print("TimeoutError!!!")
                    continue
            #print("1111")

        else:
            s=re.findall('id=\d+',str(a))
            idmun=re.findall("\d+",s[0])
            picName=picNameF1+"_"+str(idmun[0])       #文件名
            path="/Users/zxjsama/Pictures/pixiv/spider/"+AthorName+"/"+picName+".jpg"
            if(os.path.exists(path)):
                print(picName,"has exisited")
                continue


            picPageUrl="https://www.pixiv.net/member_illust.php?mode=medium&illust_id="+str(idmun[0])
            #print(picPageUrl)
            Athor.get(picPageUrl)
            time.sleep(1)
            soup_picPage=BeautifulSoup(Athor.page_source,"lxml")

            #print(str(soup_picPage))
            re111="https://i.pximg.net/img-original/img.+?_p\d+.\w\w\w"
            re222="https://i.pximg.net/img-master/img.+?_p\d"
            PicUrlList1=re.findall(re111,str(soup_picPage))
            #PicUrlList2=re.findall(re222,PicUrlList1[0])
            #PicUrlList=PicUrlList2[0]+".jpg"
            PicUrlList=PicUrlList1[0]
            if(re.search("jpg",PicUrlList)):
                typePic="jpg"
            elif(re.search("png",PicUrlList)):
                typePic="png"
            else:
                continue
            #print(idmun)
            #print(PicUrlList1)
            #picNameF=soup_picPage.find_all(class_="sc-dAOnuy kNAdSR")
            try:
                Download(PicUrlList,picName,AthorName,picPageUrl,typePic)
            except TimeoutError:
                print("TimeoutError!!!")
                continue
    Athor.close()



def CreatFloder(id_name):
    file = "/Users/zxjsama/Pictures/pixiv/spider/"+id_name
    folder = os.path.exists(file)

    if not folder:                   #判断是否存在文件夹如果不存在则创建为文件夹
        os.makedirs(file)            #makedirs 创建文件时如果路径不存在会创建这个路径
        print ("---  new folder...  ---")
        print ("---  OK  ---")

    else:
        print ("---  There is this folder!  ---")




headers={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",'Referer': 'http://www.pixiv.net'}

chrome_options = Options()
chrome_options.add_argument("--headless")       # define headless
chrome_options.add_argument('user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"')


driver = webdriver.Chrome(options=chrome_options)

#driver = webdriver.Chrome()     # 打开 Chrome 浏览器
'''
driver.get("https://accounts.pixiv.net/login?lang=zh&source=pc&view_type=page&ref=wwwtop_accounts_index")

driver.find_element_by_xpath(u"(.//*[normalize-space(text()) and normalize-space(.)='忘记了'])[1]/following::input[1]").click()
driver.find_element_by_xpath(u"(.//*[normalize-space(text()) and normalize-space(.)='忘记了'])[1]/following::input[1]").clear()
driver.find_element_by_xpath(u"(.//*[normalize-space(text()) and normalize-space(.)='忘记了'])[1]/following::input[1]").send_keys("账号")
driver.find_element_by_xpath(u"(.//*[normalize-space(text()) and normalize-space(.)='忘记了'])[1]/following::input[2]").clear()
driver.find_element_by_xpath(u"(.//*[normalize-space(text()) and normalize-space(.)='忘记了'])[1]/following::input[2]").send_keys("密码")
driver.find_element_by_xpath(u"(.//*[normalize-space(text()) and normalize-space(.)='忘记了'])[1]/following::button[1]").click()

time.sleep(5)
#driver.close()
pickle.dump(driver.get_cookies() , open("cookies.pkl","wb"))
print("cookies over")
print(driver.page_source)
'''
req=requests.Session()
#cookies1=driver.get_cookies()
#req.headers={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",'Referer': 'http://www.pixiv.net'}
cookies = pickle.load(open("cookies.pkl", "rb"))

#关注页面
for cookie in cookies:
    req.cookies.set(cookie['name'],cookie['value'])
r=req.get("https://www.pixiv.net/bookmark.php?type=user")
headers['Referer']="https://www.pixiv.net/bookmark.php?type=user"
soup=BeautifulSoup(r.text,"lxml")
re1='/member.php/?id='
a=re.findall(re1,str(soup))
m=soup.find_all(class_="ui-layout-west")
re2='\d{5,}'
m=BeautifulSoup(str(m[0]),"lxml")
idNumber=re.findall(re2,str(m.script))      #获取关注id
for idUrl in idNumber:
    url="https://www.pixiv.net/member_illust.php?id="+str(idUrl)
    Athor = webdriver.Chrome(options=chrome_options)
    Athor.get("https://www.pixiv.net")
    for cookie in cookies:
        Athor.add_cookie(cookie)
    Athor.get(url)
    headers['Referer']=url           #headers
    time.sleep(1)
    soup=BeautifulSoup(Athor.page_source,"lxml")
    AthorName1=soup.find_all(class_="_2VLnXNk")
    AthorName=str(AthorName1[0].text)
    CreatFloder(AthorName)
    Athor.close()
    picNumber=soup.find_all(class_="sc-feJyhm eOaQTJ")
    tempa=re.findall("\d+",str(picNumber))
    pageNumMax=int(int(tempa[0])/48)
    for i in range(1,pageNumMax+2):
        url_fin=url+"&p="+str(i)
        print(url_fin)                 #至此得到关注作者的主页（包括分页
        getPicUrl(url_fin,AthorName,headers)


    print("over")

'''
driver1 = webdriver.Chrome()
driver1.get("https://www.pixiv.net")
for cookie in cookies:
    driver1.add_cookie(cookie)
driver1.get("https://www.pixiv.net/member.php?id=22124330&p=1")
driver1.find_element_by_xpath("(.//*[normalize-space(text()) and normalize-space(.)='- -'])[7]/following::div[2]").click()
soup=BeautifulSoup(driver.page_source())
print(soup)
'''

#print(r.text)
driver.headers
driver.close()
```

写的比较凌乱，等熬过了复习周再修改吧，顺便把它部署到 VPS 上~
