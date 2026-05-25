---
mode: agent
description: 生成需求设计说明书中的指定章节内容（IPO 表 / 流程说明 / 报表设计等）
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# 需求设计说明书章节生成

## 使用方式

在对话中描述你要生成的内容，例如：

- `帮我写【PMPM007】炼钢计划编制的 IPO 表，包含列表页和新增页`
- `帮我写 PMMB-A-02 月度生产目标流程的流程说明和活动说明表`
- `帮我生成一份完整的文档骨架（包含占位符）`
- `帮我写 4.N 数据需求表，BIP 输入有3张表...`

## 执行步骤

1. 读取 `.github/skills/requirements/spec/SKILL.md`
2. 根据任务类型加载对应 sub-skill
3. 参考 `kit-internal/examples/spec/` 中的真实样例
4. 生成内容后，对照 `.github/standards/06-spec-doc.md` 中的 18 项验证清单自检
5. 发现问题立即修复，无需等待用户确认

## 当前任务

{{TASK_DESCRIPTION}}
