---
agent: agent
description: 评估既有或半成品设计文档，输出差距报告与补全任务清单
---

# 接入设计文档

目标：`${input:string:文档路径或目录}`

1. 读取 [文档接入 Skill](../skills/doc-intake/SKILL.md)，按采集、差距、补全三段执行。
2. 先运行 `wl-skills-design verify spec/flowchart` 获取机械结论，再判语义项。
3. 重点检测字典值漂移、名称近似漂移和跨文档断链。
4. 只读输出差距报告与关键问题清单；未经授权不修改既有文件。
5. 业务事实缺口使用 `【待补充：说明】`，不得编造。
