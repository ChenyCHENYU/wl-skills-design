---
name: requirements-prototype
description: >
  **原型设计标注技能** — 从 spec IPO 表推导符合规范的原型标注文档，达到「开发就绪（D3）」深度，
  可被 prototype-scan 直接消费生成代码。
  USE FOR: 为模块/页面生成原型标注（交互模式+字段+组件+交互规则）；
  把 spec 功能设计转为结构化页面清单；验证已有原型标注是否达到 D3；
  补全原型标注的缺失项（字段名/字典编码/状态机规则）。
  DO NOT USE FOR: 视觉设计（颜色/字体/间距）；流程图绘制（用 requirements/flowchart/）；
  处理逻辑设计（用 requirements/spec/）；数据库/接口设计。
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# 原型设计标注规范（wl-skills-design）

---

## ⚠️ 核心定位（先读）

原型标注**不是画图**，是把 spec 的功能设计转成**结构化页面清单**——
固定每页的交互模式、字段位置、组件选型、交互规则，让 `prototype-scan` 能精确解析成代码。

- 一个原型页面 = spec 中的一个功能（4.x.4.z），**复用 spec 功能编码，不另起编码**
- 原型字段 ⊆ spec IPO 字段（不凭空造字段）
- 不做视觉设计（颜色/字体由 UI 规范决定）

---

## 第一步（必须）：加载规范

```
.github/standards/02-prototype.md
```

唯一权威来源，包含：8 种交互模式、每页 7 项必标内容、三级深度（D1/D2/D3）、
钢铁行业特化约定、验证清单（23 项）。**不读规范，不执行生成。**

---

## 第二步：确认 spec 上游（强制前置检查）

原型的字段和功能必须来自 spec。生成前确认：

| 检查 | 缺失时的动作 |
|------|------------|
| spec 功能设计（4.x.4）是否存在 | 不存在 → 提示用户先用 `create-spec-section` 生成 spec IPO 表 |
| 术语词典（08-glossary）是否存在 | 存在 → 字段英文名从词典取；不存在 → 按 camelCase 自拟并提示可登记词典 |

> 找不到 spec 时**不要凭空捏造字段**，引导用户先补 spec。

---

## 第三步：识别任务类型，加载对应 Sub-Skill

| 任务 | Sub-Skill 路径 |
|------|--------------|
| 确定页面交互模式 + 区域骨架（D1） | `sub/01-page-layout.md` |
| 字段标注 + 组件选型 + 字典映射 + 交互规则（D2/D3）⬅ **核心** | `sub/02-field-annotation.md` |

---

## 第四步：套用模板

```
.github/skills/requirements/prototype/templates/page-annotation.md
```

单页面标注模板，含 7 项必标区块。每个页面套一份，**不得任意删减区块**。

> **空白模板 vs 真实样例**：`templates/page-annotation.md` 是空白起点（纯结构 + 占位符）；
> `examples/01-page-annotation.md` 是**真实样例（质量标杆）**——一份达 D3 的炼钢计划列表完整标注，
> 含状态机显隐与字段对齐表，生成结果须**对照样例自检且不低于它**。

---

## 操作入口（完整闭环）

| 任务 | 使用方式 |
|------|---------|
| 生成原型标注 | 使用 `.github/prompts/create-prototype.prompt.md` |
| 验证原型标注（23 项） | 使用 `.github/prompts/validate-prototype.prompt.md` |
| 查阅完整规范 | 读取 `.github/standards/02-prototype.md` |

---

## ⚠️ 闭环工作流（必须遵循）

```
[阶段1] 生成（按页面逐个标注，套 page-annotation 模板）
      ↓
[阶段2] 验证（执行 23 项检查清单 PT-A/B/C/X）
      ↓ 有失败项？
[阶段3] 修复（按 02-prototype.md §十 修复协议）
      ↓
[阶段4] 复验（全部 P0/P1 通过）→ 原型达 D3 → ✅ DONE
```

### 执行规则

| 规则 | 说明 |
|------|------|
| **逐页验证** | 完成一个页面立即验证，不等全模块生成完再统一验证 |
| **验证范围** | 执行 `standards/02-prototype.md §九` 全部 **23 项**（PT-A/B/C/X 组）|
| **修复优先级** | PT-X（跨文档一致性）→ PT-A（页面完整性）→ PT-B（字段规范）→ PT-C（交互完整）|
| **禁止跳过修复** | 有 P0/P1 ❌ 项，禁止继续下一页，先修当前页 |
| **暂挂项** | spec/DB/词典对端缺失无法比对时，标「跨文件暂挂」，不算 ❌ |

### 跨文档一致性检查（PT-X 组，每页执行一次）

```
原型字段集 ⊆ spec IPO 字段集            → X01
原型 dictCode 集 = DB 枚举定义集         → X02
原型按钮集 → spec 处理逻辑均有对应        → X03
原型字段英文名 ⊆ 术语词典英文名集         → X04（词典存在时）
原型页面「关联 IPO」编码 ∈ spec 4.x.4    → X05
```

### 验证报告格式（每页验证后必须输出）

```
验证报告 — [页面名]（关联 [功能编码]）
深度等级：D1 / D2 / D3
总项数：23 | 通过：N | 失败：M | 暂挂：K
失败项：
  [X01] 原型字段 {alloyRatio} 在 spec IPO 中不存在
  [B02] 字段 {planStatus} 是 dict 类型但未标 dictCode
状态：❌ 需修复后继续
```

---

## 快速参考：交互模式速选

| 页面特征 | 模式 | 平台组件 |
|---------|------|---------|
| 查询区+表格+分页 | LIST | BaseQuery + BaseTable + jh-pagination |
| 上主表+下明细 | MASTER_DETAIL | jh-drag-row |
| 左树+右表 | TREE_LIST | C_Splitter + C_Tree |
| 弹窗表单 | FORM_MODAL | el-dialog + el-form |
| 独立页表单 | FORM_ROUTE | el-form |
| 多 Tab | TAB_FORM | el-tabs |
| 图表指标 | DASHBOARD | 卡片 + 图表 |
| 多区组合 | COMPOSITE | 逐区拆解标注 |

> 详细决策树见 `standards/02-prototype.md §二.1`。

---

## 与下游 prototype-scan 的衔接

D3 级标注的字段清单结构 = `prototype-scan` 消费格式，可直接转 page-spec JSON：

```
SKILL（本技能）输出 D3 标注  →  prototype-scan 解析  →  page-codegen 生成 Vue 代码
```

标注越精确，代码还原度越高（D3 + prototype-scan 可达 95-100%）。
