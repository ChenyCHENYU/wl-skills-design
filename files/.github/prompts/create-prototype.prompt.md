---
agent: agent
description: 从需求功能生成 D1–D3 原型标注文档并验证
---

# 创建原型标注

任务：`${input:task:请描述关联功能、页面名称、目标等级和交互模式}`

1. 读取 [原型 Skill](../skills/requirements-prototype/SKILL.md) 和 [原型标准](../standards/02-prototype.md)。
2. 使用 [匿名模板](../skills/requirements-prototype/templates/page-annotation.md) 生成页面、字段、按钮、状态和交互说明。
3. 未指定等级时默认 D3，并在结果中标注这一假设。
4. 写入用户指定路径；未指定时使用 `docs/prototype/{功能编码}-{页面名称}.md`。
5. 对本轮新产物执行 PT-A/B/C/X 共 23 项验证、必要修复和复验。
