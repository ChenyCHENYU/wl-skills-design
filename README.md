# wl-skills-design

产品设计 Agent Skills 包：9 份设计标准、8 个可发现 Skill、15 个 VS Code Prompt、匿名合成样例和安全安装 CLI。

## 快速开始

需要 Node.js 20 或更高版本。

```bash
# 推荐：安装通用 AGENTS.md profile
npx @agile-team/wl-skills-design init

# 选择一个目标工具，避免同一工具重复加载多套规则
npx @agile-team/wl-skills-design init --editor copilot
npx @agile-team/wl-skills-design init --editor cursor --target ./my-project

# 预检升级；有本地改动时不会写入任何文件
npx @agile-team/wl-skills-design update --dry-run
npx @agile-team/wl-skills-design update
```

默认 profile 是 `agents`。只有明确理解重复上下文风险时才使用 `--editor all`。

## 能力

| Skill | 产物 | 验证 |
|-------|------|------|
| `requirements-flowchart` | draw.io 泳道流程图 | 20 项 |
| `requirements-prototype` | D1–D3 原型标注 | 23 项 |
| `requirements-spec-doc` | 需求说明书、IPO | 43 项 |
| `data-database-design` | ER、数据字典、DDL | 34 项 |
| `api-interface-design` | 集成报文、RESTful、可选 OpenAPI 3.1 | 38 项 |
| `cross-glossary` | 术语、字段、枚举、编码注册 | 18 项 |
| `cross-design-review` | 评分、问题、追溯矩阵 | D4 18 项 + RV 12 项 |
| `cross-change-impact` | 影响矩阵、补丁任务、复验顺序 | 20 项 |

Skill 采用原生 Agent Skills 结构：目录名与 frontmatter `name` 完全一致，只保留最小元数据，并通过相对链接按需加载标准、模板和匿名合成样例。

## 安全行为

- `validate`、`review`、`impact` 默认只读，不自动修改既有设计文件。
- `repair` 需要用户明确授权；创建流程只可自动修复本轮新产物。
- `init` 和 `update` 先全量预检。发现冲突时退出码为 `2`，不会留下半套文件。
- 受管文件记录在 `.wl-skills-design/state.json`，本地改动默认受保护。
- 变更前生成事务备份，保留最近 5 份，可用 `restore` 恢复。
- 默认只安装一个编辑器 profile，避免规则重复注入。

## CLI

```text
wl-skills-design init       安装
wl-skills-design update     安全升级
wl-skills-design status     查看受管文件状态
wl-skills-design doctor     检查安装和 Skill 清单
wl-skills-design restore    恢复最近一次变更
wl-skills-design uninstall  安全卸载
```

通用选项：

```text
--editor <id[,id]>  选择 profile
--target <dir>      指定目标项目
--dry-run           只预检
--force             明确覆盖本地改动，覆盖前备份
--json              机器可读输出
```

### 编辑器 profile

| ID | 目标文件 | 激活方式 |
|----|---------|---------|
| `agents` | `AGENTS.md` | 通用，默认 |
| `copilot` | `.github/copilot-instructions.md` | GitHub Copilot |
| `claude` | `CLAUDE.md` | Claude Code |
| `cursor` | `.cursor/rules/conventions.mdc` | Agent Requested |
| `windsurf` | `.windsurf/rules/conventions.md` | Workspace Rule |
| `cline` | `.clinerules/conventions.md` | 精简持久规则 |
| `kiro` | `.kiro/steering/conventions.md` | `inclusion: auto` |
| `qoder` | `.qoder/rules/conventions.md` | 项目规则 |
| `trae` | `.trae/rules/conventions.md` | 项目规则 |

兼容路径基于 2026-07-15 的官方实践：GitHub/VS Code Agent Skills、VS Code Prompt Files、Cursor Project Rules、Kiro Steering、Cline Rules 和 Qoder Rules。`.cursorrules`、`.windsurfrules` 等旧版单文件不再生成。

## 路由

机器路由源是 `.github/skills/_manifest.json`：

1. 先识别 `impact → review → validate → repair → maintain → create`。
2. 再匹配领域精确词和负向词。
3. 候选达到 70 分且领先至少 15 分才运行；否则只问一个关键问题。
4. 普通 code review、PR review、运行故障和依赖升级不会误入产品设计 Skill。

路由语料保存在 `_route-evals.json` 并由 doctor 回归验证。

## 资料分层

```text
SKILL.md       核心工作流，按需加载
standards/     唯一规则源
sub/           具体领域步骤
templates/     纯结构占位符，禁止业务数据
examples/      匿名合成场景，用于质量对照
guides/        人读说明，不参与 Skill 发现
```

所有随包样例都应是匿名合成内容，不得出现组织、项目、地点、业务单号、线上地址、账号、令牌或其他可识别信息。`npm run check` 同时检查敏感词、模板纯净度，以及内部 DOCX 的作者元数据、修订标识、自定义属性和嵌入媒体。

## 统一设计模型

新项目可选择维护 `docs/design-model.json`，schema 位于 `.github/skills/_design-model.schema.json`。它使用稳定 ID 表达字段、功能、流程、页面、表、API 和追踪关系，供跨文档集合验证使用；Markdown、DDL、OpenAPI 和 draw.io 仍是交付层。

详见安装后的 `.github/guides/design-model.md`。

## 包结构

```text
files/
├── .github/
│   ├── standards/             9 份标准
│   ├── skills/                8 个已发布 Skill + manifest/schema
│   ├── prompts/               15 个 Prompt
│   └── guides/                使用、架构和各 Skill 指南
├── AGENTS.md / CLAUDE.md      适配器产物
├── .cursor/ .windsurf/ ...    各 profile 产物
bin/wl-skills-design.js        安全安装 CLI
scripts/                       同步、doctor、发布验证
tests/                         CLI、路由和结构测试
```

## 开发与发布

```bash
npm install
npm run sync
npm run verify
npm pack --dry-run
```

`npm run verify` 会检查：Skill frontmatter/目录、Prompt 元数据、相对链接、路由语料、检查项一致性、模板敏感信息、编辑器漂移、CLI 事务行为和最终包安装冒烟。

版本发布前必须保证工作区除明确提交内容外干净，并使用精简中文 Conventional Commit。

## 许可

`UNLICENSED`：当前包未授予开源再分发许可。公开可见不等于获得使用或再许可权；如计划开放复用，应由权利人另行选择许可证。
