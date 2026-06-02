---
mode: agent
description: 生成需求设计说明书指定章节，并将内容写入 .md 文件（支持 IPO 表 / 流程说明 / 报表设计等）
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# 需求设计说明书章节生成（含文件输出）

## 使用方式

在对话中描述你要生成的内容，并指定输出路径，例如：

```
帮我写【PMPM007】炼钢计划编制的 IPO 表（列表页+新增页），
输出到 docs/4.3-plan/PMPM007-ipo.md
```

```
帮我写 PMMB-A-02 月度生产目标流程说明，
输出到 docs/4.1-target/flow-PMMB-A-02.md
```

> 若未指定路径，默认输出到 `docs/spec/{project项目代号}/4.{x}-{sub模块名}.md`（对应 doc-skeleton 五文件拆分结构）

---

## 执行步骤

### Step 1：加载规范与 sub-skill

1. 读取 `.github/skills/requirements/spec/SKILL.md`，确认任务类型
2. 根据任务类型加载对应 sub-skill：
   - IPO 表 → `.github/skills/requirements/spec/sub/03-function-ipo.md`
   - 流程说明 → `.github/skills/requirements/spec/sub/02-module-flow.md`
   - 总体章节 → `.github/skills/requirements/spec/sub/01-overview.md`
   - 数据/报表 → `.github/skills/requirements/spec/sub/04-data-report.md`
3. 参考 `.github/skills/requirements/spec/examples/` 中对应的真实样例（质量标杆，须做得不低于它）

### Step 2：生成内容

按 sub-skill 模板生成完整内容，包含：
- 正确的 Markdown 标题层级（`## 4.x.4.z  【编码】名称`）
- 所有必要小节（画面逻辑占位 + IPO 表格）
- 符合四段式处理逻辑格式（`**(一)数据校验** … **(二)处理逻辑** …`）

### Step 3：写入文件（必须执行）

**使用 `create_file` 将完整内容写入用户指定路径**（或默认路径）。

> ⚠️ 不允许只在对话中展示内容而不写文件。每次生成必须落盘。

### Step 4：自动验证

文件写入后，立即执行自检：
- 对照 `.github/standards/06-spec-doc.md` §十一 验证清单（43 项）
- 发现不合格项 → 立即用 `replace_string_in_file` 修复
- 全部通过后输出：`✅ 文件已写入 [路径]，通过 X/43 项验证`

---

## 当前任务

${input:task:请描述要生成的章节（如：帮我写PMPM007炼钢计划编制的IPO表，列表页+新增页）}

输出路径：${input:outputPath:docs/spec/{project项目代号}/}
