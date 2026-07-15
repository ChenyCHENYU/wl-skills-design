---
agent: agent
description: 只读验证接口设计、OpenAPI 契约和跨文档追溯，输出 38 项报告
---

# 验证接口设计

目标：`${input:file:请输入接口设计或 OpenAPI 文件路径}`

1. 读取 [接口 Skill](../skills/api-interface-design/SKILL.md) 和 [接口标准](../standards/04-api-design.md)。
2. 执行 IF-A/B/C/D/X 共 38 项检查；OpenAPI 文件额外检查解析、引用和 operationId 唯一性。
3. 输出规则 ID、位置、字段差集、失败、Pending 和 NA 理由。
4. 默认不修改文件；用户明确要求修复后才可修改并复验。
