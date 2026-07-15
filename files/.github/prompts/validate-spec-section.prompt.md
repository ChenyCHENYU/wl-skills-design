---
agent: agent
description: 只读验证需求设计说明书章节并输出 43 项结构化报告
---

# 验证需求设计说明书

目标：`${input:file:请输入五类说明书文件之一}`

1. 读取 [需求说明书 Skill](../skills/requirements-spec-doc/SKILL.md) 和 [说明书标准](../standards/06-spec-doc.md)。
2. 按章节适用范围执行第十一章 43 项检查，并构建功能、流程、权限和字段差集。
3. 输出规则 ID、文件位置、证据、失败、Pending 和 NA 理由。
4. 默认不修改文件；用户明确要求修复后才可进入 repair 模式并复验。
