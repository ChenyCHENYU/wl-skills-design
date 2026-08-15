# wl-skills-design

产品设计 Agent Skills 包：9 份设计标准、10 个可发现 Skill、16 个 VS Code Prompt、机器+语义双轨验证（`[M]`/`[J]`）、机械验证 CLI、匿名合成样例和安全安装器。

[English README](./README.en.md)

## 快速开始

需要 Node.js 20 或更高版本。

### 第一步 · 安装到你的项目

```bash
npx @agile-team/wl-skills-design init                              # 推荐：AGENTS.md 通用 profile
npx @agile-team/wl-skills-design init --editor cursor --target ./my-project
```

安装后项目获得 `.github/skills | standards | prompts` 和一份编辑器规则文件。AI Agent 按 manifest 自动路由——之后直接用自然语言下指令，不需要记命令。

### 第二步 · 选场景开工

**场景 A · 从零到一生成设计文档**（不需要任何既有文档）

对 Agent 说：

> 为 DEMO 设备点检模块生成需求说明书骨架。模块范围：点检单从录入到归档；不含维修派工。业务目标：点检记录数字化、异常自动触发报修。

然后按 [输入准备清单](./files/.github/guides/inputs-checklist.md) 分层补事实：

1. 最小启动集（项目代号 / 模块范围 / 业务目标）→ 先出骨架、流程清单和关键问题清单；
2. 业务事实（岗位 / 业务对象 / 状态流 / **操作规则** / 报表需求）→ 展开 IPO 到按钮级、步骤级颗粒度；
3. 技术画像（数据库方言、接口协议等）→ 生成数据库与接口设计。

不必一次备齐：缺失项自动标 `【待补充】`+Pending，Agent 每次只追问一个最关键的问题，绝不编造。操作规则讲得越细（“只有未生产且未下达才允许下达，失败提示『…』”），IPO 颗粒度越深。

**场景 B · 接入别人给的半拉子文档**

> 评估 docs/legacy 下这批设计文档，输出差距报告和补全任务清单。

`doc-intake` 自动采集归位 → 机械+语义差距分析（含字典值漂移、名称近似漂移检测）→ 补全任务清单（P0/P1/P2）；授权后补结构缺口，业务事实只登记关键问题。会议记录、截图、参照系统说明等零散素材也可以直接丢给它归档分析。

**场景 C · 机械验证已有产物**（纯只读，CI 可用）

```bash
wl-skills-design verify spec --target ./my-project
wl-skills-design verify flowchart --file docs/flowchart/REQ-A-01-示例.drawio
wl-skills-design verify db --target ./my-project
wl-skills-design verify api --target ./my-project
```

### 第三步 · 日常管理

```bash
npx @agile-team/wl-skills-design status        # 查看受管文件与本地改动
npx @agile-team/wl-skills-design update --dry-run   # 预检升级（有本地改动时不写入）
npx @agile-team/wl-skills-design restore --list     # 列出备份
npx @agile-team/wl-skills-design uninstall          # 安全卸载（--purge 连备份一起清）
```

`demo/` 目录是一套四域 verify 全绿的完整交付样例（需求说明书 + 数据库 + 接口 + 评审报告），可作质量对照；VS Code Chat 中输入 `/` 可选用 16 个快捷 Prompt。

## 能力

| Skill | 产物 | 验证 |
|-------|------|------|
| `requirements-flowchart` | draw.io 泳道流程图 | 20 项 |
| `requirements-prototype` | D1–D3 原型标注 | 23 项 |
| `requirements-spec-doc` | 需求说明书、IPO（含 GB 颗粒度基线） | 43 项 |
| `data-database-design` | ER、数据字典、DDL | 34 项 |
| `api-interface-design` | 集成报文、RESTful、可选 OpenAPI 3.1 | 38 项 |
| `cross-glossary` | 术语、字段、枚举、编码注册 | 18 项 |
| `cross-design-review` | 评分、问题、追溯矩阵 | D4 18 项 + RV 12 项 |
| `cross-change-impact` | 影响矩阵、补丁任务、复验顺序 | 20 项 |
| `doc-intake` | 半成品文档接入、差距报告、补全任务、draft design-model | 复用各域清单 |
| `code-architecture` | 模块边界、分层、契约和质量门 | AC01–AC20 |

Skill 采用原生 Agent Skills 结构：目录名与 frontmatter `name` 完全一致，只保留最小元数据，并通过相对链接按需加载标准、模板和匿名合成样例。

## IPO 颗粒度基线

需求说明书标准内置 GB 颗粒度基线（§5.1 按钮级覆盖、§5.2 GB1–GB8）：命令按钮处理逻辑按编号步骤书写，一步一事，写明数据对象与字段、字典稳定值、前置校验、审计与履历写入、联动与外部同步、异常文案原文和展示规则；执行类活动与命令按钮一一对应，作为后端命令端点的需求侧投影。匿名对照样例见 `requirements-spec-doc/examples/05-ipo-granularity.md`。

## 从零到一生成

