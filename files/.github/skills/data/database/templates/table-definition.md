# 模板 — 单表完整定义（参考示例）

> 一张表从数据字典到 DDL 的完整范例，含系统字段 + 索引。规范见 `standards/03-database.md`。

## 表：pmom_order_main · 订单主表

**表类型**：主档 ｜ **领域/模块**：pm 生产 / om 订单 ｜ **预估量级**：万级

### 数据字典（10 列）

| 序号 | 字段英文名 | 字段中文名 | 主/外键 | 是否索引 | 类型 | 长度 | 空否 | 缺省 | 备注 |
|------|-----------|-----------|---------|---------|------|------|------|------|------|
| 1 | `id` | 主键 | PK | 是 | bigint | - | N | - | 雪花 ID |
| 2 | `orderNo` | 订单号 | - | 是(UK) | varchar | 40 | N | - | 业务唯一 |
| 3 | `aimPackWt` | 目标件重 | - | 否 | decimal | 10,2 | Y | - | |
| 4 | `createdBy` | 创建人 | - | 否 | varchar | 32 | N | - | 系统字段 |
| 5 | `createdTime` | 创建时间 | - | 否 | datetime | - | N | CURRENT_TIMESTAMP | 系统字段 |
| 6 | `updatedBy` | 更新人 | - | 否 | varchar | 32 | Y | - | 系统字段 |
| 7 | `updatedTime` | 更新时间 | - | 否 | datetime | - | Y | - | 系统字段 |
| 8 | `deletedFlag` | 删除标志 | - | 否 | tinyint | - | N | 0 | 0正常 1删除 |
| 9 | `tenantId` | 租户号 | - | 否 | varchar | 32 | Y | - | 多租户 |

### 索引清单

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| `pk_order_main` | 主键 | `id` | 主键 |
| `uk_order_main_orderNo` | 唯一 | `orderNo` | 业务唯一 |

### DDL（MySQL）

```sql
CREATE TABLE pmom_order_main (
  id           BIGINT        NOT NULL COMMENT '主键',
  order_no     VARCHAR(40)   NOT NULL COMMENT '订单号',
  aim_pack_wt  DECIMAL(10,2) NULL     COMMENT '目标件重',
  created_by   VARCHAR(32)   NOT NULL COMMENT '创建人',
  created_time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by   VARCHAR(32)   NULL     COMMENT '更新人',
  updated_time DATETIME      NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_flag TINYINT       NOT NULL DEFAULT 0 COMMENT '删除标志 0正常 1删除',
  tenant_id    VARCHAR(32)   NULL     COMMENT '租户号',
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_main_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';
```
