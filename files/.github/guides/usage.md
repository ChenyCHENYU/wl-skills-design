# 使用指南

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
- 验证：默认只读，输出规则 ID、证据位置、差异和建议。
- 修复：必须明确提出“修复”或同等授权；修改前先说明范围。
- 评审/影响分析：默认只读，只在要求保存报告时创建报告文件。

## VS Code Prompt

在 Chat 中输入 `/` 选择 `.github/prompts/` 下的快捷入口。Prompt 使用当前 `agent` 元数据和相对链接；若环境缺少某工具，使用当前 Agent 的等价能力。

## 统一设计模型

跨文档较多时，可维护 `docs/design-model.json`。Schema 位于 `.github/skills/_design-model.schema.json`，说明见 [统一设计模型](./design-model.md)。

## 隐私

安装包中的 `examples/` 都是匿名合成场景。生成新样例前删除或替换客户、项目、地点、合同号、地址、账号、令牌和生产数据。
