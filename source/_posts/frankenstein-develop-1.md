---
title: Frankenstein开发记录(1)
tags:
  - dailyTools
author: harumonia
categories:
  - 源流清泉
  - Python
noThumbInfoStyle: default
outdatedNotice: 'no'
thumbChoice: default
thumbStyle: default
hidden: false
date: 2021-03-02 17:46:30
customSummary:
thumb:
thumbSmall:
---


`Frankenstein` 是用来搜索可用数据源的一个小工具,它包含两个主要功能

1. 友链扫描
2. 关键字扫描

这两个部分本质上都是对现存的数据源进行遍历搜索,区别在于二者的扫描侧重点不同.

本篇主要是 **友链扫描** 的开发记录.

<!-- more -->

友链扫描的基础网站选择的是 [生态环境部](http://www.mee.gov.cn/) 的网站,基础目标是找到所有省、地级市的生态环境数据源,最终目标是开发出具有泛化能力的友链扫描工具.

整个脚本的开发主要划分为3个阶段.

1. 分析
2. 开发(设计)
3. 归总

## 分析

分析的第一步是需求分析.本篇的需求在开头就已经有所描述.

在明确了需求之后,开始分析项目的可行性,即,如何达成这个需求；需要怎样的技术框架、时间成本等

最后,确认项目主体流程能够走通,就开始进行一些技术细节的分析.

### 技术分析

网站群存在一些特性,比如网站的友链分布特征,链接的命名特征等.

具体来讲,就是我所需要的 *环境保护* 数据源友链都在某一个`a|li|option`标签群组中,并且名字中都会带有*环保*等标识字段.其中,前者是大部分友链的共性特征(可泛化),后者是该任务的独有特征(不可泛化).

除此之外,友链还有其他的特征,比如 **域名不同** 等.

根据这些特性,我们可以制作出一系列的 `过滤器` . 过滤器的价值在于能够使用更少的请求次数获得同等价值的数据,简言之,提高爬虫的命中率.在这次的项目中,如果不使用这些过滤器,总共需要大约3万次的请求,得到的有效结果是447条,而使用这些过滤器之后总共的请求次数只需要4000+而已.

在完成了这些分析之后,就可以开始下一步的开发设计了.

## 开发(设计)

开发阶段又可以细分为几个步骤.

1. 整体设计,特征抽取
2. 对分析阶段得到的各种特性进行代码层面的抽象
3. 遍历算法
4. 深度过滤

### 整体设计

这个项目可以划分为一下几个模块.

#### 动态页面请求模块

页面请求模块所负责的内容是 **获取整个页面的内容** ,这里之所以强调 *整个页面* ,是因为有些网站存在 动态加载 ,简单的url请求是无法获取到页面的全部数据的.

这一类的典型是 [江苏生态环境厅](http://hbt.jiangsu.gov.cn/), 抓包后可以发现,它的友链是从 "http://hbt.jiangsu.gov.cn/col/col3603/index.html" 这个链接动态加载的.如果只进行简单请求,那么很容易就得出 *这个网站没有友链* 这样错误的结论.

爬虫方面,解决动态加载的方法有很多,我所选择的是 `Selenium`. 在等待页面完全加载之后,进行页面内容的解析.

#### 简单页面请求模块

区别于[前者](#动态页面请求模块),这个模块就是简单的url请求(requests),但是封装了代理等请求机制.考虑到可以在之后的并行工具 -- **站点扫描工具** 中复用,将其独立为一个模块.

#### 过滤器组

过滤器组在扫描的同时对获取到的url进行过滤,留下符合条件的url进行下一轮的爬取.

同时,过滤器组的设计需要考虑如下问题.

1. 过滤器是否存在顺序关系？什么样的顺序性能最优？
2. 过滤器是否存在泛用性？

强调顺序,是因为不同的过滤器有不同的时间复杂度,按照复杂度由低到高的顺序排列,将会得到理论上的性能最优解.

而泛用性上,我们可以将具有泛用性的过滤器保存下来,并封装到对象中；而不具备泛用性的,可以直接扔到一个外部的 `utils.py` 这样的工具文件中,或者不做保留.

#### 遍历模块

遍历模块对基础url进行DFS,同时,它还有调度两个请求模块和过滤器模块的职责.

#### 子模块

子模块按需构建,这里我构建了一个模块用来根据行政区划来将扫描的结果归档为excel,不过子模块中的模块组显然不具备 *泛用性*,所以这里不做讨论 .

### 代码抽象

分析阶段我们抽取出一系列的网站特性,并初步设计了过滤器组.这里通过代码实现过滤器组.

#### 节点过滤器

节点过滤器用来筛选出所有的外链.

外链的特征:

- 必然是 `a` or `option` 标签
- 必然 **跨域**
- URI长度限定

节点过滤器可以嵌入到 `BeautifulSoup` 的 `find()` 函数中.

```python
    def __fixed_filter(self, tag):
        def a_tag_checker():
            href = tag.attrs.get('href', '')
            if not href:
                return False
            if get_domain(href) in self.exist_domain_groups:
                return False
            return href.startswith(
                'http') and self.domain not in href and '?' not in href and len(
                re.findall('/', href)) <= MAX_URI

        def option_tag_checker():
            href = tag.attrs.get('value', '')
            if not href:
                return False
            if get_domain(href) in self.exist_domain_groups:
                return False
            return href and href.startswith('http') and self. \
                domain not in href and len(re.findall('/', href)) <= MAX_URI \
                   and '?' not in href

        tag_check_res = a_tag_checker() if tag.name == 'a' \
            else option_tag_checker()
        return tag_check_res and len(tag.text) > 1
```

#### 群组过滤器

群组过滤器用来过滤孤立的节点.友链一般是一群具有相同父节点的节点集群.

```python
    def __float_filter_parents_tag(self):
        parent_tag_dict = {}
        tmp_list = []
        for tag in self.tag_list:
            if tag.parent.name == 'li':
                hash_ = tag.parent.parent.text.__hash__()
            else:
                hash_ = tag.parent.text.__hash__()
            if hash_ in parent_tag_dict:
                parent_tag_dict[hash_].append(tag)
            else:
                parent_tag_dict[hash_] = [tag]
        for k, v in parent_tag_dict.items():
            if len(v) >= MIN_PER_TAG_GROUP:
                tmp_list += v
        self.tag_list = tmp_list
```

#### 黑名单过滤

白名单过滤会将 **在顶级域名黑名单内的域名** 滤出. 这个白名单是由开发者自己指定,一般是用在第一次过滤结束之后,一些难以根据代码规则滤出的url,我们可以手动添加进黑名单中,这样以后跑的时候就不用再受这些坏链接的困扰了.

```python
    def __float_filter_domain_suffix(self):
        if not self.domain_suffix:
            return

        result_list = []
        for tag in self.tag_list:
            url = self.__get_url_from_tag(tag)
            if re.search(r'(\d+\.\d+\.\d+\.\d+)', url):
                result_list.append(tag)
            domain_re = re.search(r'https?://.*?\.(\w+)/.*', url + '/')
            if domain_re:
                domain_suffix = domain_re.group(1)
                if domain_suffix in self.domain_suffix:
                    result_list.append(tag)

        self.tag_list = result_list
```

#### 后缀过滤器

我们需要的只是 **网页** , 而 *图片、css、js甚至是exe* , 这些都没有实际价值, 反而会严重拖慢我们的扫描速度.

这里我根据爬取的记录加入了一些后缀, **并不全面哦** .

```python
    def __core_filter(self):

        normal_suffix = ['.html', '.asp', '.php', '.cgi', '.jsp']
        invalid_suffix = ['.exe', '.pdf', '.xls', '.xlsx', '.doc',
                          '.docx', '.txt', '.png', '.jpg', '.jpeg']

        def tag_suffix_checker(tag):
            for foo in invalid_suffix:
                if tag.attrs.get('href', '').endswith(foo):
                    return False
            return True

        return [foo for foo in self.tag_list if tag_suffix_checker(foo)]
```

#### etc

以上列出一部分的过滤器,更多的过滤器可以根据实际情况进行开发、添加.

### 遍历算法

常见的遍历算法,**DFS** 和 **BFS** .遍历算法需要根据实际的链路来考虑.如,是否是有限深度？链路的重复率如何？等等.

### 深度过滤

与过滤器组不同,深度过滤是对遍历结束之后的结果进行再过滤.与其说是 **过滤**,或许称之为 **数据清洗** 更好一点.

我们无法保证扫描到的结果 100% 满足我们的需求,这时候就根据得到的数据集再写一套清洗规则.这套规则不会用在遍历的过程中,因为很可能会导致爬取规则出现 **过拟合** 的情况,将符合条件的链接也过滤掉了.

深度过滤是人工干预因素最为浓重的一个环节,甚至为了追求最高的准确率,我们会抛弃代码,以人工的方式逐条对数据进行审核.这一点就见仁见智了.

## 归总

至此,我们得到了一个友链的列表.归总的环节主要做的就是让这个列表更好看一点,让数据更加符合我们的使用习惯,所以这并不是一个 *必须* 的环节.

比如本章所针对的 *生态环保网站*, 我选择将其按照行政区划进行归总.
