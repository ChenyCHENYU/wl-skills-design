---
name: data-database-design
description: >
  **数据库设计技能** — 按照团队标准生成数据库设计（ER 图 / DB 清单 / 数据字典 / DDL）。
  USE FOR: 设计数据库表结构、ER 图、实体关系；从需求说明书（spec）的 IPO 表推导数据表；
  编写数据字典（10 列标准表）；生成 DDL 建表脚本（含系统字段、索引、注释）；
  设计变更履历表（_log/_resume）；审查已有数据库设计是否符合规范。
  DO NOT USE FOR: 接口设计（用 api/restful/SKILL.md）；需求说明书（用 requirements/spec/SKILL.md）；
  流程图（用 requirements/flowchart/SKILL.md）。
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# 数据库设计规范（wl-skills-design）

---

## ⚠️ 首先必读：文档拆分策略

**在生成任何内容之前，必须先明确输出文件结构。**

读取 `.github/skills/data/database/templates/db-skeleton.md`，该文件定义：
- 一份数据库分册由哪些文件组成（按模块拆分）
- 每个模块文件含哪 4 节（ER 图 / DB 清单 / 数据字典 / DDL）
- 每节由哪个 Sub-Skill 生成
- 合并为完整分册的顺序

---

## 第一步（必须）：加载规范

```
.github/standards/03-database.md
```

该文件是唯一权威来源，包含：命名约定、7 个强制系统字段、主键与索引、文档结构、数据字典 10 列格式、变更设计、与 spec 联动、验证清单（34 项）。**不读规范，不执行任何生成操作。**

---

## 第二步：识别任务类型，加载对应 Sub-Skill

| 任务 | Sub-Skill 路径 | 写入目标 |
|------|--------------|---------|
| 从 spec 推导实体、画 ER 图 | `sub/01-erd.md` | 模块文件「(1) ER 图」节 |
| 设计表字段、注入系统字段、对齐 spec 字段 | `sub/02-table-design.md` ⬅ **核心** | 模块文件「(2) DB 清单 + (3) 数据字典」节 |
| 生成 DDL 建表脚本 | `sub/03-ddl.md` | 模块文件「(4) DDL」节 |
| 审查 + 自动修复 + 出报告 | `sub/04-db-review.md` | 验证报告 |

---

## 第三步（可选）：参考模板

| 模板 | 用途 |
|------|------|
| `templates/db-skeleton.md` | 分册文件结构 + 每模块 4 节骨架 |
| `templates/data-dictionary.md` | 数据字典 10 列标准表（直接套用）|
| `templates/table-definition.md` | 单表完整定义示例（含系统字段 + 索引清单）|

---

## ⚠️ 闭环工作流（必须遵循）

> 所有内容生成必须遵循「生成 → 验证 → 修复 → 复验」四阶段循环，**不允许跳过验证直接交付**。

```
[阶段1] 生成（按模块逐节：ER → DB清单 → 数据字典 → DDL）
      ↓
[阶段2] 验证（执行 34 项检查清单）
      ↓ 有失败项？
[阶段3] 修复（按 03-database.md §十 修复优先级）
      ↓
[阶段4] 复验（全部 34 项通过）→ ✅ DONE
```

### 执行规则

| 规则 | 说明 |
|------|------|
| **逐模块验证** | 完成一个模块（4 节完整）后立即验证，不等全分册生成完再统一验证 |
| **验证范围** | 执行 `standards/03-database.md §八` 中全部 **34 项**（DB-A/B/C/D/E/X 组）|
| **修复优先级** | DB-X（与 spec 联动）→ DB-B（系统字段）→ DB-C（索引）→ DB-A（命名）→ DB-E（类型约定）→ DB-D（文档）|
| **系统字段强制** | 每张业务表必须注入 7 个系统字段（§二），缺一即失败 |
| **暂挂项** | 缺调研数据时写 `【待补充：{描述}】`，标注「Pending」，不算失败 |

### 跨文档一致性检查（DB-X 组，每模块执行一次）

完成每个模块后，按 `03-database.md §九` 构建集合并比对：

```
SET_SPEC_OUT = { spec IPO Output 涉及的持久化对象 }
SET_DB_TABLE = { 本分册业务表实体 }
SET_SPEC_FLD = { spec IPO 需持久化字段 }
SET_DB_FLD   = { DB 数据字典所有字段 }

X01：SET_SPEC_OUT ⊆ SET_DB_TABLE
X02：SET_SPEC_FLD ⊆ SET_DB_FLD（按中文名匹配）
X05：联动矩阵行数 == |SET_SPEC_FLD|
```

### 验证报告格式（每次验证后必须输出）

```
数据库设计验证报告 — [模块名]
总项数：30 | 通过：N | 失败：M | 暂挂：K
失败项：
  [B04] pmom_order_main 缺少 deletedFlag 字段
  [X03] orderNo 中文名与 spec IPO 不一致
状态：❌ 需修复后继续
```

---

## 操作入口（完整闭环）

| 任务 | 使用方式 |
|------|---------|
| 初始化分册结构 | 在对话中说「初始化 {模块名} 数据库设计结构」|
| 生成并写入指定模块/表 | 使用 `.github/prompts/create-db-design.prompt.md` |
| 验证已有设计 | 使用 `.github/prompts/validate-db-design.prompt.md` |
| 查阅完整规范 | 读取 `.github/standards/03-database.md` |
