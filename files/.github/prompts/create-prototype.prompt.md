---
mode: agent
description: 从 spec 功能设计生成原型标注文档（交互模式+字段+组件+交互规则），达到 D3 开发就绪深度并落盘
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# 原型标注生成（含文件输出）

## 使用方式

```
帮我标注【PMPM007】炼钢计划编制页面，交互模式 COMPOSITE，
输出到 docs/prototype/PMPM007.md
```

```
帮我把计划管理模块的 spec 功能设计转成原型标注
```

> 若未指定路径，默认输出到 `docs/prototype/{功能编码}.md`

---

## 执行步骤

### Step 1：加载规范与 sub-skill

1. 读取 `.github/skills/requirements/prototype/SKILL.md`
2. 读取 `.github/standards/02-prototype.md`（权威规范）
3. 加载 sub-skill：
   - 定模式+骨架 → `sub/01-page-layout.md`
   - 字段标注（核心）→ `sub/02-field-annotation.md`

### Step 2：确认 spec 上游（强制）

读取对应模块的 spec 功能设计（4.x.4）：
- spec 存在 → 从 IPO 表提取字段、按钮、处理逻辑
- spec 不存在 → **停止生成**，提示用户先用 `create-spec-section` 生成 spec IPO 表

> 不允许在没有 spec 的情况下凭空捏造字段。

### Step 3：生成标注

套用 `.github/skills/requirements/prototype/templates/page-annotation.md`：
- 一个 spec 功能编码 = 一个原型页面（复用编码，不另起）
- 7 项区块全部填充（无该区域标「无」）
- 字段英文名用 camelCase，与词典/接口一致
- 所有 dict 字段必标 dictCode
- D3 必须标注特殊交互（状态机/联动/批量）

### Step 4：写入文件（必须执行）

用 `create_file` 将标注写入指定路径（或默认 `docs/prototype/{功能编码}.md`）。

> ⚠️ 不允许只在对话展示而不落盘。

### Step 5：自动验证

写入后立即自检：
- 对照 `.github/standards/02-prototype.md §九`（23 项 PT-A/B/C/X）
- 发现不合格项 → 立即用 `replace_string_in_file` 修复
- 全部 P0/P1 通过 → 输出 `✅ [路径] 已达 D3，通过 X/23 项验证`

---

## 当前任务

${input:task:请描述要标注的页面（如：标注 PMPM007 炼钢计划编制，交互模式 COMPOSITE）}

输出路径：${input:outputPath:docs/prototype/}
