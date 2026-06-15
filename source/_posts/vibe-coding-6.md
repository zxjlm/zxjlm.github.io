---
title: Vibe coding - 常见问题、工具扩展与持续迭代
date: 2026-03-04 23:17:47
updated: 2026-03-04 23:17:47
status: publish
author: harumonia
categories:
  - 源流清泉
tags:
  - AI
  - Cursor
  - Vibe Coding
customSummary:
noThumbInfoStyle: default
outdatedNotice: no
reprint: standard
thumb:
thumbChoice: default
thumbDesc:
thumbSmall:
thumbStyle: default
hidden: false
email: zxjlm233@gmail.com
---

前几篇介绍了模型、Prompt、Rules、Cursor 工作模式、注意事项与项目重构. 最后一篇记录一些使用中的常见问题、仍然值得使用的扩展工具, 以及如何量化和迭代自己的 Vibe Coding 工作流.

<!-- more -->

## 常见问题

### WSL2 中编辑器服务启动失败

遇到以下报错时:

```text
Unable to detect if server is already installed:
```

最直接的处理方式是重启 WSL2. 如果无法重启, 可以再参考相关 issue 中的社区方案, 但需要注意不同版本下不一定生效.

### 如何回退 AI 的修改

恒定解法仍然是 Git.

不同 Vibe Coding 工具通常自带 revert 能力, 但它们往往只了解 Agent 自己的修改. 如果用户在 AI 修改基础上继续编辑, revert 可能因为改动区块重叠而出现问题.

因此在重要任务开始前, 应通过 commit 或 stash 保留最新稳定版本. AI 能生成大量代码, 也意味着更需要频繁建立可回退节点.

### 网络问题

Tab 无反应、流式请求中断或索引失败, 都可能由网络质量引起. 可以先通过编辑器自带的 Diagnostics 判断连接状态, 再决定是否调整协议或网络代理.

协议降级可能缓解补全问题, 但也可能影响 indexing. 网络调整需要结合实际诊断结果, 不应将某一个配置当成永久解法.

![cursornettun](/images/vibecoding/cursornettun.png)

## 工具扩展

### Antigravity

Antigravity 在浏览器能力和模型使用额度上有一定优势, 适合作为辅助编码工具或用于非核心项目实验.

它的不足也比较明显: 产品能力、工作流调教、上下文展示和隐私政策仍需要持续观察. 对核心项目而言, 使用前应先判断代码与数据是否适合交给该工具处理.

### DeepWiki

DeepWiki 能够根据 GitHub 或 GitLab 仓库生成 Wiki 与架构图, 对理解中大型项目很有帮助.

它适合两个场景:

1. 代码审查前快速理解项目结构.
2. 为陌生开源项目生成定制化文档.

![deepwikidoc](/images/vibecoding/deepwikidoc.png)

使用这类工具时需要警惕供应链攻击和提示词注入. 在线生成的说明可以帮助理解代码, 但不能替代对仓库内容、安装脚本和依赖的审查.


## 量化 Vibe Coding

主观上感觉更快, 不代表客观效率一定提升. 因此需要建立量化指标来验证 AI 是否真正改善了工作流.

以 Cursor 为例, 可以参考:

- Lines of Agent Edits
- Agent 编辑接受量
- Tabs Accepted

这些数据不能覆盖“接受后返工”的情况, 所以只能作为个人判断的一部分.

更有价值的指标包括:

- Prompt 到可交付代码的转化率
- 一个功能从开始到验收所需的完整对话轮次
- 引入 AI 前后的交付周期变化
- AI 代码的返工比例
- Review 与测试阶段发现的问题数量

量化的目的不是追求生成代码行数, 而是判断最终交付是否更快、更稳.

## 持续迭代

Vibe Coding 不是一次配置后终身使用的方案. IDE、模型和项目技术栈都会变化, Rules 与工作方式也需要随之迭代.

例如:

- IDE 内建 Plan 模式后, 删除与其冲突的旧任务规划规则
- 技术栈从 Pydantic v1 升级到 v2 后, 同步更新项目规则
- 发现生成结果反复不符合预期时, 增加具体约束和示例

还需要警惕 AI 形成“伪闭环”: 从方案、实现到验证都沿着同一套错误假设推进, 最后看起来逻辑自洽, 实际方向却是错的.

解决办法是及时引入外部变量. 它可以是另一位开发者, 也可以是另一个模型. 独立视角往往能够打破闭环, 发现被忽略的前提.

## Conclusion

AI 的好处之一, 是即使在精力不济、思路混乱时, 也能帮助产出还不错的代码. 但它也会让编码能力退化, 并放大错误的设计方向.

建议多尝试、多摸索, 找到适合自己的协作方式. AI 不会消失, 它只是工具箱里的又一把工具. 使用体验的好坏也与任务和技术栈有关; 如果某个场景效果很差, 也可能只是它暂时不适合交给 AI.

