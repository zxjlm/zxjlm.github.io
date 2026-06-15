---
title: Vibe coding - Rules 与 Skills
date: 2026-02-24 23:17:47
updated: 2026-02-24 23:17:47
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

上一篇介绍了 Vibe Coding 的基础: 模型、提示词与上下文. 接下来进一步了解 IDE 中一种特殊的提示词, 即 Rule.

规则的意义在于通过持久化的项目约束将 Agent 特化. 过去需要先说“你是一个 Python 专家, 精通……”, 现在可以将技术栈、代码规范和项目结构写入规则, 日常只需要描述具体任务.

<!-- more -->

## Rule 的工作原理

大型语言模型本身是无状态的, 不同补全之间不会天然保留记忆. Rule 会在 System Prompt 层提供持久、可复用的上下文, 为代码生成、编辑和工作流提供一致的指导.

Cursor 支持项目规则、用户规则、团队规则与 `AGENTS.md` 等规则形式. 项目规则通常放在 `.cursor/rules/` 中, 旧形式使用 `.mdc` 文件并通过 YAML frontmatter 描述适用范围.

规则适合声明:

- 项目简介、目录结构和代码组织方式
- 技术栈及依赖版本
- 代码风格和开发规范
- 特殊运行环境
- 项目反复出现的限制条件

规则不适合堆放所有“最佳实践”. 规则越长, 占用的上下文越多, 也越容易与 Agent 自带的能力产生冲突.

## 为什么需要规则

当 AI 生成的代码不符合预期时, 常见的选择是手动修改, 或者继续要求 AI 修改.

最典型的问题是过度设计. 比如让 AI 实现一个只需要从单一接口获取代理的管理类, 它却可能设计出兼容多种来源、缓存和调度策略的抽象系统. 代码本身或许没有错, 但理解和剪枝的成本可能比直接实现更高.

遇到这类问题时, 与其长期维护一次性的人工修补, 不如补充一条可复用的约束, 例如:

```text
Keep it as simple as possible.
Only implement capabilities required by the current task.
```

然后重新生成. 这看起来增加了当前任务的成本, 但规则能防止未来重复犯错.

## 让规则保持轻量

好的规则应当聚焦、可执行、范围清晰:

- 将规则控制在合理长度内
- 将大型规则拆成可组合的小规则
- 提供具体示例或引用文件
- 避免模糊表述
- 发现 Agent 反复犯同一个错误时再增加规则

一些旧规则会随着工具升级而失效. 例如 Cursor 内建 Plan 模式之后, 自定义的任务规划规则可能与内建能力冲突. 因此规则不是一次配置后永久不变的文档, 而是需要持续维护的项目资产.

## 示例: 指定运行环境

默认情况下, Agent 可能直接在项目目录中调用 `python`:

```bash
cd /path/to/project && python backend/demo/demo.py
```

如果项目使用独立环境, 可以在规则中明确正确的执行方式:

```markdown
## The correct way to run Python

This project uses a standalone virtual environment.
Use the configured alias `project_python` instead of `python`.

For example, run `project_python -m pytest`.
```

![cursor-extract-result-common](/images/vibecoding/cursor-extract-result-common.png)

## 从 Rule 到 Agent Skills

Rule 更像始终存在的项目约束, Skills 则更像按需加载的专业能力与工作流程.

当 Skill 被触发时, Agent 会读取对应的 `SKILL.md`, 再根据其中的指引按需读取参考资料或运行脚本. 这样既能为模型补充特定领域的专业知识, 又不需要把全部内容始终塞进上下文窗口.

![agentskillscomputer](/images/vibecoding/agentskillscomputer.png)

可以把二者简单理解为:

- Rule: 告诉 Agent 在这个项目中始终应该怎样工作
- Skill: 告诉 Agent 遇到某类任务时应该遵循什么流程

无论使用哪一种形式, 核心仍然是持续纠偏. 当输出不理想时, 不只解决当前问题, 也要思考如何减少下一次的沟通成本.
