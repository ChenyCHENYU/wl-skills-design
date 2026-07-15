# 匿名合成样例 · 申请列表原型标注（D3）

> 本文件只用于校准标注深度，不对应任何组织、项目、人员或线上数据。空白起点使用 [页面标注模板](../templates/page-annotation.md)。

## 【REQ001】申请列表

### ① 页面元信息

- 交互模式：`LIST`
- 页面稳定 ID：`SCREEN-DEMO-001`
- 目录名：`request-list`
- 服务代号：`request`
- 所属流程：`REQ-A-01`（申请审核流程）
- 关联 IPO：`REQ001`（申请列表）
- 深度等级：D3

### ② 查询区字段

| 字段稳定 ID | 字段名 | 标签 | 组件 | 字典编码 | 必填 |
|------------|-------|------|------|---------|------|
| FIELD-DEMO-NO | `requestNo` | 申请编号 | input | - | 否 |
| FIELD-DEMO-TYPE | `requestType` | 申请类型 | dict | `request_type` | 否 |
| FIELD-DEMO-STATUS | `requestStatus` | 申请状态 | dict | `request_status` | 否 |
| FIELD-DEMO-DATE | `createdDate` | 创建日期 | date-range | - | 否 |

### ③ 表格列

| 字段稳定 ID | 字段名 | 表头 | 宽度 | 字典编码 | 可点击 | 隐私展示 |
|------------|-------|------|------|---------|--------|---------|
| FIELD-DEMO-NO | `requestNo` | 申请编号 | 160 | - | 是，打开详情 | 原样 |
| FIELD-DEMO-TITLE | `requestTitle` | 申请标题 | 220 | - | 否 | 原样 |
| FIELD-DEMO-TYPE | `requestType` | 申请类型 | 120 | `request_type` | 否 | 原样 |
| FIELD-DEMO-STATUS | `requestStatus` | 申请状态 | 120 | `request_status` | 否 | 原样 |
| FIELD-DEMO-DATE | `createdDate` | 创建日期 | 120 | - | 否 | 原样 |

### ④ 工具栏按钮

| 按钮 | 类型 | 动作 | 权限标识 | 禁用条件 |
|------|------|------|---------|---------|
| 新增 | primary | `openCreate` | `request:create` | 无 |
| 导出 | default | `exportVisibleRows` | `request:export` | 无结果或 profile 禁止导出 |

### ⑤ 操作列按钮

| 按钮 | 动作 | 显示条件 | 禁用与原因 |
|------|------|---------|-----------|
| 查看 | `openDetail` | 所有状态 | 无 |
| 编辑 | `openEdit` | `requestStatus === 'DRAFT'` | 无修改权限时禁用并提示 |
| 提交 | `submit` | `requestStatus === 'DRAFT'` | 校验失败时禁用并定位字段 |
| 审核 | `openReview` | `requestStatus === 'PENDING'` 且有审核权限 | 当前记录已被他人处理时禁用并刷新 |

### ⑥ 表单字段

| 字段稳定 ID | 字段名 | 标签 | 组件 | 必填 | 字典编码 | 默认值 | 联动规则 |
|------------|-------|------|------|------|---------|--------|---------|
| FIELD-DEMO-TITLE | `requestTitle` | 申请标题 | input | 是 | - | - | 1～100 字 |
| FIELD-DEMO-TYPE | `requestType` | 申请类型 | select | 是 | `request_type` | - | `OTHER` 时显示补充说明 |
| FIELD-DEMO-NOTE | `additionalNote` | 补充说明 | textarea | 条件 | - | - | 非 `OTHER` 时清空并隐藏 |

### ⑦ 特殊交互与可访问性

| 类型 | 说明 |
|------|------|
| 状态机 | `DRAFT` 可编辑/提交；`PENDING` 仅审核角色可审核；`APPROVED` / `REJECTED` 只读 |
| 联动 | 类型切换为 `OTHER` 时显示并聚焦补充说明；切回时清空、隐藏并移出校验 |
| 并发 | 审核提交前校验版本；冲突时保留输入、提示刷新，不覆盖他人结果 |
| 键盘 | 查询、表格操作和弹窗按钮均可按 Tab 顺序访问；弹窗关闭后焦点回到触发按钮 |
| 空状态 | 无结果时展示说明和清空筛选入口，不显示空白表格 |

## 字段追溯

| 原型字段 ID | spec IPO 字段 ID | 词典英文名 | API 字段 | 状态 |
|-------------|------------------|-----------|----------|------|
| FIELD-DEMO-NO | FIELD-DEMO-NO | `requestNo` | `requestNo` | ✅ |
| FIELD-DEMO-TYPE | FIELD-DEMO-TYPE | `requestType` | `requestType` | ✅ |
| FIELD-DEMO-STATUS | FIELD-DEMO-STATUS | `requestStatus` | `requestStatus` | ✅ |

## 自检

- 七个区块齐全，字段使用稳定 ID 和 camelCase。
- 字典字段均有字典编码；状态、权限、联动、逆向还原、异常和键盘行为可验证。
- 原型字段是 spec IPO 字段的子集；样例未填任何个人信息或线上数据。
