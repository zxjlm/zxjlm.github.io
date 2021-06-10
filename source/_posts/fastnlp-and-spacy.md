---
title: fastNLP和spaCy的使用
date: 2021-06-06 18:05:42
tags:
  - 毕业设计
  - 自然语言处理
author: harumonia
categories:
  - 源流清泉
  - Python
noThumbInfoStyle: default
outdatedNotice: "no"
thumbChoice: default
thumbStyle: default
hidden: false
customSummary:
thumb:
thumbSmall:
---

fastNLP 和 spaCy 都是自然语言处理常用的算法包,本篇将会应用的角度,分别使用这两个算法包训练一个可用的命名实体识别模型.

<!-- more -->

## fastNLP

[fastNLP](https://fastnlp.readthedocs.io/zh/latest/user/installation.html) 是复旦大学邱锡鹏教授的团队所维护的开源算法包, 其中以 Modules 和 Models 的形式封装了很多的算法结构, 能够很方便地组合出想要的结构模型.比如这篇 [FLAT](https://zhuanlan.zhihu.com/p/326135985), 以及官网所提供的 [BiLSTMCRF](https://fastnlp.readthedocs.io/zh/latest/tutorials/%E5%BA%8F%E5%88%97%E6%A0%87%E6%B3%A8.html).

### fastNLP 应用流程

在官网文档的序列标注模块, 已经给出了模型训练的整体使用流程, 并且代码也没有什么问题. 不过原教程所使用的是其封装好的 _DataSet_ 模块数据, 这里对导入第三方数据的描述不甚了了,本篇要补充的也就是数据集的规范处理而已.

#### 数据处理

以笔者用来分析的数据集为例, 文件夹中存在很多的 excel, 每条数据为一个 excel 文件, 每个文件的内容如下表所示.

|     | 内容 | 标记 |
| --- | ---- | ---- |
| 0   | 肺   | O    |
| 1   | 部   | O    |
| 2   | 恶   | O    |
| 3   | 变   | O    |
| 4   | ,    | O    |
| 5   | 精   | O    |
| 6   | 神   | O    |
| 7   | 改   | O    |
| 8   | 善   | O    |
| 9   | ,    | O    |
| 10  | 左   | B-BW |
| 11  | 侧   | I-BW |
| 12  | 胸   | I-BW |
| 13  | 痛   | B-ZZ |
| 14  | 减   | O    |
| 15  | 轻   | O    |
| 16  | ,    | O    |
| 17  | 纳   | O    |
| 18  | 好   | O    |
| 19  | 转   | O    |
| 20  | ,    | O    |

如上图, 这里数据集的标志整体采用 IOB(Inside-Outside-Begining) 的标注方式. fastNLP 目前不支持这种类型的文件读取, 所以需要手动写一段代码将这个文件组转化为它能直接读取的数据结构. 这里分享一下我的转换代码.

```python
import glob
from fastNLP import Instance

def transfer_sentence(df_input):
    """
    将标注好的句子转为实例

    return: 将单个数据集的特征打包为一个数据示例(Instance)
    """
    words = []
    targets = []
    raw_chars = ''.join(df_input.内容)
    idx = 0
    # 遍历原始数据集,只保留符合标注规范的数据
    while idx < len(df_input.index):
        if df_input.loc[idx,'标记'] == 'O':
            words.append(df.loc[idx,'内容'])
            idx += 1
        elif df_input.loc[idx,'标记'].startswith('B'):
            targets.append(df_input.loc[idx,'标记'][2:])
            tmp = ''
            tmp += df_input.loc[idx,'内容']
            idx += 1
            while idx < len(df_input.index) and df_input.loc[idx,'标记'].startswith('I'):
                tmp += df_input.loc[idx,'内容']
                idx += 1
            words.append(tmp)
        else:
            idx += 1
            return
    # 如果目标列表为空,说明数据集中没有特征数据,丢弃
    if not targets:
        return
    return Instance(
        raw_chars = raw_chars,
        chars = list(df_input.内容),
        target = list(df_input.标记),
        seq_len = len(df_input.标记),
        words = words,
        whole_targets = targets
    )
```

由于笔者的代码集是委托中医学人士手动标注的, 所以其中存在一些不规范的标注, 代码中有一部分就是用来手动清洗纠正, 这种纠正具备泛用性, 在其他领域的标注集上也能使用.

调用代码就多种多样了, 最终, 我通过如下的代码将其组成为一个传统的数据集形式.

```python
dataset = DataSet()
for file_path in file_path_list:
    df = pd.read_excel(file_path,index_col=0)
    ins = transfer_sentence(df)
    if ins:
        dataset.append(ins)
```

得到的数据集如下所示.

```python
+-------------------+------------------+------------------+---------+------------------+-------------------+
| raw_chars         | chars            | target           | seq_len | words            | whole_targets     |
+-------------------+------------------+------------------+---------+------------------+-------------------+
| 代诉：右肺癌,... | ['代', '诉', ... | ['O', 'O', 'O... | 77      | ['代', '诉', ... | ['ZZ', 'ZZ', '... |
| 代诉：服上药后... | ['代', '诉', ... | ['O', 'O', 'O... | 114     | ['代', '诉', ... | ['BW', 'BW', '... |
| 右下肺占位,右...  | ['右', '下', ... | ['O', 'O', 'O... | 94      | ['右', '下', ... | ['ZZ', 'ZZ', '... |
| 右上肺占位,经...  | ['右', '上', ... | ['O', 'O', 'O... | 133     | ['右', '上', ... | ['ZZ', 'ZZ', '... |
| 今年6月左右开...  | ['今', '年', ... | ['O', 'O', 'O... | 100     | ['今', '年', ... | ['ZZ', 'ZZ', '... |
| 自觉体力有所改... | ['自', '觉', ... | ['O', 'O', 'O... | 56      | ['自', '觉', ... | ['ZZ', 'ZZ', '... |
| 疲劳乏力,右胸...  | ['疲', '劳', ... | ['B-ZZ', 'I-Z... | 55      | ['疲劳乏力', ... | ['ZZ', 'BW', '... |
| 2000年右肺细胞... | ['2', '0', '0... | ['O', 'O', 'O... | 86      | ['2', '0', '0... | ['CD', 'ZZ', '... |
| 午后身热,作业...  | ['午', '后', ... | ['O', 'O', 'O... | 52      | ['午', '后', ... | ['ZZ', 'ZZ', '... |
| 右肺94年癌手术... | ['右', '肺', ... | ['O', 'O', 'O... | 72      | ['右', '肺', ... | ['ZZ', 'CD', '... |
+-------------------+------------------+------------------+---------+------------------+-------------------+
```

#### fastNLP 模型训练

随后, 通过如下的代码可以直接在这个数据集上训练模型.

```python
vocab = Vocabulary()
#  从该dataset中的chars列建立词表
vocab.from_dataset(dataset, field_name='chars')
#  使用vocabulary将chars列转换为index
vocab.index_dataset(dataset, field_name='chars')

target_vocab = Vocabulary(unknown=None, padding=None)
#  从该dataset中的chars列建立词表
target_vocab.from_dataset(dataset, field_name='target')
#  使用vocabulary将chars列转换为index
target_vocab.index_dataset(dataset, field_name='target')

# 重命名列名, fastnlp这里似乎是写死的, 只有words能被识别读取
dataset.rename_field('chars', 'words')

# *设置输入列和目标列
dataset.set_input('words','target','seq_len')
dataset.set_target('target','seq_len')

# 设置训练集和开发集
train  = dataset[:1750]
dev = dataset[1750:1900]

embed = StaticEmbedding(vocab=vocab, model_dir_or_name='cn-char-fastnlp-100d')

model = BiLSTMCRF(embed=embed, num_classes=len(target_vocab), num_layers=1, hidden_size=200, dropout=0.5, target_vocab=target_vocab)
# 使用其他的模型结构
# model = SeqLabeling(embed=embed, num_classes=len(target_vocab), hidden_size=200)
# model = AdvSeqLabel(embed=embed, num_classes=len(target_vocab), hidden_size=200, dropout=0.5)

metric = SpanFPreRecMetric(tag_vocab=target_vocab)
optimizer = Adam(model.parameters(), lr=1e-2)
loss = LossInForward()

device= 0 if torch.cuda.is_available() else 'cpu'
trainer = Trainer(train, model, loss=loss, optimizer=optimizer,
                    dev_data=dev, metrics=metric, device=device,n_epochs=100)
trainer.train()
```

这里详细的代码说明可以去[官方文档](https://fastnlp.readthedocs.io/zh/latest/user/installation.html)的序列标注以及详细说明查看.

其中, **设置输入列和目标列** 这一点比较重要, 笔者也是看了源码之后才发现这个操作的, 不知道是不是有其他的配置办法.s

最终得到形如下数据结构的输出, 就是我们的模型结果.

```json
{
  "best_eval": {
    "SpanFPreRecMetric": { "f": 0.821678, "pre": 0.827951, "rec": 0.8155 }
  },
  "best_epoch": 97,
  "best_step": 2328,
  "seconds": 297.19
}
```

### 工具评价

总的来说, fastNLP 是绝佳的科研拍档, 我的毕设的 NLP 部分将诸多文献从理论转为实践, fastNLP 功不可没.

它虽然能够训练模型, 并验证模型的准确率等各种指标参数, 但是这个模型如何实际应用, 却并没有提供一个很好的接口. 而从应用的角度来说, 尽管后续开发出了 [fastHan](https://github.com/fastnlp/fastHan)来不足这些短板, 但是它的使用效果还是不如人意.

## spaCy

正如其官网所言, _Industrial-Strength Natural Language Processing_ , spaCy 提供了一套完整的从训练集到实际应用的流程, 在 spaCy 3.0 中, 这一优势得到了进一步的放大.

### spaCy 应用流程

#### 数据集

spaCy 支持多种的数据集导入, 如 [数据处理](#数据处理) 一节中所述的数据集, 将其转换为 `.conll` 形式, 并拆分为 `train.conll` 和 `dev.conll` 两种形式, 然后通过如下命令进行数据集的转换.

```shell
python -m spacy convert ./dataSet/train.conll ./corpus
python -m spacy convert ./dataSet/dev.conll ./corpus
```

最终, 在 corpus 文件夹中得到两个文件, train.spacy 和 dev.spacy, 这就是将要用来训练的文件.

#### spaCy 模型训练

spaCy 提供一种简单地模型训练方法, 即 [通过配置文件训练](https://spacy.io/usage/training).

这里采用默认的配置文件, 其内容可见于[附录-config.cfg](#config.cfg), 然后使用如下命令进行训练.

```shell
python -m spacy train config.cfg --output ./output --paths.train ./corpus/train.spacy --paths.dev ./corpus/dev.spacy
```

这里使用 `--output` 参数, 将模型的训练结果保存到制定的文件夹下, 方便后续的使用. 在训练的过程中, 会有形似下表的训练过程, 其中包含了模型的评价信息.

| E   | #    | LOSS TRANS... | LOSS NER | ENTS_F | ENTS_P | ENTS_R | SCORE |
| --- | ---- | ------------- | -------- | ------ | ------ | ------ | ----- |
| 0   | 0    | 2185.35       | 798.95   | 0.42   | 0.27   | 0.97   | 0.00  |
| 5   | 200  | 160333.23     | 85173.11 | 73.68  | 69.85  | 77.97  | 0.74  |
| 11  | 400  | 21187.02      | 18633.31 | 81.52  | 77.72  | 85.71  | 0.82  |
| 17  | 600  | 7271.55       | 9616.02  | 82.09  | 78.97  | 85.47  | 0.82  |
| 22  | 800  | 3748.11       | 6245.82  | 82.90  | 80.05  | 85.96  | 0.83  |
| 28  | 1000 | 2176.55       | 5025.63  | 83.35  | 80.80  | 86.08  | 0.83  |
| 34  | 1200 | 1047.27       | 4341.49  | 83.43  | 80.52  | 86.56  | 0.83  |
| ... | ...  | ...           | ...      | ...    | ...    | ...    | ...   |

#### 模型使用

spaCy 的模型调用非常简单, 使用如下的代码即可.

```python
import spacy

nlp = spacy.load("./output/model-best")
doc = nlp('巅顶疼痛基本稳定,但转侧不舒,昏重,视物稍糊,不咳,无痰,食纳少味,舌面下唇粘膜辣痛,口不干,尿少,大便正常')

for ent in doc.ents:
    print(ent.text, ent.start_char, ent.end_char, ent.label_)
```

得到如下的输出.

```shell
转侧不舒 10 14 ZZ
昏 15 16 ZZ
重 16 17 ZZ
视物稍糊 18 22 ZZ
不 23 24 CD
咳 24 25 ZZ
无痰 26 28 ZZ
食纳少味 29 33 ZZ
舌面下唇粘膜 34 40 BW
辣 40 41 ZZ
痛 41 42 ZZ
口 43 44 BW
不 44 45 CD
干 45 46 ZZ
尿少 47 49 ZZ
大便正常 50 54 ZZ
```

### spaCy 工具评价

spaCy 唯一的缺陷也许就是没有完备的中文文档了, 在实际应用方面, 这绝对是我所用过的最为省心与顺手的 NLP 工具包. 上面的例子中展示的是其中的一个模型, 它还支持更多的模型结构, 当然也包括自定义的模型结构, 其还包括了非常美观的[可视化](https://spacy.io/usage/visualizers)接口.

## 附录

### config.cfg

```python
# This is an auto-generated partial config. To use it with 'spacy train'
# you can run spacy init fill-config to auto-fill all default settings:
# python -m spacy init fill-config ./base_config.cfg ./config.cfg
[paths]
train = null
dev = null

[system]
gpu_allocator = "pytorch"

[nlp]
lang = "zh"
pipeline = ["transformer","ner"]
batch_size = 128

[components]

[components.transformer]
factory = "transformer"

[components.transformer.model]
@architectures = "spacy-transformers.TransformerModel.v1"
name = "bert-base-chinese"
tokenizer_config = {"use_fast": true}

[components.transformer.model.get_spans]
@span_getters = "spacy-transformers.strided_spans.v1"
window = 128
stride = 96

[components.ner]
factory = "ner"

[components.ner.model]
@architectures = "spacy.TransitionBasedParser.v2"
state_type = "ner"
extra_state_tokens = false
hidden_width = 64
maxout_pieces = 2
use_upper = false
nO = null

[components.ner.model.tok2vec]
@architectures = "spacy-transformers.TransformerListener.v1"
grad_factor = 1.0

[components.ner.model.tok2vec.pooling]
@layers = "reduce_mean.v1"

[corpora]

[corpora.train]
@readers = "spacy.Corpus.v1"
path = ${paths.train}
max_length = 500

[corpora.dev]
@readers = "spacy.Corpus.v1"
path = ${paths.dev}
max_length = 0

[training]
accumulate_gradient = 3
dev_corpus = "corpora.dev"
train_corpus = "corpora.train"

[training.optimizer]
@optimizers = "Adam.v1"

[training.optimizer.learn_rate]
@schedules = "warmup_linear.v1"
warmup_steps = 250
total_steps = 20000
initial_rate = 5e-5

[training.batcher]
@batchers = "spacy.batch_by_padded.v1"
discard_oversize = true
size = 2000
buffer = 256

[initialize]
vectors = null
```
