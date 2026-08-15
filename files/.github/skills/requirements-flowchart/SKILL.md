---
name: requirements-flowchart
description: 生成或检查 draw.io 业务泳道流程图，覆盖参与方、活动、判定、连线、活动编码及需求说明书追溯。用于用户要求流程图、泳道图、draw.io 文件或流程验证；不要用于代码执行流程、CI workflow 或算法流程。
---

# 业务流程图

## 先确定模式

- `create`：生成流程图，并仅对本轮新产物执行修复闭环。
- `validate`：只读检查现有文件，未经明确授权不得修改。
- `review`：与 `validate` 相同，只读给出评审结论，不默认保存报告。
- `repair`：用户明确要求后，先给出问题和差异，再修改并复验。

至少确认流程名称或目标。角色、范围、起止条件和节点可从上下文推断；无法推断时只追问最关键的一项。

## 执行流程

1. 读取唯一规则源：[流程图标准](../../standards/01-flowchart.md)。
2. 新建文件时读取 [draw.io 骨架](./templates/skeleton.drawio)；需要版式参考时读取 [匿名样例说明](./examples/index.md)。
3. 使用标准活动编码 `[流程编码]-[操作类型]-[NN]`，例如 `ORD-A-01-E-01`。
4. 生成可被 draw.io 打开的 XML，不得只输出 Mermaid、ASCII 或图片。
5. 执行标准第十五章 20 项验证：先运行 `wl-skills-design verify flowchart --file {产物路径}` 获取 [M] 项机械结论（CLI 不可用时由 Agent 代执行），再判 [J] 项；缺少 spec 时将 FC-01～FC-05 标为 `Pending`，不得伪造通过。
6. 检查 XML 可解析、ID 唯一、引用存在、连接线落在节点上，并尽可能完成渲染检查。

## 交付约束

- 默认写入 `docs/flowchart/{流程编码}-{流程名称}.drawio`。
- 报告逐项给出规则 ID、结果、证据位置和建议。
- 创建模式可修复本轮生成文件；验证模式只报告，除非用户明确要求修复。
- 最终说明 Skill、标准、产物路径、20 项结果和 Pending 项。
