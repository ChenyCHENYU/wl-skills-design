---
agent: agent
description: 只读验证变更影响报告的覆盖度、任务可执行性和复验顺序
---

# 验证变更影响报告

目标：`${input:file:请输入 CHANGE_IMPACT 报告路径}`

1. 读取 [变更影响 Skill](../skills/cross-change-impact/SKILL.md) 和 [变更影响标准](../standards/09-change-impact.md)。
2. 执行 CI-A/B/C/X 共 20 项检查，确认六域判断、证据、任务依赖和完成条件。
3. 输出规则 ID、位置、失败、Pending 和建议，不修改报告或设计产物。
4. 用户明确要求修复报告后，才可展示差异、修改报告并复验；不得借此批量修改设计文件。
