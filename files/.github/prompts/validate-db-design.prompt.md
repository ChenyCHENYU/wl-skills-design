---
agent: agent
description: 只读验证数据库设计、目标方言和跨文档字段追溯，输出 34 项报告
---

# 验证数据库设计

目标：`${input:file:请输入数据库设计或 DDL 路径}`

1. 读取 [数据库 Skill](../skills/data-database-design/SKILL.md) 和 [数据库标准](../standards/03-database.md)。
2. 确认目标数据库 profile，执行 DB-A/B/C/D/E/X 共 34 项检查。
3. 输出规则 ID、位置、DDL 方言问题、字段差集、失败和 Pending。
4. 默认不修改文件；只有用户明确要求修复时才展示差异、修改并复验。
