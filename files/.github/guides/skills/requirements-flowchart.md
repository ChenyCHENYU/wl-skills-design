# 流程图设计 Skill — 使用说明

AI 执行入口为 `requirements-flowchart/SKILL.md`。

## 能力与边界

该 Skill 生成或检查可由 draw.io 打开的业务泳道图，覆盖角色、活动、判定、连线、编码、图例和需求追溯。

- `create`：生成 `.drawio` 并验证本轮产物。
- `validate` / `review`：只读执行 20 项检查，不默认保存报告。
- `repair`：得到明确授权后修复既有文件并复验。

代码执行流、算法流程和 CI workflow 不属于该 Skill。

## 推荐请求

```text
为 DEMO-A-01 申请审核流程生成泳道图，角色为申请角色、审核角色和系统。
只读检查这个 draw.io，列出断链、重复 ID 和需求追溯缺口，不要修改。
```

至少提供流程名称或目标；角色、范围、起止条件和活动不能确认时会追问最关键的一项，或标记 Pending。

## 输出与验证

默认创建路径为 `docs/flowchart/{流程编码}-{流程名称}.drawio`。文件必须满足：

- XML 可解析，ID 唯一，source/target/parent 引用存在；
- 节点、连线和泳道语义一致；
- 活动编码与需求说明书双向匹配；
- 能在 draw.io 中打开，并尽可能完成渲染检查。

空白起点使用 `templates/skeleton.drawio`；`examples/01-purchase-approval.drawio` 是匿名合成版式对照，不是业务事实来源。
