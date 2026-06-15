# 设备点检 数据库设计

## (1) ER 图

【此处插入 设备点检 ER 图】

| 实体名 | 对应物理表 | 与其他实体的关系 |
|--------|-----------|----------------|
| 点检单主档 | eqm_inspection_order | 1 ── N 点检项明细（按 `inspection_id`）|
| 点检项明细 | eqm_inspection_item | N ── 1 点检单主档 |

## (2) DB 清单

| 序号 | 表名 | 中文名称 | 表类型 | 说明 | 预估量级 |
|------|------|---------|--------|------|---------|
| 1 | eqm_inspection_order | 设备点检单主表 | 业务主表 | 一次点检活动一条 | 万级/年 |
| 2 | eqm_inspection_item | 设备点检项明细表 | 业务明细表 | 点检单下的检查项 | 十万级/年 |

## (3) 数据字典

### eqm_inspection_order · 设备点检单主表

| 序号 | 字段英文名 | 字段中文名 | 主/外键 | 是否索引 | 类型 | 长度 | 空否 | 缺省 | 备注 |
|------|-----------|-----------|---------|---------|------|------|------|------|------|
| 1 | `id` | 主键 | PK | 是 | bigint | - | N | - | 雪花 ID |
| 2 | `inspection_no` | 点检单号 | - | 是 | varchar | 32 | N | - | 业务唯一键 |
| 3 | `device_code` | 设备编码 | FK | 是 | varchar | 32 | N | - | 关联设备档案 |
| 4 | `device_name` | 设备名称 | - | 否 | varchar | 64 | N | - | 冗余展示 |
| 5 | `inspection_date` | 点检日期 | - | 是 | date | - | N | - | 与设备同日唯一 |
| 6 | `inspector` | 点检人 | - | 否 | varchar | 32 | N | - | - |
| 7 | `inspection_status` | 点检状态 | - | 是 | varchar | 16 | N | DRAFT | dict: inspection_status |
| 8 | `result` | 点检结论 | - | 否 | varchar | 16 | Y | - | dict: inspection_result |
| 9 | `remark` | 备注 | - | 否 | varchar | 255 | Y | - | - |
| 10 | `created_by` | 创建人 | - | 否 | varchar | 32 | N | - | 系统字段 |
| 11 | `created_time` | 创建时间 | - | 否 | datetime | - | N | CURRENT_TIMESTAMP | 系统字段 |
| 12 | `updated_by` | 更新人 | - | 否 | varchar | 32 | Y | - | 系统字段 |
| 13 | `updated_time` | 更新时间 | - | 否 | datetime | - | Y | - | 系统字段 |
| 14 | `deleted_flag` | 删除标志 | - | 否 | tinyint | - | N | 0 | 系统字段 0正常 1删除 |
| 15 | `tenant_id` | 租户号 | - | 否 | varchar | 32 | Y | - | 系统字段 |
| 16 | `version` | 乐观锁版本 | - | 否 | int | - | N | 0 | 系统字段 |

#### 索引清单

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| `pk_eqm_insp_order` | 主键 | `id` | 主键 |
| `uk_eqm_insp_order_no` | 唯一 | `inspection_no` | 点检单号唯一 |
| `uk_eqm_insp_order_dev_date` | 唯一 | `device_code, inspection_date` | 同设备同日唯一 |
| `idx_eqm_insp_order_status` | 普通 | `inspection_status` | 状态过滤 |

### eqm_inspection_item · 设备点检项明细表

