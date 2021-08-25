---
title: Poirot 开发记录(2) - 字体抽取和OCR的优化方案
date: 2021-08-25 21:27:55
tags:
---

承接前面两篇, [字体反爬虫解决方案](https://blog.harumonia.moe/font-antispider-cracker/) 和 [进度条方案](https://blog.harumonia.moe/poirot-development-progressbar/), 本篇是对旧版本的 Poirot 部分内容的性能优化.

主要优化内容为:

- 使用 `Pillow` 从字体文件中抽取出字形图片
- 使用 `Tesseract` 进行 OCR 识别

当然还有一些细枝末节的优化, 如 socketio 的版本升级等, 这其中又遇到了一些小问题, 会在文末一并总结.

<!-- more -->

## 字形图片抽取

在上一篇中, 笔者对 **fontforge** 抽取优化为 **reportlab** , 将调用 _command line interface_ 变更为完全从 Python 代码实现, 不过仍然没有解决需要进行一次图片读写的问题.

另外, 如果想要避免读写, 使用 reportlab 进行图片性质转换, 可以将 reportlab 的实例转变为 pillow 的实例, 但是这些性质转换的过程中, 依然会产生很多不必要计算开支.

这次在接触了 pillow 之后, 忽然发现可以通过这个工具包里面的 ImageFont 对象来实现完全的\高效的流式操作, 省略到 io 带来的性能损耗. 如果不需要对字体文件进行存储备份的话, 那么到这里所有的文件相关的操作就都变成了在程序内部流转了.

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
    img = Image.new('1', (img_size, img_size), 255)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(font, int(img_size * 0.7))

    txt = chr(txt)
    x, y = draw.textsize(txt, font=font)
    draw.text(((img_size - x) // 2, (img_size - y) // 2), txt, font=font, fill=0)
    return img   # 如果需要将图片存储到本地, 那么直接调用 img 实例的 save( path:str ) 方法即可


filename = ''  # 字体文件的路径信息
f = TTFont(filename)
for i in f.getBestCmap():
    # 每个pil对应字体文件中的一个字形
    pil = uni_2_png_stream(i, filename, 100)
```

由于最终得到的直接就是一个 pillow 实例, 所以如果需要对图像进行增强等操作的话, 直接对该实例进行处理即可.

## OCR 识别优化

在过去的版本里面, Poirot 使用的是基于 [chineseocr_lite](https://github.com/ouyanghuiyu/chineseocr_lite) 的本地 ocr 服务, 不过该服务的识别效率太低, 准确的说, 有识别过程中占用的性能太高\ 配置太过于繁琐等缺点.

这次将会使用更为高效的 **Tesseract** 作为本地 OCR 的升级方案, 更准确地说是使用 [pytesseract](https://pypi.org/project/pytesseract/).

具体的安装流程可以参考官方给出的文档, 需要先安装 _Tesseract_ 服务, 然后才能正常使用. Windows 直接上安装包, linux 直接使用 apt\yum 进行以来安装即可.

需要注意的一点就是, Windows 在使用 pytesseract 时, 需要先配置环境变量, 或者, 加入 `pytesseract.pytesseract.tesseract_cmd = r'C:\{安装服务的路径}\Tesseract-OCR\tesseract.exe'` 声明 Tesseract 的命令行路径, 其它系统则无需这样的操作.

可以简化为如下的代码.

```python
if os.sys.platform == 'win32':
    pytesseract.pytesseract.tesseract_cmd = r'C:\{安装服务的路径}\Tesseract-OCR\tesseract.exe'
text = pytesseract.image_to_string(image, lang='chi_sim')
```