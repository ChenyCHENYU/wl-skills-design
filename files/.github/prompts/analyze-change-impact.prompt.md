---
agent: agent
description: 只读分析设计变更对六个设计域的影响并输出补丁计划
---

# 分析变更影响

变更：`${input:change:请提供变更对象、动作和目标描述}`

1. 读取 [变更影响 Skill](../skills/cross-change-impact/SKILL.md) 和 [变更影响标准](../standards/09-change-impact.md)。
2. 对 spec、glossary、DB、API、prototype、review 六个域逐一判断影响并给出证据。
3. 输出 P0/P1/P2 补丁任务、依赖顺序、完成条件和复验入口。
4. 执行 CI-A/B/C/X 共 20 项检查。默认只读；只在用户要求保存报告时写入 `docs/change-impact/`。
