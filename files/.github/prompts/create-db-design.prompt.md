---
agent: agent
description: 按已确认数据库 profile 生成 ER、数据字典、索引和 DDL
---

# 创建数据库设计

任务：`${input:task:请描述模块、目标数据库方言、实体和关键查询}`

1. 读取 [数据库 Skill](../skills/data-database-design/SKILL.md) 和 [数据库标准](../standards/03-database.md)。
2. 先确认方言、租户、软删除、审计字段、主键和并发控制策略；不能确认时标记 Pending。
3. 使用 [匿名分册骨架](../skills/data-database-design/templates/db-skeleton.md) 生成 ER、清单、数据字典和 DDL。
4. 以目标方言检查 DDL，并对本轮新产物执行 DB-A/B/C/D/E/X 共 34 项验证、必要修复和复验。
5. 返回 profile、产物路径、验证结果和字段差集。
