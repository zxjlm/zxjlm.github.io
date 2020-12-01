---
layout: post
title: 字体反爬虫解决方案-自动化通过字体文件生成映射字典
date: 2020-12-01 09:31:55
updated: 2020-12-01 17:45:00
status: publish
author: harumonia
categories:
  - 源流清泉
  - Python
tags:
  - spider
  - antispider crack
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
thumb:
thumbChoice: default
thumbSmall:
thumbStyle: default
hidden: false
---

## 字体反爬虫

初级的字体反爬虫可以参照[字体反爬的解决方案——突破抖音反爬虫机制](https://segmentfault.com/a/1190000021631732)这边文章.

类似的文章教程不胜枚举,所以这里对于 _字体反爬虫基础_ 就不做赘述.本篇要讨论的是如何处理在多大数百、数千个自定义字体的复杂情况下完成从字体文件生成映射字典的工作.

上面提到的文章,采用的是人工映射,这在只有 0~10 这样的简单情况下自然是最方便的处理办法,但是对于大量字体的情况,就捉襟见肘了.并且,即使花了半天时间将这些字体一一映射,万一网站的字体库发生变化,或者网站本身就采用动态字体库,就很麻瓜了.

本着"花半天时间做重复性的苦力工作,不如花一天时间做创造性工作"的原则(~~预估的开发时间比较充裕,才有时间来实践这些突发的灵感~~),决定搞一些懒人方法.

<!-- more -->

## 映射 xml 文件

这里给出一个实例情况.

百度云 链接: "https://pan.baidu.com/s/16rKqDaSdN8sA-5fCAktDVA" 提取码: th84

```python
from fontTools.ttLib import TTFont

goudi_font = TTFont('gRYimlGgKp1mW5ldNU5LIoLTJdKXEnKo.ttf')
goudi_font.saveXML('font_antispider.xml')
font_map = goudi_font.getBestCmap()

newmap= {}
for index, key in enumerate(font_map):
    value = font_map[key]
    # hex() 函数用于将10进制整数转换成16进制,以字符串形式表示
    key = hex(key)
    newmap[key] = value

```

可以看到,这个实例并不像 _字体反爬的解决方案_ 这篇文章中所呈现的,可以直接在 xml 中找到映射关系这么简单.

那么接下来,就是我的工作了.

## 自动构建映射表

### 方案 1

利用[百度字体编辑器](http://fontstore.baidu.com/static/editor/index.html)将字体文件可视化.可视化的结果为规则的方块,所以这里可以考虑使用 opencv 或者 pillow 进行图像切割,将每个字体独立成一个"麻将块",然后使用百度的 ocr 接口对每个块进行识别.

#### S1. 获取 token

```python
import re
from matplotlib import pyplot as plt
import cv2
import time
import os
import base64
import requests
```

```python
# client_id 为官网获取的AK, client_secret 为官网获取的SK
host = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=[cid]&client_secret=[csrc]'
response = requests.get(host)
if response:
    print(response.json()['access_token'])
```

#### S2. 图片切块

将字体编辑器的结果截图,并将其存储为 **p1.PNG** ![p1](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/p1.PNG)

这里我选择使用 opencv 进行切分,在用 Google 开发者工具丈量之后,使用 (138,100) 作为每个块的大小.

```python
img = cv2.imread('./raw_font_pic/p1.PNG')
print('img_shap:',img.shape)
cropped = img[0:138, 400:500]
plt.imshow(cropped)
plt.show()
```

```shell
# output
    img_shap: (834, 1706, 3)
```

![png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/output_7_1.png)

#### S3. 对单个图片进行尝试

首先,选择的图片是 ![3075](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/uni3075.png)

```python
request_url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic"
# 二进制方式打开图片文件
f = open('./font_pic/uni3075.png', 'rb')
img = base64.b64encode(f.read())

params = {"image":img}
access_token = 'your_token'
request_url = request_url + "?access_token=" + access_token
headers = {'content-type': 'application/x-www-form-urlencoded'}
response = requests.post(request_url, data=params, headers=headers)
if response:
    result = response.json()
result
```

```shell
# output
    {'words_result': [{'words': '政'}, {'words': '3075'}],
     'log_id': 1333299295083823104,
     'words_result_num': 2}
```

可以看到,已经有我们需要的结果了,即,这条路是可行的.

#### S4. 构造文字识别函数

OCR 毕竟不比人工,所以对于返回的结果,需要加上一层错误处理.

首先是'error_code'.如果返回结果中出现了错误码,将错误码输出出来.这里的错误一般不是识别文字的错误,所以选择进行人工处理.在开发的过程中,遇到过一次这样的情况,原因是 QPS 太高了,于是加上了 sleep 函数.

其次是对'words_result'进行判断.根据我们切分的麻将块,返回的'words_result'必然是一个长度为 2 的列表.同时,每一张图片下面的编码都是可以确定的,我们可以用如下的代码抽取出 xml 文件中的字体编码.

```python
name_list = []
with open('./font_antispider.xml') as f:
    for foo in f.readlines():
        re_ = re.search('<GlyphID id="\d+" name="(.*?)"/>',foo)
        if re_:
            name_list.append(re_.group(1))
print(len(name_list),name_list[:10])
```

```shell
# output
    395 ['.notdef', 'uni0000', 'uni0001', 'space', 'uni3075', 'uni3116', 'uni4E41', 'uni4E67', 'uni4E82', 'uni4FE5']
```

编码的顺序与字体编辑器展示的顺序相同,所以我们在切分图片的同时,可以将图片的文件名命名为对应的字符编码,用来做 OCR 的校验工作.

于是,就有了如下的代码.

```python
def baidu_ocr(pic_path:str,verify:str):
    '''
    文字识别
    pic_path:图片的地址, 如./font_pic/uni3075.png
    verify:图片对应的校验码,如 uni3075
    '''
    request_url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic"
    # 二进制方式打开图片文件
    f = open(pic_path, 'rb')
    img = base64.b64encode(f.read())

    params = {"image":img}
    # 隐藏配置
    access_token = '24.56bd39bf2934ed3278812d639068a80e.2592000.1609298605.282335-15745908'
    request_url = request_url + "?access_token=" + access_token
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.post(request_url, data=params, headers=headers)
    if response:
        print(response.json())
        result = response.json()
        if 'error_code' in result.keys():
            print('error',pic_path,result)
        elif result['words_result_num'] == 2 and result['words_result'][1]['words'] == verify:
            return {'uni'+verify:result['words_result'][0]['words']}
        else:
            print(pic_path,result)
            return None
    return None
```

准备工作结束,接下来就是将上述代码碎片进行整合.

```python
# 读取截图文件夹 raw_font_pic 下的图片,图片的命名需要按照 p1.PNG,p2.PNG...这样的顺序,防止造成校验码的错位.
png_list = ['./raw_font_pic/'+foo for foo in os.listdir('./raw_font_pic/') if foo.endswith('PNG')]

res = []

# 100 per page
for turn,png in enumerate(png_list):
    img = cv2.imread(png)
    # 第二层和第三层的循环对应 百度字体编辑器 的 6*17 布局
    for row in range(0,6):
        for col in range(0,17):
            count = turn*100+row*17+col
            # count < 100 是因为 字体编辑器 虽然是 6*17=102 的布局,但是实际展示的只有100个字符.
#             if count < 8 and count > 5 and count < len(name_list): 测试用例
            if count < 100 and count < len(name_list):
                file_name = name_list[count]
                cropped = img[row*138:(row+1)*138, col*100:(col+1)*100]
                plt.imshow(cropped)
                plt.show()
                file_path = './font_pic/'+file_name+'.png'
                cv2.imwrite(file_path,cropped)
                res.append(baidu_ocr(file_path,file_name[3:]))
                # 睡眠以避开百度的QPS限制,这个时间可以更短
                time.sleep(0.5)

print(res)
```

![png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/output_16_0.png)

```shell
# output
    {'words_result': [{'words': '络'}, {'words': '4E41'}], 'log_id': 1333310904309121024, 'words_result_num': 2}
```

![png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/output_16_2.png)

```shell
# output
    {'words_result': [{'words': '届'}, {'words': '4E67'}], 'log_id': 1333310908155297792, 'words_result_num': 2}
```

![png](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/output_16_4.png)

```shell
# output
    {'words_result': [{'words': '文'}, {'words': '4E82'}], 'log_id': 1333310911858868224, 'words_result_num': 2}
    [{'uni4E41': '络'}, {'uni4E67': '届'}, {'uni4E82': '文'}]
```

可以看到输出的最后一行.至此,映射表完成.

### 方案 2

方案 1 是一通乱拳的尝试,本质上,这是一个半自动化的结果,其中人工截图、命名文件、修改调用等操作都是需要手动进行的,虽然人工截图可以使用 selenium 代替,其它的也有对应的代码解决方案,但是如果想要做成一个通用式的服务,开发和维护代价实在是太高了.

有没有办法跳过这些人工操作?或者使其更加简化?既然字体编辑器是通过 xml 中的坐标描述来完成字体绘制,那 Python 中自然就应该有对应的方法完成这个工作.

基于这些问题,我查阅了很多的资料,于是就有了这个对 linux 更加友好的、更加符合自动化 ~~偷懒~~ 初衷方案 2.

方案 2 的前期处理--对应于方案一的截图、命名等操作--依托于[fontforge](https://fontforge.org/en-US/),我们可以通过这个将 ttf 直接转变成 png.

#### S1. ttf2png

Linux 可以,依照[INSTALL.md](https://github.com/fontforge/fontforge/blob/master/INSTALL.md)进行安装.

Windows 可以直接去[官方网站](https://fontforge.org/en-US/)下载使用.

首先,需要写一个 python 脚本,暂且命名为 script.py.

```python
import fontforge
F = fontforge.open("gRYimlGgKp1mW5ldNU5LIoLTJdKXEnKo.ttf")
for name in F:
    filename = name + ".png"
    F[name].export(filename)
```

然后通过

```shell
fontforge -script script.py
```

即可完成 ttf -> png 的工作.结果如下.

![fontres](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/fontforceres.PNG)

真正意义上的一步到位~

#### S2. OCR

这里我们将校验的部分去掉,而编码的对应工作则通过文件名来实现.

```python
def baidu_ocr(pic_path:str):
    '''
    文字识别(百度)
    pic_path:图片的地址, 如./font_pic/uni3075.png
    '''
    request_url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic"
#     request_url = "https://aip.baidubce.com/rest/2.0/ocr/v1/webimage"
    f = open(pic_path, 'rb')
    img = base64.b64encode(f.read())

    params = {"image":img}
    # 将accessToken替换为自己的
    access_token = 'AT'
    request_url = request_url + "?access_token=" + access_token
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    response = requests.post(request_url, data=params, headers=headers)
    if response:
        time.sleep(1)
        print(pic_path,response.json())
        result = response.json()
        if 'error_code' in result.keys():
            print('error',pic_path,result)
        elif result['words_result_num'] == 1:
            return result['words_result'][0]['words']
        elif result['words_result_num'] == 0:
            return ''
        else:
            print(pic_path,result)
            return None
    return None

def tencent_ocr(pic_path):
    """
    文字识别(腾讯)
    """
    import json
    from tencentcloud.common import credential
    from tencentcloud.common.profile.client_profile import ClientProfile
    from tencentcloud.common.profile.http_profile import HttpProfile
    from tencentcloud.common.exception.tencent_cloud_sdk_exception import TencentCloudSDKException
    from tencentcloud.ocr.v20181119 import ocr_client, models
    try:
        # 将SecretId和SecretKey替换为自己的
        cred = credential.Credential("SecretId", "SecretKey")
        httpProfile = HttpProfile()
        httpProfile.endpoint = "ocr.tencentcloudapi.com"

        clientProfile = ClientProfile()
        clientProfile.httpProfile = httpProfile
        client = ocr_client.OcrClient(cred, "ap-shanghai", clientProfile)

#         req = models.GeneralAccurateOCRRequest()
        req = models.GeneralBasicOCRRequest()
        with open(pic_path,'rb') as f:
            img = base64.b64encode(f.read())
        params = {
            "ImageBase64":img.decode(),
            "LanguageType": "zh"
        }
        req.from_json_string(json.dumps(params))

#         resp = client.GeneralAccurateOCR(req)
        resp = client.GeneralBasicOCR(req)
        resp_json = json.loads(resp.to_json_string())
        time.sleep(0.1)
        return resp_json['TextDetections'][0]['DetectedText']

    except TencentCloudSDKException as err:
        print(err)

png_list = [foo for foo in os.listdir('./fontforge_output_str/') if foo.endswith('png')]

res_str_basic = {png[:-4]:tencent_ocr('./fontforge_output/'+png) for png in png_list}
```

#### 图片强化

从结果上看,识别的效果并不理想,仍然又差不多 5%没有识别出来,所以接下来就要对图片进行强化处理.

这里摘出一个很典型的无法识别\识别错误的图片

![ying](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/uni5078.png)

对于这种问题的成因,我个人的猜想是,在进行卷积处理的时候,选择的算子在边界处理上更倾向于重新计算,而实际上我们的边界是不需要计算的,所以这里手动将边界扩张.

```python
def strength_pic(pic_path):
    from PIL import Image

    old_im = Image.open(pic_path)
    old_size = old_im.size

    new_size = (300, 300)
    new_im = Image.new("RGB", new_size,color='white')   ## luckily, this is already black!
    new_im.paste(old_im, (int((new_size[0]-old_size[0])/2),
                          int((new_size[1]-old_size[1])/2)))

    new_im.save(pic_path.replace('output','output_str'))

for png in png_list:
    strength_pic('./fontforge_output/'+png)
```

结果如下:

![res_str](https://harumona-blog.oss-cn-beijing.aliyuncs.com/new_articles/goudi-font-str.PNG)

扩张之后,百度的识别结果准确率在 80%~87%,腾讯的识别准确率在 90%~95%,这种程度的准确率暂时是够用了.

#### 进一步提升准确率

为什么准确率无法更进一步?也许问题就出在我们的样本太过于简单了,纯白色边缘的清晰的单个汉字,正是由于这个场景太过于理想化了,使得商用 OCR 发生了过拟合的情况,最终导致了识别率低的结果.

TODO: 特化 OCR 模型,提高识别的准确率.

这个估计得等到目前阶段的任务结束才能开始做了.

## 总结

曾在网上看到一个鼓吹字体反爬,称之为"终极方案"的文章.我个人是不敢苟同的,信息的世界没有所谓的绝对防御,道高一尺魔高一丈而已.

通过这篇文章所阐述的思路,可以完成绝大多数情境下的字体反爬虫,毕竟字体再怎么变形,终究是给人看的.最后提到的特化 OCR 模型,在实际的大规模业务中非常必要,因为这不仅能提高字体识别的正确率,更加能将破解的成本(无论时间还是资金)降到最低.

以上.
