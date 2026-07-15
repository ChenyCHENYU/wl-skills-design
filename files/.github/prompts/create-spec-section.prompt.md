---
agent: agent
description: 生成需求设计说明书的总体、流程、IPO、接口、权限、数据或报表章节
---

# 创建需求设计说明书章节

任务：`${input:task:请描述模块、章节类型、功能范围和输入处理输出}`

1. 读取 [需求说明书 Skill](../skills/requirements-spec-doc/SKILL.md)、[说明书标准](../standards/06-spec-doc.md) 和 [文档骨架](../skills/requirements-spec-doc/templates/doc-skeleton.md)。
2. 先定位骨架定义的五类目标文件，再写入对应占位位置；不得创建任意命名的 IPO 或流程文件。
3. 缺少业务事实时写 `【待补充：说明】`，不得编造。
4. 对本轮新内容执行 43 项验证、必要修复和复验。
5. 返回章节路径、规则结果和跨文档差异。
