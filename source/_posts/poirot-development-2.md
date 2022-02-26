---
title: Poirot 开发记录(2) - 字体抽取和OCR的优化方案
status: publish
author: harumonia
noThumbInfoStyle: default
outdatedNotice: 'no'
reprint: standard
thumbChoice: default
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
date: 2021-08-25 21:27:55
categories:
  - 源流清泉
  - Python
tags:
  - spider
customSummary:
thumb:
thumbDesc:
thumbSmall:
---


承接前面两篇, [字体反爬虫解决方案](https://blog.harumonia.moe/font-antispider-cracker/) 和 [进度条方案](https://blog.harumonia.moe/poirot-development-progressbar/), 本篇是对旧版本的 Poirot 部分内容的性能优化.

主要优化内容为:

- 使用 `Pillow` 从字体文件中抽取出字形图片
- 使用 `Tesseract` 进行 OCR 识别

~~当然还有一些细枝末节的优化, 如 socketio 的版本升级等, 这其中又遇到了一些小问题, 会在文末一并总结.~~

<!-- more -->

## 字形图片抽取

在上一篇中, 笔者对 **fontforge** 抽取优化为 **reportlab** , 将调用 _command line interface_ 变更为完全从 Python 代码实现, 不过仍然没有解决需要进行一次图片读写的问题.

另外, 如果想要避免读写, 使用 reportlab 进行图片性质转换, 可以将 reportlab 的实例转变为 pillow 的实例, 但是这些性质转换的过程中, 依然会产生很多不必要计算开支.

这次在接触了 pillow 之后, 忽然发现可以通过这个工具包里面的 ImageFont 对象来实现完全的\高效的流式操作, 省略到 io 带来的性能损耗. 如果不需要对字体文件进行存储备份的话, 那么到这里所有的文件相关的操作就都变成了在程序内部流转了.

并且, 由于最终得到的直接就是一个 pillow 实例, 所以如果需要对图像进行增强等操作的话, 直接对该实例进行处理即可.

主要依靠的代码如下.

```python
from fontTools.ttLib import TTFont
from PIL import ImageFont, Image, ImageDraw


def uni_2_png_stream(txt: str, font: str, img_size=512):
    """将字形转化为图片流

    Args:
        txt (str): 图片标志信息, 从 TTFont.getBestCmap() 获得
        font (str): 字体文件名
        img_size (int, optional): [description]. Defaults to 512.

    Returns:
        一个 pillow 图片对象.
    """
    img = Image.new('1', (img_size, img_size), 255)  # (1)
    draw = ImageDraw.Draw(img)   #  (2)
    font = ImageFont.truetype(font, int(img_size * 0.7))   #  (3)

    txt = chr(txt)
    x, y = draw.textsize(txt, font=font)  #  (4)
    draw.text(((img_size - x) // 2, (img_size - y) // 2), txt, font=font, fill=0)   # (5)
    return img   # 如果需要将图片存储到本地, 那么直接调用 img 实例的 save( path:str ) 方法即可


filename = ''  # 字体文件的路径信息
f = TTFont(filename)
for i in f.getBestCmap():
    # 每个pil对应字体文件中的一个字形
    pil = uni_2_png_stream(i, filename, 100)
```

### 代码解读

line (1) : 创建一个模式为1的(1-bit pixels, black and white, stored with one pixel per byte), 大小为 img_size * img_size的, 纯白色图片.
line (2) : ImageDraw 模块能够对图片进行简单的操作, 这里通过 .Draw() 方法将上面创造的图片实例化为可以调用 ImageDraw 方法进行操作的对象.
line (3) : ImageFont 模块能够存储 _位图字体( bitmap fonts )_ , .truetype() 方法则能够从 _文件_ 或者 _类文件对象( file-like object )_ 中加载 [TrueType](https://zh.wikipedia.org/wiki/TrueType) 或者 [OpenType](https://zh.wikipedia.org/wiki/OpenType) 的字体, 对于该 module 的更多详细说明可以参照 [ImageFont 文档](https://pillow.readthedocs.io/en/stable/reference/ImageFont.html).
line (4) : 从字体文件中获取对应字形的大小.
line (5) : `(img_size - x) // 2` 是为了让绘制的字体处于图像的中央, 通过修改这对参数, 能够指定绘制字形的坐标.

最后, 将这个画布图片返回, 类型为Image.

## OCR 识别优化

在过去的版本里面, Poirot 使用的是基于 [chineseocr_lite](https://github.com/ouyanghuiyu/chineseocr_lite) 的本地 ocr 服务, 不过该服务的识别效率太低, 准确的说, 有识别过程中占用的性能太高\ 配置太过于繁琐等缺点.

这次将会使用更为高效的\输出更为友好的 **Tesseract** 作为本地 OCR 的升级方案, 更准确地说是使用 [pytesseract](https://pypi.org/project/pytesseract/).

### 安装

具体的安装流程可以参考官方给出的文档, 需要先安装 _Tesseract_ 服务, 然后才能正常使用. Windows 直接上安装包, linux 直接使用 apt\yum 进行以来安装即可.

安装完本体之后, 还要手动下载一下语言包, 默认是不提供简体中文的. 所以需要下载 _chi-smi_ (chinese-simplified) 这个标识的语言包.

在windows中, 需要手动将该语言包放入 Tesseract 的路径下, 而在ubuntu中, 虽然说可以使用  `apt install tesseract-ocr-chi-smi` 进行安装, 不过最终还是提示 _未找到对应的语言包_ , 最终依然是手动下载之.

### 使用

需要注意的一点就是, Windows 在使用 pytesseract 时, 需要先配置环境变量, 或者, 加入 `pytesseract.pytesseract.tesseract_cmd = r'C:\{安装服务的路径}\Tesseract-OCR\tesseract.exe'` 声明 Tesseract 的命令行路径, 其它系统则无需这样的操作.

可以简化为如下的代码.

```python
# 判断平台是否为windows, 如果是, 则手动指定tesseract的路径
if os.sys.platform == 'win32':
    pytesseract.pytesseract.tesseract_cmd = r'C:\{安装服务的路径}\Tesseract-OCR\tesseract.exe'
text = pytesseract.image_to_string(image, lang='chi_sim')
```

#### 单个字符的识别

如上的代码在实际识别字体图片时效果并不算好, 原因是 Tesseract 默认是多字符识别模式, 比如 **嬴** 这个字, 会被拆分成多个字, 这里就需要手动进行配置约束, 使用单字符识别模式, 也即:

```python
text = pytesseract.image_to_string(image, lang='chi_sim', config='--psm 10')
```

`text` 对象可能包含诸如 `\x0` 之类不太友好的后缀, 可以使用 `.strip()` 进行去除.

#### Docker 配置更新

使用 `python:3.6` 镜像的话, 由于该镜像是简化之后的版本, 如果需要安装tesseractor, 则需要进行一次 `update` 操作.

```shell
RUN apt-get clean \
  && apt-get update -y \
  && apt-get -y install tesseract-ocr \
  && apt-get install -y libtesseract-dev \
  && apt-get -y install tesseract-ocr-chi-sim
```

这一步对于国内的用户来说可能过于痛苦, 所以在运行该命令之前可以先替换为国内的镜像源.

```shell
RUN sed -i s@/deb.debian.org/@/mirrors.aliyun.com/@g /etc/apt/sources.list
```

## 总结

至此, 本地识别模式的切换, 其中最关键的技术已经完成, 相较于之前的版本, 这一版在识别流程的性能上进行了非常大的优化.

接下来的优化方向将会集中在代码结构和使用友好等方面.
