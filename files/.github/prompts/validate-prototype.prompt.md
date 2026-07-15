---
agent: agent
description: 只读验证原型标注深度和跨文档追溯，输出 23 项报告
---

# 验证原型标注

目标：`${input:file:请输入原型标注文档路径}`

1. 读取 [原型 Skill](../skills/requirements-prototype/SKILL.md) 和 [原型标准](../standards/02-prototype.md)。
2. 判断 D1/D2/D3 实际等级，执行 PT-A/B/C/X 共 23 项检查。
3. 输出规则 ID、位置、证据、失败项、Pending 项和达到下一等级所需信息。
4. 默认不修改文件；只有用户明确要求修复时才展示差异、修改并复验。
