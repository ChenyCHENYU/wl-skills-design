# 默认模板 — 单表完整定义（数据字典 → DDL）

> **这是「默认模板（空白起点）」**：纯结构 + `{占位符}`，零业务数据。一张表从数据字典到 DDL 的骨架。
> 规范见 `standards/03-database.md`。填好的真实范例（质量标杆）见 `../examples/01-data-dictionary.md`，生成结果须不低于它。

## 表：{表名} · {表中文名}

**表类型**：{主档 / 明细档 / 流水 / 关联 / 配置} ｜ **领域/模块**：{领域码 业务} / {模块码 业务} ｜ **预估量级**：{百级/万级/百万级}

### 数据字典（10 列）

| 序号 | 字段英文名 | 字段中文名 | 主/外键 | 是否索引 | 类型 | 长度 | 空否 | 缺省 | 备注 |
|------|-----------|-----------|---------|---------|------|------|------|------|------|
| 1 | `id` | 主键 | PK | 是 | bigint | - | N | - | 雪花 ID |
| 2 | `{字段英文名}` | {字段中文名} | {-/FK} | {是/否} | {类型} | {长度} | {N/Y} | {缺省} | {备注} |
| … | `createdBy` | 创建人 | - | 否 | varchar | 32 | N | - | 系统字段 |
| … | `createdTime` | 创建时间 | - | 否 | datetime | - | N | CURRENT_TIMESTAMP | 系统字段 |
| … | `updatedBy` | 更新人 | - | 否 | varchar | 32 | Y | - | 系统字段 |
| … | `updatedTime` | 更新时间 | - | 否 | datetime | - | Y | - | 系统字段 |
| … | `deletedFlag` | 删除标志 | - | 否 | tinyint | - | N | 0 | 系统字段 |
| … | `tenantId` | 租户号 | - | 否 | varchar | 32 | Y | - | 系统字段 |

### 索引清单

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| `pk_{表名简写}` | 主键 | `id` | 主键 |
| `uk_{表名简写}_{字段}` | 唯一 | `{业务唯一键}` | 业务唯一 |

### DDL（MySQL）

```sql
CREATE TABLE {表名} (
  id           BIGINT        NOT NULL COMMENT '主键',
  {字段}        {类型}        {NULL/NOT NULL} COMMENT '{字段中文名}',
  created_by   VARCHAR(32)   NOT NULL COMMENT '创建人',
  created_time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by   VARCHAR(32)   NULL     COMMENT '更新人',
  updated_time DATETIME      NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_flag TINYINT       NOT NULL DEFAULT 0 COMMENT '删除标志 0正常 1删除',
  tenant_id    VARCHAR(32)   NULL     COMMENT '租户号',
  PRIMARY KEY (id),
  UNIQUE KEY uk_{表名简写}_{字段} ({业务唯一键列})
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='{表中文名}';
```

> 字段英文名 camelCase（数据字典）→ DDL 中转 snake_case；两者一一对应。
