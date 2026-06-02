# 样例 · 单页面原型标注完整范例（炼钢计划列表 · D3 开发就绪）

> **这是「样例（真实场景）」，不是空模板。** 它演示 `standards/02-prototype.md` 的 7 项标注落地到 **D3（开发就绪）** 深度后应达到的水位。
> **使用约定**：生成时**对照本样例自检，且必须做得不低于它**——7 区块齐全、dict 字段全部标 dictCode、状态机显隐规则写清、字段 ⊆ spec IPO，不得退化。
> 空白起点请用 `../templates/page-annotation.md`；本文件用于校准「好到可直接 prototype-scan」的程度。
>
> - **对应规范**：`standards/02-prototype.md §三（7 项标注）/§四（D3 深度）/§五（字段对齐）`
> - **来源域**：计划管理 PMPM007 炼钢计划编制（LIST 列表页）。
> - **达标基线**：交互模式确定 · 字段 camelCase 与词典一致 · dict 必标 dictCode · 状态机按钮显隐齐全 · 字段 ⊆ spec IPO。

---

## 【PMPM007】炼钢计划列表

### ① 页面元信息

- **交互模式**：LIST
- **目录名**：`smelting-plan`
- **服务缩写**：`produce`
- **所属流程**：`PMPM-A-01`（炼钢计划流程）
- **关联 IPO**：`PMPM007`（炼钢计划编制）
- **深度等级**：D3（开发就绪）

### ② 查询区字段

| 字段名(camelCase) | 中文标签 | 组件类型 | 字典编码 | 必填 |
|------------------|---------|---------|---------|------|
| `planMonth` | 计划月份 | month | - | 是 |
| `steelGrade` | 钢种 | dict | steel_grade | 否 |
| `planStatus` | 计划状态 | dict | plan_status | 否 |
| `heatNo` | 炉号 | input | - | 否 |

### ③ 表格列（按显示顺序）

| 字段名(camelCase) | 中文表头 | 宽度(px) | 字典编码 | 可点击 |
|------------------|---------|---------|---------|--------|
| `heatNo` | 炉号 | 140 | - | 是（跳转详情） |
| `steelGrade` | 钢种 | 120 | steel_grade | 否 |
| `planDate` | 计划日期 | 120 | - | 否 |
| `planWeight` | 计划重量(吨) | 120 | - | 否 |
| `planStatus` | 计划状态 | 110 | plan_status | 否 |
| `createdBy` | 创建人 | 100 | - | 否 |

### ④ 工具栏按钮

| 按钮文案 | 类型 | 触发动作 | 权限标识 |
|---------|------|---------|---------|
| 新增 | primary | openModal | plan:add |
| 删除 | danger | batchDelete | plan:del |
| 导出 | default | export | plan:export |

### ⑤ 操作列按钮

| 按钮文案 | 触发动作 | 条件显隐 |
|---------|---------|---------|
| 编辑 | edit | `planStatus === 'DRAFT'` 时显示 |
| 删除 | delete | `planStatus === 'DRAFT'` 时显示 |
| 提交审核 | submit | `planStatus === 'DRAFT'` 时显示 |
| 审核通过 | approve | `planStatus === 'PENDING'` 且有审核权限时显示 |
| 驳回 | reject | `planStatus === 'PENDING'` 且有审核权限时显示 |
| 下发 | issue | `planStatus === 'CONFIRMED'` 时显示 |
| 查看 | detail | 任意状态显示 |

### ⑥ 表单字段（新增/编辑弹窗 FORM_MODAL）

| 字段名(camelCase) | 中文标签 | 组件类型 | 必填 | 字典编码 | 默认值 | 联动规则 |
|------------------|---------|---------|------|---------|--------|---------|
| `planDate` | 计划日期 | date | 是 | - | 当天 | - |
| `heatNo` | 炉号 | input | 是 | - | - | 同月份+炉号唯一校验 |
| `steelGrade` | 钢种 | select | 是 | steel_grade | - | 选钢种→带出合金配比 |
| `planHeats` | 计划炉数 | number | 是 | - | - | - |
| `planWeight` | 计划重量(吨) | number | 是 | - | - | 精度2位，须 > 0 |
| `remark` | 备注 | textarea | 否 | - | - | - |

### ⑦ 特殊交互

| 交互类型 | 说明 |
|---------|------|
| 状态机 | DRAFT 草稿：可编辑/删除/提交；PENDING 待审核：可审核通过/驳回；CONFIRMED 已确认：可下发；ISSUED 已下发：只读 |
| 批量操作 | 仅 DRAFT 状态行可勾选批量删除；跨页勾选不保留 |
| 联动 | 选择钢种后自动带出合金配比（只读展示，不可改） |

---

## 字段对齐说明（与 spec / 词典）

| 原型字段 | spec IPO 字段 | 词典英文名 | 字典/枚举 | 状态 |
|---------|--------------|-----------|----------|------|
| `heatNo` | 炉号 | heatNo | - | ✅ |
| `steelGrade` | 钢种 | steelGrade | steel_grade | ✅ |
| `planStatus` | 计划状态 | planStatus | PLAN_STATUS | ✅ |
| `planWeight` | 计划重量 | planWeight | - | ✅ |

> 原型字段全部 ⊆ spec PMPM007 IPO 字段，无 spec 外字段（PT-X X01 通过）。

---

## 自检：本样例为何达 D3（生成时对齐这些点，并设法超过）

- ✅ 7 区块齐全（元信息/查询区/表格列/工具栏/操作列/表单/特殊交互），无缺项。
- ✅ 全部字段 camelCase，与接口/词典英文名逐字一致。
- ✅ 每个 dict 字段都标了 dictCode（`steel_grade` / `plan_status`），prototype-scan 可直接解析。
- ✅ 状态机按钮显隐用 `planStatus === 'X'` 精确表达，覆盖全部 4 个状态。
- ✅ 原型字段 ⊆ spec IPO，字典编码与 DB 枚举一致，可直接进 prototype-scan → page-codegen。
