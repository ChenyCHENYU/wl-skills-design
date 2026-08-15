---
agent: agent
description: 按 wl-skills-design 创建并验证 draw.io 业务泳道流程图
---

# 创建业务流程图

任务：`${input:task:请描述流程名称、参与角色、起止条件和关键活动}`

1. 读取 [流程图 Skill](../skills/requirements-flowchart/SKILL.md) 和 [流程图标准](../standards/01-flowchart.md)。
2. 从 [draw.io 骨架](../skills/requirements-flowchart/templates/skeleton.drawio) 创建可编辑 XML。
3. 活动编码使用 `[流程编码]-[操作类型]-[NN]`，例如 `ORD-A-01-E-01`；`E` 表示系统在线操作，`C` 表示外部系统，`M` 表示人工操作。
4. 写入用户指定路径；未指定时使用 `docs/flowchart/{流程编码}-{流程名称}.drawio`。
5. 对本轮新产物执行 20 项验证、必要修复和复验。缺少 spec 时将 FC-01～FC-05 标记 Pending。
6. 返回产物路径、验证结果和暂挂项。
