# 使用指南

## 快速上手（三个场景）

**从零到一**：不需要任何既有文档。先给最小启动集——项目代号、模块范围（一句话说清管什么不管什么）、业务目标（3~5 条）——让 Agent 先出说明书骨架和关键问题清单；再按 [输入准备清单](./inputs-checklist.md) 分层补业务事实（岗位、业务对象、状态流、操作规则、报表需求）和技术画像（数据库与接口策略）。缺失项自动标 `【待补充】`+Pending，每次只追问一个最关键问题。示例指令：

> 为 DEMO 设备点检模块生成需求说明书骨架。模块范围：点检单从录入到归档；不含维修派工。

**接入半成品**：把别人给的既有文档（哪怕是会议记录和截图）交给 doc-intake：采集归位 → 差距报告（含字典值漂移与名称近似漂移）→ 补全任务清单；授权后补结构缺口，业务事实只登记关键问题。示例指令：

> 评估 docs/legacy 下这批设计文档，输出差距报告和补全任务清单。

**机械验证**：只读，可进 CI：

```bash
wl-skills-design verify spec --target .
wl-skills-design verify flowchart --file docs/flowchart/示例.drawio
wl-skills-design verify db --target .
wl-skills-design verify api --target .
```

## 触发能力

直接描述“动作 + 设计对象”，例如：

- “创建订单审批泳道图” → `requirements-flowchart`
- “检查这份 IPO 表” → `requirements-spec-doc` 的只读验证
- “按 PostgreSQL 设计订单表” → `data-database-design`
- “输出 OpenAPI 3.1 接口契约” → `api-interface-design`
- “评审需求、数据库和接口是否闭环” → `cross-design-review`
- “订单状态新增驳回会影响哪些文档” → `cross-change-impact`

路由有歧义时，Agent 只询问一个关键问题。普通代码 review、运行故障和依赖升级不会触发产品设计 Skill。

## 创建、验证与修复

- 创建：生成新产物，允许对本轮新内容执行验证、修复和复验。
- 验证：默认只读。先运行 `wl-skills-design verify spec/flowchart/db/api` 获取 [M] 机械结论，再由 Agent 判 [J] 项，合并输出规则编号报告。
- 修复：必须明确提出“修复”或同等授权；修改前先说明范围。
- 评审/影响分析：默认只读，只在要求保存报告时创建报告文件。

## 半成品文档接入

他人提供的既有文档先走 `doc-intake`：采集归位、差距报告（含字典值漂移与名称近似漂移）、补全任务清单；结构缺口在授权后补全，业务事实只登记关键问题。详见 [文档接入指南](./skills/doc-intake.md)。

## VS Code Prompt

在 Chat 中输入 `/` 选择 `.github/prompts/` 下的快捷入口。Prompt 使用当前 `agent` 元数据和相对链接；若环境缺少某工具，使用当前 Agent 的等价能力。

## 统一设计模型

跨文档较多时，可维护 `docs/design-model.json`。Schema 位于 `.github/skills/_design-model.schema.json`，说明见 [统一设计模型](./design-model.md)。

## 隐私

安装包中的 `examples/` 都是匿名合成场景。生成新样例前删除或替换客户、项目、地点、合同号、地址、账号、令牌和生产数据。