无需既有文档。分层提供输入即可启动：最小启动集（项目代号、模块范围、业务目标）→ 业务事实（岗位、业务对象、状态流、操作规则、报表需求）→ 技术画像（数据库方言/租户/删除策略，接口协议/认证/响应包装/幂等等）。不必一次备齐——缺失项自动标记 `【待补充】`+Pending 并生成关键问题清单，每次只追问一个最关键问题；操作规则讲得越细，IPO 颗粒度越深。完整清单见 [输入准备清单](./files/.github/guides/inputs-checklist.md)（安装后位于 `.github/guides/inputs-checklist.md`）。

## 机械验证（[M]/[J] 双轨）

四份标准的验证清单均带执行方式标记：`[M]` 机械可判、`[J]` 语义判断。四域 [M] 项均由 CLI 直接执行，Agent 只判 [J] 项，两类结论按同一规则编号合并成一份报告：

```bash
wl-skills-design verify spec --target ./my-project        # 结构/编码/表格/追溯闭合等机械项
wl-skills-design verify flowchart --file docs/flowchart/REQ-A-01-示例.drawio
wl-skills-design verify db --target ./my-project          # 命名/字典10列/索引/DDL注释/字典↔DDL一致性/联动矩阵
wl-skills-design verify api --target ./my-project         # 编码唯一/7列字段表/契约类型/示例JSON/错误码登记
```

验证器覆盖活动编码格式与连续性、对照表双向闭合、IPO 空单元格、draw.io 三层 GROUP/泳道色标/连线样式/几何重叠、表名后缀语义与保留字、索引前缀与 DDL 交叉核对、字典↔DDL 字段/类型/长度逐项一致、接口契约类型与示例可解析性等。`demo/` 目录是保持四域 verify 全绿的活样例。未覆盖的 [M] 项（如 OpenAPI 深度解析）显式输出 skip，不伪装通过。

## 半成品文档接入

`doc-intake` Skill 把别人提供的半拉子文档接进规范体系：采集归位（按编码体系分类 + 未归类区）→ 差距分析（机械验证 + 语义判断 + 字典值漂移/名称近似漂移检测）→ 补全计划（复用变更影响分析的补丁任务格式）→ 授权范围内补结构、业务事实只登记关键问题清单，绝不编造；并从既有编码铸造 draft design-model。

## 安全行为

- `validate`、`review`、`impact` 默认只读，不自动修改既有设计文件。
- `repair` 需要用户明确授权；创建流程只可自动修复本轮新产物。
- `init` 和 `update` 先全量预检。发现冲突时退出码为 `2`，不会留下半套文件。
- 受管文件记录在 `.wl-skills-design/state.json`，本地改动默认受保护。
- 变更前生成事务备份，保留最近 5 份；`restore` 覆盖现存文件前再生成一份安全快照，可再次 `restore` 撤销恢复。
- 写入操作持有锁文件，防止并发安装互相破坏。
- 默认只安装一个编辑器 profile，避免规则重复注入。

## CLI

```text
wl-skills-design init       安装
wl-skills-design update     安全升级
wl-skills-design status     查看受管文件状态
wl-skills-design doctor     检查安装和 Skill 清单
wl-skills-design validate-model  只读校验设计模型和引用完整性
wl-skills-design verify     机械执行 spec/flowchart 验证清单 [M] 项
wl-skills-design restore    恢复最近一次变更（--list 查看，--id 指定）
wl-skills-design uninstall  安全卸载（--purge 同时清除备份与状态）
```

通用选项：

```text
--editor <id[,id]>  选择 profile
--target <dir>      指定目标项目
--dry-run           只预检
--force             明确覆盖本地改动，覆盖前备份
--list              restore：列出可用备份
--id <backupId>     restore：恢复指定备份
--purge             uninstall：同时删除备份与状态目录
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

它是可选增强，不是 kit/bd 的硬依赖。运行 `wl-skills-design validate-model --model docs/design-model.json` 可机械检查稳定 ID 和引用；跨包默认约定见安装后的 `.github/guides/delivery-compatibility.md`。

## 包结构

```text
files/
├── .github/
│   ├── standards/             9 份标准（验证清单带 [M]/[J] 标记）
│   ├── skills/                10 个已发布 Skill + manifest/schema
│   ├── prompts/               16 个 Prompt
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

`npm run verify` 会检查：Skill frontmatter/目录、Prompt 元数据、调度正文意图链与能力索引覆盖、相对链接、路由语料、检查项一致性、[M]/[J] 标记、隐私敏感词（归一化匹配）、draw.io 结构、编辑器漂移、CLI 事务行为、机械验证金样本回归和真实 npm 载荷安装冒烟。

版本发布前必须保证工作区除明确提交内容外干净，并使用精简中文 Conventional Commit；发布由 CI（Publish 工作流 + OIDC provenance）完成。

## 许可

[Apache-2.0](./LICENSE)。随包分发的所有模板与样例均为匿名合成内容；贡献即表示接受 Apache-2.0 与本仓库贡献指南。
