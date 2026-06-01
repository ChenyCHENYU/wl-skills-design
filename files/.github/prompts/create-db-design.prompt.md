---
mode: agent
description: 生成数据库设计（ER 图 / DB 清单 / 数据字典 / DDL），并写入 .md 文件，自动注入系统字段、索引、spec 联动
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# 数据库设计生成（含文件输出）

## 使用方式

```
帮我设计【订单管理】模块的数据库，
基于 docs/spec/PM/4.3-order.md 的 IPO 表，
输出到 docs/db/01-order.md
```

> 若未指定路径，默认输出到 `docs/db/{NN}-{模块名}.md`，分册总览写 `docs/db/00-db-overview.md`。

---

## 执行步骤

### Step 1：加载规范与 sub-skill

1. 读取 `.github/skills/data/database/SKILL.md`，确认任务类型
2. 读取 `.github/standards/03-database.md`（唯一权威规范）
3. 按任务加载 sub-skill：
   - 推导实体 / ER 图 → `sub/01-erd.md`
   - 设计表字段 + 系统字段 + 索引 → `sub/02-table-design.md`
   - 生成 DDL → `sub/03-ddl.md`
4. 参考模板 `templates/db-skeleton.md`、`templates/data-dictionary.md`

### Step 2：从 spec 推导

读取用户指定的 spec 文件，提取 IPO 表中需持久化的实体与字段。**字段中文名与 spec 一致，英文名与接口报文一致。**

### Step 3：生成内容（每模块固定 4 节）

1. ER 图（占位 + 实体清单）
2. DB 清单
3. 数据字典（10 列标准表，**每张业务表注入 7 个系统字段**）
4. DDL（带 COMMENT + 索引）

同时在 `00-db-overview.md` 维护 spec → DB 联动矩阵。

### Step 4：写入文件（必须执行）

用 `create_file` 写入指定路径。**不允许只展示不落盘。**

### Step 5：自动验证（闭环）

- 对照 `.github/standards/03-database.md §八`（34 项 DB-A/B/C/D/E/X）逐项检查
- 执行 §九 DB-X 集合比对（spec 联动）
- 发现失败项 → 按 §十 优先级用 `replace_string_in_file` 修复 → 复验
- 输出：`✅ 文件已写入 [路径]，通过 N/34 项验证`，并写报告 `docs/db/reports/DB_REVIEW_{模块}_{日期}.md`
