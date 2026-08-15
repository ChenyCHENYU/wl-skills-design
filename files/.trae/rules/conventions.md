---
description: "产品设计 AI 技能规范（8 条设计规范 + Skill 自动调度，由 wl-skills-design 维护）"
globs:
  - "**/*.drawio"
  - "**/*.md"
  - "**/*.sql"
  - "**/*.yaml"
alwaysApply: true
---

<!-- Trae 规则文件。由 wl-skills-design 维护，请勿手动编辑正文内容。 -->
<!-- 源文件：.github/copilot-instructions.md -->

---

# wl-skills-design 产品设计调度说明

> 版本：v0.11.0。详细能力按需从 Agent Skill 加载，不要把全部规范注入无关任务。

## 调度入口

1. 读取 `.github/skills/_manifest.json`，只选择 `status=released` 的能力。
2. 先判定动作意图：`impact` → `review` → `validate` → `repair` → `maintain` → `create`。
3. 再判定领域；普通代码 review、PR review 和代码重构不得进入产品设计评审。
4. 应用 manifest 中的精确词、负向词、优先级和最小领先分差。并列或信息不足时只追问一个关键问题。
5. 选定后读取对应 `SKILL.md`；详细标准、模板和样例只在该 Skill 要求时加载。

## 执行约束

- `validate` 和 `review` 默认只读，只输出规则编号、位置、证据和建议。
- 只有用户明确要求修复，或正在修复本轮新生成产物时，才可进入 `repair`。
- 标准文件是规则事实源；Skill 只定义工作流，Prompt 只定义人工快捷入口。
- 缺失业务事实使用 `【待补充：说明】`，不得编造客户、系统、字段或审批结论。
- 模板不得包含组织名称、项目标识、地点、业务单号或线上业务数据。
- 工作区存在 `docs/design-model.json` 时，优先用稳定 ID 做跨文档集合校验；冲突先报告，不静默覆盖。
- 各包必须独立可用；WL 兼容协议是内置约定而非包依赖。没有 design-model 时不得阻断前后端契约建立。
- 输出必须说明所用 Skill、标准、产物路径、验证结果和暂挂项。

## 能力索引

- `requirements-flowchart`：draw.io 泳道流程图
- `requirements-prototype`：D1–D3 页面与交互标注
- `requirements-spec-doc`：需求设计说明书与 IPO
- `data-database-design`：ER、数据字典、DDL
- `api-interface-design`：集成报文与 RESTful 接口
- `cross-glossary`：术语、字段、枚举与编码注册
- `cross-design-review`：跨文档评审和追溯矩阵
- `cross-change-impact`：增量变更影响矩阵和补丁计划
- `doc-intake`：半成品文档接入、差距分析和补全任务
- `code-architecture`：模块边界、分层依赖、契约和质量门设计

人读索引见 `.github/skills/_registry.md`，使用说明见 `.github/guides/usage.md`。
