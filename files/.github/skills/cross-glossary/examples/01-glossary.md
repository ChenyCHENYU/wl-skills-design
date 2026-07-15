# 匿名合成样例 · 申请域术语与字段词典

> 本文件使用 `DEMO/REQ` 合成标识，不对应任何组织、人员、地点或线上数据。

## 业务术语

| 稳定 ID | 标准中文名 | 标准英文名 | 类别 | 定义与边界 | 禁用别名 | 来源 |
|--------|-----------|-----------|------|-----------|---------|------|
| TERM-DEMO-REQUEST | 申请 | Request | 业务对象 | 由申请角色提交、进入审核流程的业务记录；不等同于审核任务 | 请求单 | REQ spec |
| TERM-DEMO-REVIEW | 审核 | Review | 业务动作 | 审核角色对待审核申请给出通过或退回结论 | 审批 | REQ spec |

## 字段词典

| 稳定 ID | 中文名 | 英文名 | 逻辑类型 | 领域 | 枚举 ID | 定义 | spec 来源 | DB 映射 | API 映射 |
|--------|-------|-------|---------|------|--------|------|----------|---------|----------|
| FIELD-DEMO-NO | 申请编号 | `requestNo` | string(40) | 申请 | - | 已受理申请的稳定业务编号 | REQ001 | `req_request.request_no` | `requestNo` |
| FIELD-DEMO-TITLE | 申请标题 | `requestTitle` | string(100) | 申请 | - | 申请内容的简短摘要 | REQ002 | `req_request.request_title` | `requestTitle` |
| FIELD-DEMO-TYPE | 申请类型 | `requestType` | string(32) | 申请 | ENUM-DEMO-TYPE | 申请分类 | REQ002 | `req_request.request_type` | `requestType` |
| FIELD-DEMO-STATUS | 申请状态 | `requestStatus` | string(32) | 申请 | ENUM-DEMO-STATUS | 申请当前生命周期状态 | REQ001 | `req_request.request_status` | `requestStatus` |

## 枚举

### ENUM-DEMO-STATUS · 申请状态

| 值 | 显示名 | 含义 | 可迁移到 |
|----|-------|------|---------|
| `DRAFT` | 草稿 | 尚未提交 | `PENDING` |
| `PENDING` | 待审核 | 等待审核结论 | `APPROVED`、`REJECTED` |
| `APPROVED` | 已通过 | 审核通过 | - |
| `REJECTED` | 已退回 | 需要补充后重新提交 | `PENDING` |

## 编码注册

| 类型 | 代码 | 含义 | 状态 |
|------|------|------|------|
| 模块码 | `REQ` | 申请模块 | 已确认 |
| 源系统代号 | `SRC` | 合成源系统 | 样例 |
| 目标系统代号 | `DST` | 合成目标系统 | 样例 |

## 对齐检查

```text
spec 字段 ID = 词典字段 ID = DB/API/原型引用的字段 ID
枚举存储值集合在 spec、DB、API 和原型中完全一致
```

名称相似但稳定 ID 不同的项不得自动合并；先报告差异并由业务方确认。
