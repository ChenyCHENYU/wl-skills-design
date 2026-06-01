# 数据库设计 Skill — 使用说明（USAGE）

> 面向人读。AI 调度以 `SKILL.md` 为准。

## 这个 Skill 做什么

把需求说明书（spec）里的 IPO 表，转成一套可落地的数据库设计：ER 图 → DB 清单 → 数据字典（10 列）→ DDL 脚本，并强制注入系统字段、索引、与 spec 字段联动校验，最后跑 34 项验证闭环出报告。

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
| 每张业务表 7 个系统字段齐全 | `standards/03-database.md §二` |
| 数据字典严格 10 列 | `§五` |
| 字段与 spec / 接口可一一映射 | `§七` + DB-X 验证组 |
| 34 项验证 + 自动修复 | `§八`~`§十` |

## 配套文件

- 规范：`.github/standards/03-database.md`
- 生成：`.github/prompts/create-db-design.prompt.md`
- 验证：`.github/prompts/validate-db-design.prompt.md`
