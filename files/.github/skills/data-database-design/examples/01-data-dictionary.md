# 匿名合成样例 · PostgreSQL 申请记录数据设计

> 本文件只展示 profile、字段、索引和追溯写法，不对应任何组织、项目或线上数据。

## 设计 profile

| 项 | 值 |
|----|----|
| 方言 | PostgreSQL 16+ |
| 租户 | 单租户 |
| 主键 | UUID，由应用生成 |
| 删除 | 归档，不使用软删除字段 |
| 审计 | `created_at/created_by/updated_at/updated_by` |
| 并发 | 整数 `version` 乐观锁 |
| 命名 | 表/列 snake_case，逻辑字段 camelCase |

## 表清单

| 稳定 ID | 表名 | 中文名 | 类型 | 说明 |
|--------|------|-------|------|------|
| TABLE-DEMO-REQUEST | `req_request` | 申请主表 | 主档 | 保存申请当前状态 |
| TABLE-DEMO-HISTORY | `req_request_history` | 申请履历表 | 履历 | 保存状态变化证据 |

## `req_request` 数据字典

| # | 字段英文名 | 字段中文名 | 主外键 | 索引 | 逻辑类型 | 长度/精度 | 可空 | 缺省 | 备注 |
|---|-----------|-----------|-------|------|---------|----------|------|------|------|
| 1 | `id` | 申请 ID | PK | 是 | UUID | - | N | - | `FIELD-DEMO-ID` |
| 2 | `request_no` | 申请编号 | - | UK | 字符串 | 40 | N | - | `FIELD-DEMO-NO`，业务唯一 |
| 3 | `request_title` | 申请标题 | - | 否 | 字符串 | 100 | N | - | `FIELD-DEMO-TITLE` |
| 4 | `request_type` | 申请类型 | - | 是 | 字符串 | 32 | N | - | `FIELD-DEMO-TYPE`，引用词典 |
| 5 | `request_status` | 申请状态 | - | 是 | 字符串 | 32 | N | `DRAFT` | `FIELD-DEMO-STATUS` |
| 6 | `created_at` | 创建时间 | - | 是 | 时间戳 | - | N | `now()` | profile 审计字段 |
| 7 | `created_by` | 创建角色代号 | - | 否 | 字符串 | 64 | N | - | 不保存个人姓名样例 |
| 8 | `updated_at` | 更新时间 | - | 否 | 时间戳 | - | N | `now()` | profile 审计字段 |
| 9 | `updated_by` | 更新角色代号 | - | 否 | 字符串 | 64 | N | - | profile 审计字段 |
| 10 | `version` | 乐观锁版本 | - | 否 | 整数 | - | N | 0 | 每次更新递增 |

## 索引

| 名称 | 字段 | 类型 | 查询证据 |
|------|------|------|---------|
| `uk_req_request_no` | `request_no` | UNIQUE | 按业务编号唯一定位 |
| `idx_req_status_created` | `request_status, created_at desc` | BTREE | 待办列表按状态过滤并按创建时间倒序 |

## 方言片段

```sql
create table req_request (
  id uuid primary key,
  request_no varchar(40) not null,
  request_title varchar(100) not null,
  request_type varchar(32) not null,
  request_status varchar(32) not null default 'DRAFT',
  created_at timestamptz not null default now(),
  created_by varchar(64) not null,
  updated_at timestamptz not null default now(),
  updated_by varchar(64) not null,
  version integer not null default 0,
  constraint uk_req_request_no unique (request_no)
);

create index idx_req_status_created
  on req_request (request_status, created_at desc);
```

## 追溯

| spec 字段 ID | 词典名 | 数据库字段 | API 字段 | 状态 |
|-------------|--------|-----------|----------|------|
| FIELD-DEMO-NO | `requestNo` | `req_request.request_no` | `requestNo` | ✅ |
| FIELD-DEMO-TYPE | `requestType` | `req_request.request_type` | `requestType` | ✅ |
| FIELD-DEMO-STATUS | `requestStatus` | `req_request.request_status` | `requestStatus` | ✅ |

该样例中的方言和策略只对已声明 profile 有效，不得作为其他项目默认值。
