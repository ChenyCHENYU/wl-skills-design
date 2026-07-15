---
agent: agent
description: 只读集成评审需求、数据库、接口及可选词典和原型产物
---

# 设计集成评审

目标：`${input:files:请提供至少一份设计产物或验证报告}`

1. 读取 [集成评审 Skill](../skills/cross-design-review/SKILL.md) 和 [评审标准](../standards/07-design-review.md)。
2. 汇总 spec 43、DB 34、API 38 项结论，现场执行 D4 18 项联动和 RV 12 项报告自检。
3. 词典和原型存在时作为扩展维度单独报告；缺失维度标记“未提供”，不按通过计分。
4. 输出评分、等级、P0–P3、追溯矩阵、补丁任务和证据位置。
5. 评审默认只读；仅在用户要求保存报告时写入 `docs/review/`，不得自动修改被评文件。
