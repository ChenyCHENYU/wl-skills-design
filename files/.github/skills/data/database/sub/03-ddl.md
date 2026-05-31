# Sub-Skill 03 — DDL 脚本生成

> 规范来源：`standards/03-database.md §四（4.4）`。本文件只讲操作。

## 目标

把数据字典转成可执行 DDL：字段顺序一致、带注释、含索引、含系统字段。

## 步骤

### Step 1 — 确认方言

询问/确认目标数据库（MySQL / PostgreSQL / Oracle）。默认 MySQL。

### Step 2 — 逐表生成 CREATE TABLE

规则：
- 字段顺序 = 数据字典顺序（业务字段在前，7 个系统字段在末）。
- 每个字段带 `COMMENT '字段中文名'`，表带 `COMMENT '表中文名'`。
- 物理列名可转蛇形（`orderNo` → `order_no`），但需与数据字典英文名一一映射。
- 索引按索引清单逐条落地。

### Step 3 — 示例（MySQL）

```sql
CREATE TABLE pmom_order_main (
  id           BIGINT         NOT NULL COMMENT '主键',
  order_no     VARCHAR(40)    NOT NULL COMMENT '订单号',
  cust_id      VARCHAR(32)    NOT NULL COMMENT '客户ID',
  aim_pack_wt  DECIMAL(10,2)  NULL     COMMENT '目标件重',
  -- 系统字段（审计区）
  created_by   VARCHAR(32)    NOT NULL COMMENT '创建人',
  created_time DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by   VARCHAR(32)    NULL     COMMENT '更新人',
  updated_time DATETIME       NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_flag TINYINT        NOT NULL DEFAULT 0 COMMENT '删除标志 0正常 1删除',
  tenant_id    VARCHAR(32)    NULL     COMMENT '租户号',
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_main_order_no (order_no),
  KEY idx_order_main_cust_id (cust_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';
```

> PostgreSQL：列注释用 `COMMENT ON COLUMN`；自增用 `BIGSERIAL`。
> Oracle：`VARCHAR2`、`NUMBER(p,s)`，注释用 `COMMENT ON COLUMN`。

## 验证（交给 04-db-review）

- D04：字段带 COMMENT、表带 COMMENT、含索引定义
- B06：系统字段在末尾审计区
