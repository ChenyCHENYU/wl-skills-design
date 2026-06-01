# 模板 — 单页面原型标注

> 每个页面套一份，**7 项区块不得删减**（无该区域则标「无」）。规范见 `standards/02-prototype.md §三`。
> 字段英文名用 camelCase，与接口/词典一致。

## 【{功能编码}】{页面中文名}

### ① 页面元信息

- **交互模式**：LIST / FORM_MODAL / MASTER_DETAIL / TREE_LIST / FORM_ROUTE / TAB_FORM / DASHBOARD / COMPOSITE
- **目录名**：`{kebab-case}`（如 smelting-plan）
- **服务缩写**：`{produce / sale / quality / ...}`
- **所属流程**：`{流程编号，如 PMPM-A-01}`
- **关联 IPO**：`{spec 功能编码，如 PMPM007}`
- **深度等级**：D1 / D2 / D3

### ② 查询区字段

| 字段名(camelCase) | 中文标签 | 组件类型 | 字典编码 | 必填 |
|------------------|---------|---------|---------|------|
| `smeltingOrderNo` | 炼钢订单号 | input | - | 否 |
| `steelGrade` | 钢种 | dict | steel_grade | 否 |
| `planDate` | 计划日期 | dateRange | - | 否 |

### ③ 表格列（按显示顺序）

| 字段名(camelCase) | 中文表头 | 宽度(px) | 字典编码 | 可点击 |
|------------------|---------|---------|---------|--------|
| `smeltingOrderNo` | 炼钢订单号 | 160 | - | 是（跳转详情） |
| `steelGrade` | 钢种 | 120 | steel_grade | 否 |
| `planStatus` | 计划状态 | 120 | plan_status | 否 |

### ④ 工具栏按钮

| 按钮文案 | 类型 | 触发动作 | 权限标识 |
|---------|------|---------|---------|
| 新增 | primary | openModal | plan:add |
| 删除 | danger | batchDelete | plan:del |
| 导出 | default | export | - |

### ⑤ 操作列按钮

| 按钮文案 | 触发动作 | 条件显隐 |
|---------|---------|---------|
| 编辑 | edit | status === 0 时显示 |
| 删除 | delete | status === 0 时显示 |
| 提交 | submit | status === 0 时显示 |

### ⑥ 表单字段（弹窗/路由表单，无则标「无」）

| 字段名(camelCase) | 中文标签 | 组件类型 | 必填 | 字典编码 | 默认值 | 联动规则 |
|------------------|---------|---------|------|---------|--------|---------|
| `steelGrade` | 钢种 | select | 是 | steel_grade | - | 选钢种→带出合金配比 |
| `planQty` | 计划数量 | number | 是 | - | - | - |
| `remark` | 备注 | textarea | 否 | - | - | - |

### ⑦ 特殊交互（无则标「无」）

| 交互类型 | 说明 |
|---------|------|
| 状态机 | 待排产(0)：可编辑/删除/提交；已排产(1)：只读 |
| 组炉/组浇 | 勾选多条钢坯需求 → 自动汇总总重量、总支数 |
| 主从联动 | 主表选中订单行 → 下方明细加载该订单钢坯 |

---

> **自检**：7 区块齐全？所有 dict 字段标了 dictCode？字段 ⊆ spec IPO？英文名 = 词典？  
> 全过 → 该页达 D3，可 prototype-scan。
