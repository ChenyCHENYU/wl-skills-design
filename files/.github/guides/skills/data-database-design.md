# 数据库设计 Skill — 人读指南

> 面向人读。AI 调度以 `SKILL.md` 为准。

## 这个 Skill 做什么

把需求说明书（spec）里的 IPO 表转成可落地的数据库设计：先声明方言、租户、删除、审计、ID、并发和命名/类型画像，再输出 ER 图、DB 清单、数据字典与 DDL，并与 spec 和接口字段联动。验证默认只读，共 34 项。

## 触发方式

在对话里说：

- 「帮我设计 {模块名} 的数据库」
- 「根据需求说明书生成订单模块的数据字典」
- 「审查这份数据库设计是否符合规范」

## 产出物

```
docs/db/
├── 00-db-overview.md        ← 分册总览 + 联动矩阵
├── 01-{模块名}.md            ← 模块1（ER + DB清单 + 数据字典 + DDL）
├── 02-{模块名}.md            ← 模块2
└── reports/
    └── DB_REVIEW_{模块}_{日期}.md  ← 验证报告
```

## 核心保证

| 保证 | 来源 |
|------|------|
| 系统字段符合已声明数据库画像，不强加固定技术栈 | `standards/03-database.md §一/§二` |
| 数据字典严格 10 列 | `§五` |
| 字段与 spec / 接口可一一映射 | `§七` + DB-X 验证组 |
| 34 项只读验证（`verify db` 执行 [M] 项）；明确授权后修复并复验 | `§八`~`§十` |

## 配套文件

- 规范：`.github/standards/03-database.md`
- 生成：`.github/prompts/create-db-design.prompt.md`
- 验证：`.github/prompts/validate-db-design.prompt.md`
