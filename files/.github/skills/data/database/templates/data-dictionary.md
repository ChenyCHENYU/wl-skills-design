# 模板 — 数据字典（10 列标准表）

> 直接套用，**不得增删列**。每张表一张表格。规范见 `standards/03-database.md §五`。

## [表名] · [表中文名]

| 序号 | 字段英文名 | 字段中文名 | 主/外键 | 是否索引 | 类型 | 长度 | 空否 | 缺省 | 备注 |
|------|-----------|-----------|---------|---------|------|------|------|------|------|
| 1 | `id` | 主键 | PK | 是 | bigint | - | N | - | 雪花 ID |
| 2 | `orderNo` | 订单号 | - | 是(UK) | varchar | 40 | N | - | 业务唯一 |
| 3 | `orderItemNo` | 项次 | - | 否 | varchar | 10 | N | - | |
| 4 | `custId` | 客户ID | FK | 是 | varchar | 32 | N | - | 关联客户表 |
| 5 | `aimPackWt` | 目标件重 | - | 否 | decimal | 10,2 | Y | - | |
| 6 | `orderStatus` | 订单状态 | - | 否 | tinyint | - | N | 0 | 0草稿 1已下达 2完工 |
| 7 | `createdBy` | 创建人 | - | 否 | varchar | 32 | N | - | 系统字段 |
| 8 | `createdTime` | 创建时间 | - | 否 | datetime | - | N | CURRENT_TIMESTAMP | 系统字段 |
| 9 | `updatedBy` | 更新人 | - | 否 | varchar | 32 | Y | - | 系统字段 |
| 10 | `updatedTime` | 更新时间 | - | 否 | datetime | - | Y | - | 系统字段 |
| 11 | `deletedFlag` | 删除标志 | - | 否 | tinyint | - | N | 0 | 0正常 1删除 |
| 12 | `tenantId` | 租户号 | - | 否 | varchar | 32 | Y | - | 多租户 |

### 索引清单

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| `pk_order_main` | 主键 | `id` | 主键 |
| `uk_order_main_orderNo` | 唯一 | `orderNo` | 订单号业务唯一 |
| `idx_order_main_custId` | 普通 | `custId` | 按客户查询 |

> 关键字段（主键 / 业务唯一键 / 外键）建议加粗或标色。
