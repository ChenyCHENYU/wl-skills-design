---
agent: agent
description: 只读验证 draw.io 业务流程图并输出 20 项结构化报告
---

# 验证业务流程图

目标：`${input:file:请输入 .drawio 文件路径}`

1. 读取 [流程图 Skill](../skills/requirements-flowchart/SKILL.md) 和 [流程图标准](../standards/01-flowchart.md)。
2. 验证 XML 可解析、ID 唯一、引用有效、节点和连线完整。
3. 执行标准第十五章 20 项检查；spec 缺失时将第 16–20 项标记 Pending。
4. 输出规则 ID、结果、证据位置、问题和建议，不修改目标文件。
5. 只有用户明确要求“修复”时才进入 repair 模式，展示差异后修改并复验。
