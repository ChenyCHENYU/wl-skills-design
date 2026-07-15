# Sub-Skill 02 — 表设计（字段 / 系统字段 / 索引）⬅ 核心

> 规范来源：`standards/03-database.md §一/§二/§三/§五/§七`。本文件只讲操作。

## 目标

为每个实体设计完整表：业务字段 + 7 个系统字段 + 索引清单，输出 DB 清单与数据字典（10 列）。

## 步骤

### Step 1 — 命名表（§一）

`[领域码][模块码]_[业务含义][后缀]`，全小写蛇形。先确定领域码/模块码，再套后缀词表（`_main`/`_dtl`/`_log`/`_resume`/`_rel`/`_cfg`）。

### Step 2 — 落业务字段

从 spec IPO 字段信息行提取需持久化字段，逐个填入数据字典 10 列：

| 列 | 怎么填 |
|----|-------|
| 字段英文名 | 小驼峰，**与接口报文英文字段一致** |
| 字段中文名 | **与 spec IPO 字段名一致** |
| 类型/长度 | varchar 写长度；decimal 写 `精度,小数` |
| 空否/缺省/备注 | 必填→N；枚举/关联表写备注 |

### Step 3 — 注入 7 个系统字段（强制，§二）

每张业务表末尾审计区追加：

```
| 末-6 | id          | 主键     | PK | 是 | bigint   | -  | N | -                  | 雪花 ID |
| 末-5 | createdBy   | 创建人   | -  | 否 | varchar  | 32 | N | -                  | 系统字段 |
| 末-4 | createdTime | 创建时间 | -  | 否 | datetime | -  | N | CURRENT_TIMESTAMP  | 系统字段 |
| 末-3 | updatedBy   | 更新人   | -  | 否 | varchar  | 32 | Y | -                  | 系统字段 |
| 末-2 | updatedTime | 更新时间 | -  | 否 | datetime | -  | Y | -                  | 系统字段 |
| 末-1 | deletedFlag | 删除标志 | -  | 否 | tinyint  | -  | N | 0                  | 0正常 1删除 |
| 末   | tenantId    | 租户号   | -  | 否 | varchar  | 32 | Y | -                  | 多租户 |
```

> 纯字典/配置表可豁免部分系统字段，但必须保留 `id` + `createdTime`。

### Step 4 — 设计索引清单（§三）

```
| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| pk_order_main | 主键 | id | 主键 |
| uk_order_main_orderNo | 唯一 | orderNo | 业务唯一 |
| idx_order_main_custId | 普通 | custId | 按客户查询 |
```

规则：业务唯一键必须 `uk_*`；外键/高频查询字段建 `idx_*`；联合索引最左前缀；单表 ≤ 5。

### Step 5 — 写 DB 清单 + 数据字典

DB 清单（模块所有表一览）+ 逐表数据字典（套 `templates/data-dictionary.md`）。

### Step 6 — 维护 spec 联动矩阵（§七）

每落一个字段，在分册总览的联动矩阵追加一行：spec 功能编码 | IPO 字段中文 | DB 表 | DB 字段英文 | 状态。

## 验证（交给 04-db-review）

A 组命名、B 组系统字段、C 组索引、X 组联动全覆盖。