| 序号 | 字段英文名 | 字段中文名 | 主/外键 | 是否索引 | 类型 | 长度 | 空否 | 缺省 | 备注 |
|------|-----------|-----------|---------|---------|------|------|------|------|------|
| 1 | `id` | 主键 | PK | 是 | bigint | - | N | - | 雪花 ID |
| 2 | `inspection_id` | 点检单ID | FK | 是 | bigint | - | N | - | 关联主表 id |
| 3 | `item_name` | 点检项目 | - | 否 | varchar | 64 | N | - | - |
| 4 | `standard_value` | 标准值 | - | 否 | varchar | 64 | Y | - | 文本或区间 |
| 5 | `actual_value` | 实测值 | - | 否 | varchar | 64 | N | - | - |
| 6 | `item_result` | 项目结论 | - | 否 | varchar | 16 | N | NORMAL | dict: inspection_result |
| 7 | `created_by` | 创建人 | - | 否 | varchar | 32 | N | - | 系统字段 |
| 8 | `created_time` | 创建时间 | - | 否 | datetime | - | N | CURRENT_TIMESTAMP | 系统字段 |
| 9 | `updated_by` | 更新人 | - | 否 | varchar | 32 | Y | - | 系统字段 |
| 10 | `updated_time` | 更新时间 | - | 否 | datetime | - | Y | - | 系统字段 |
| 11 | `deleted_flag` | 删除标志 | - | 否 | tinyint | - | N | 0 | 系统字段 |
| 12 | `tenant_id` | 租户号 | - | 否 | varchar | 32 | Y | - | 系统字段 |

#### 索引清单

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| `pk_eqm_insp_item` | 主键 | `id` | 主键 |
| `idx_eqm_insp_item_oid` | 普通 | `inspection_id` | 按主表查明细 |

## (4) DDL 脚本

```sql
CREATE TABLE `eqm_inspection_order` (
  `id`                BIGINT       NOT NULL COMMENT '主键',
  `inspection_no`     VARCHAR(32)  NOT NULL COMMENT '点检单号',
  `device_code`       VARCHAR(32)  NOT NULL COMMENT '设备编码',
  `device_name`       VARCHAR(64)  NOT NULL COMMENT '设备名称',
  `inspection_date`   DATE         NOT NULL COMMENT '点检日期',
  `inspector`         VARCHAR(32)  NOT NULL COMMENT '点检人',
  `inspection_status` VARCHAR(16)  NOT NULL DEFAULT 'DRAFT' COMMENT '点检状态',
  `result`            VARCHAR(16)  NULL COMMENT '点检结论',
  `remark`            VARCHAR(255) NULL COMMENT '备注',
  `created_by`        VARCHAR(32)  NOT NULL COMMENT '创建人',
  `created_time`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by`        VARCHAR(32)  NULL COMMENT '更新人',
  `updated_time`      DATETIME     NULL COMMENT '更新时间',
  `deleted_flag`      TINYINT      NOT NULL DEFAULT 0 COMMENT '删除标志 0正常 1删除',
  `tenant_id`         VARCHAR(32)  NULL COMMENT '租户号',
  `version`           INT          NOT NULL DEFAULT 0 COMMENT '乐观锁版本',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_eqm_insp_order_no` (`inspection_no`),
  UNIQUE KEY `uk_eqm_insp_order_dev_date` (`device_code`, `inspection_date`),
  KEY `idx_eqm_insp_order_status` (`inspection_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备点检单主表';

CREATE TABLE `eqm_inspection_item` (
  `id`             BIGINT      NOT NULL COMMENT '主键',
  `inspection_id`  BIGINT      NOT NULL COMMENT '点检单ID',
  `item_name`      VARCHAR(64) NOT NULL COMMENT '点检项目',
  `standard_value` VARCHAR(64) NULL COMMENT '标准值',
  `actual_value`   VARCHAR(64) NOT NULL COMMENT '实测值',
  `item_result`    VARCHAR(16) NOT NULL DEFAULT 'NORMAL' COMMENT '项目结论',
  `created_by`     VARCHAR(32) NOT NULL COMMENT '创建人',
  `created_time`   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_by`     VARCHAR(32) NULL COMMENT '更新人',
  `updated_time`   DATETIME    NULL COMMENT '更新时间',
  `deleted_flag`   TINYINT     NOT NULL DEFAULT 0 COMMENT '删除标志',
  `tenant_id`      VARCHAR(32) NULL COMMENT '租户号',
  PRIMARY KEY (`id`),
  KEY `idx_eqm_insp_item_oid` (`inspection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备点检项明细表';
```
