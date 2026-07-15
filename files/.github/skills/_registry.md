# Agent Skill 索引

> `_manifest.json` 是机器可读事实源；本文件只供人阅读。目录名必须与 `SKILL.md` 的 `name` 完全一致。

| Skill | 状态 | 路径 | 主要动作 | 领域门禁 |
|-------|------|------|---------|---------|
| 流程图设计 | ✅ v1.1 | `requirements-flowchart/SKILL.md` | create / validate / review / repair | 不处理代码或 CI 流程 |
| 需求设计说明书 | ✅ v1.1 | `requirements-spec-doc/SKILL.md` | create / validate / review / repair | 不处理 OpenAPI/DDL |
| 原型设计 | ✅ v1.1 | `requirements-prototype/SKILL.md` | create / validate / review / repair | 不生成视觉品牌稿或代码 |
| 数据库设计 | ✅ v1.1 | `data-database-design/SKILL.md` | create / validate / review / repair | 不排查运行故障 |
| 接口设计 | ✅ v1.1 | `api-interface-design/SKILL.md` | create / validate / review / repair | 不排查网络或 SDK 故障 |
| 术语字段词典 | ✅ v1.1 | `cross-glossary/SKILL.md` | create / maintain / validate / review | 不做自然语言翻译 |
| 设计集成评审 | ✅ v1.1 | `cross-design-review/SKILL.md` | review | 不处理 code/PR review |
| 变更影响分析 | ✅ v1.1 | `cross-change-impact/SKILL.md` | impact / validate | 不分析代码依赖升级 |
| 代码结构设计 | 🔲 规划中 | `code-architecture/SKILL.md` | create | 不可执行 |

## 路由规则

1. 先识别动作：impact → review → validate → repair → maintain → create。
2. 再匹配领域精确词和负向词；使用 NFKC、小写和词组边界归一化。
3. 候选必须达到 70 分，第一名至少领先 15 分；否则只询问一个关键问题。
4. `validate`、`review`、`impact` 默认只读；repair 必须得到明确授权。
5. 路由回归语料位于 `_route-evals.json`，发布前由 doctor 执行。

单一领域的“评审”由对应领域 Skill 只读执行；仅当用户明确要求集成、跨文档或全套设计评审，且至少提供两个设计域时，才进入设计集成评审。

## 维护规则

- 新 Skill 使用小写连字符目录，`name` 与目录名一致，只保留 `name` 和 `description` frontmatter。
- 详细规则放 `standards/`，Skill 保留工作流并用相对 Markdown 链接按需引用资源。
- 修改路径、触发词、检查项数量或 profile 时，同步 manifest、Prompt、模板、指南、测试和 README。
