# @agile-team/wl-skills-design

> **产品设计 AI 技能包** — 一条命令，把「设计规范 + AI 自动调度 + 真实样例 + 变更协同」装进任意设计项目，支持 10 种 AI 编辑器。

让 AI 编辑器（Copilot / Cursor / Windsurf / Claude Code / Cline / Kiro / Trae / Qoder / 通用 Agents）**真正按团队规范做产品设计**：从流程图、需求说明书、原型标注，到数据库、接口、集成评审、术语词典、变更影响分析，全链路 AI 辅助、生成即合规。

[![npm](https://img.shields.io/badge/npm-%40agile--team%2Fwl--skills--design-cb3837)](https://www.npmjs.com/package/@agile-team/wl-skills-design)

---

## TL;DR

```bash
npx @agile-team/wl-skills-design          # 一键安装到当前设计项目
```

安装后，直接在 AI 对话里说人话即可触发对应能力：

```text
"帮我画一个废钢采购流程图，涉及采购部、质检部、仓储部"
"帮我编写订单管理模块的需求设计说明书 IPO 表"
"帮我标注订单列表页的原型，达到开发就绪（D3）"
"帮我设计订单模块的数据库表结构和数据字典"
"帮我设计订单状态变更接口（RESTful）"
"帮我建订单模块的术语字段词典，统一 spec/数据库/接口的字段命名"
"订单状态新增退回，帮我分析会影响哪些设计文档并出补丁计划"
"对订单模块三份设计文档做一次整体评审，给我出评分报告"
```

---

## 目录

- [它解决什么问题](#它解决什么问题)
- [核心设计理念](#核心设计理念)
- [设计能力](#设计能力)
- [每个 Skill 的双层资料：模板 + 样例](#每个-skill-的双层资料模板--样例)
- [一次 AI 调度长什么样](#一次-ai-调度长什么样)
- [支持的编辑器](#支持的编辑器)
- [仓库结构 vs 安装结构](#仓库结构-vs-安装结构必看)
- [安装与使用](#安装与使用)
- [设计全链路工作流](#设计全链路工作流最佳实践)
- [维护指南](#维护指南)
- [spec-gen 辅助工具集](#spec-gen--设计文档生成工具集)

---

## 它解决什么问题

产品设计阶段的交付物（流程图、需求说明书、原型、库表、接口、评审报告）长期面临三个痛点：

| 痛点 | 本包的解法 |
|------|-----------|
| **规范散落在脑子里**，每个人画得都不一样 | 9 条工具无关的设计规范（`standards/`）作为唯一权威来源 |
| **AI 不知道团队规范**，生成的东西要大改 | AI Skill 自动识别意图 → 加载规范 → 按规范生成（`skills/`）|
| **字段对不齐**，spec 写一个名、库表又一个名、接口再一个名 | 术语词典作中央锚点 + 集成评审 D4 三角联动校验 |
| **设计变更靠人肉同步**，改一个状态漏三份文档 | 变更影响分析输出影响矩阵 + 补丁任务 + 复验顺序 |

一句话：**让 AI 按团队的最佳实践做设计，并且生成完就自检、自修复、可追溯。**

---

## 核心设计理念

整个包建立在 5 条架构原则之上（详见 [`kit-internal/architecture.md`](./kit-internal/architecture.md) 的 ADR 记录）：

1. **规范与工具分离** — `standards/` 存放工具无关的规范（draw.io / Axure / SQL / YAML 均适用）；`skills/` 是工具相关的触发层。规范可被任意工具复用。
2. **单一执行源** — Skill 路由以 `skills/_manifest.json` 为机器可读执行源；`_registry.md` 只是人读索引；多编辑器配置正文只在 `copilot-instructions.md` 维护，其余 9 份配置由脚本派生。
3. **闭环工作流** — 每个能力都遵循「生成 → 验证 → 修复 → 复验」四阶段，带编号验证清单，不允许跳过验证直接交付。
4. **三角联动** — spec → 数据库 → 接口形成可追溯三角，字段对齐以术语词典为锚点（O(N) 而非两两互比 O(N²)）。
5. **双层资料** — 每个 Skill 同时提供「空白模板（起点）」和「真实样例（标杆）」，让每一层都能朝最佳实践收敛 → 见 [下一节](#每个-skill-的双层资料模板--样例)。
6. **增量协同** — 变更先过影响分析，再按补丁计划调用单域 Skill 修复，最后复验，避免靠记忆同步。

---

## 设计能力

| 设计域 | 能力 | 关联规范 | 验证项 | 状态 |
|-------|------|---------|-------|------|
| 系统需求 | **流程图**（draw.io 泳道图）| `01-flowchart.md` | 20 项 | ✅ v1.0 |
| 系统需求 | **需求设计说明书**（IPO / 流程说明 / 活动说明 / 报表）| `06-spec-doc.md` | 43 项 | ✅ v1.0 |
| 系统需求 | **原型标注**（交互模式 / 字段 / 组件 / D1–D3 深度）| `02-prototype.md` | 23 项 | ✅ v1.0 |
| 数据设计 | **数据库**（ER / DB 清单 / 数据字典 / DDL）| `03-database.md` | 34 项 | ✅ v1.0 |
| 接口设计 | **接口**（系统集成报文 / RESTful / OpenAPI）| `04-api-design.md` | 38 项 | ✅ v1.0 |
| 跨域评审 | **设计集成评审**（评分 / 追溯矩阵 / 跨文档一致性）| `07-design-review.md` | D4 18 项 | ✅ v1.0 |
| 跨域词典 | **术语字段词典**（中英文名 / 枚举 / 编码统一锚点）| `08-glossary.md` | 18 项 | ✅ v1.0 |
| 跨域协同 | **变更影响分析**（影响矩阵 / 补丁计划 / 复验顺序）| `09-change-impact.md` | 20 项 | ✅ v1.0 |
| 代码设计 | 业务逻辑代码结构 | `05-code-design.md` | — | 🔲 规划中 |

---

## 每个 Skill 的双层资料：模板 + 样例

这是本包的关键架构。每个 Skill 目录下并排放两层资料，**职责严格分离，两层都随包发布**：

```
skills/<category>/<skill>/
├── templates/   ← 默认模板（空白起点）：纯结构 + {占位符}，零业务数据
└── examples/    ← 真实样例（质量标杆）：真实场景填充内容，AI「必须做得不低于它」
```

| | `templates/` 默认模板 | `examples/` 真实样例 |
|---|---------------------|---------------------|
| **角色** | 空白起点（脚手架）| 质量标杆（参照系）|
| **内容** | 纯结构 + `{占位符}`，**零业务数据** | 真实场景填好的内容 |
| **来源** | 由该 Skill 的 skills 规则派生 | 源自真实项目（如烟台华新数智化改造）|
| **AI 怎么用** | 复制后替换占位符开始写 | 生成后**对照自检，且必须做得不低于它** |
| **结尾** | 填写要求提示 | 固定附「自检：本样例为何达标」清单 |

> **为什么这样更好？** 模板告诉 AI「该有哪些结构」，样例告诉 AI「好到什么程度才算达标」。
> 两者并存，AI 既不会漏结构，也不会只满足于「能跑」——它有一个明确的、来自真实项目的高水位线要去超越。
> 每个样例末尾的「自检清单」把标杆显式化为可逐条对照的检查点，规范升级时同步抬高，确保样例永远代表最佳实践。

各域当前资料分布：

| Skill | 空白模板（templates）| 真实样例（examples）|
|-------|--------------------|--------------------|
| 流程图 | `skeleton.drawio`（图例页 + 空白泳道）| `01-purchase-approval.drawio` 采购审批全规范流程 + `README.md` |
| 需求说明书 | `doc-skeleton.md`（5 文件拆分蓝图）| `00`大纲 / `01`流程说明 / `02`IPO / `03`画面对照 / `04`接口 共 5 份 |
| 原型标注 | `page-annotation.md`（7 区块空白）| `01-page-annotation.md` 炼钢计划列表 D3 完整标注 |
| 数据库 | `db-skeleton.md` / `data-dictionary.md` / `table-definition.md` | `01-data-dictionary.md` 订单主表+明细表（系统字段+索引+联动）|
| 接口 | `if-skeleton.md` / `interface-list.md` / `integration-def.md` / `restful-def.md` | `01-restful.md` 订单状态变更 + `02-integration.md` 订单下达推送 |
| 集成评审 | `review-report.md`（仪表盘空白）| `01-review-report.md` 订单模块第 1 轮评审（P0 闸门演示）|
| 术语词典 | `glossary.md`（四类词条空白）| `01-glossary.md` 订单+计划域完整词典 |
| 变更影响 | `change-impact-report.md`（影响矩阵空白）| `01-status-change-impact.md` 设备点检新增退回状态影响分析 |

---

## 一次 AI 调度长什么样

```text
用户说："帮我设计订单模块的数据库"
    │
    ▼ AI 读取 .github/skills/_manifest.json → 精准匹配 Skill / 状态 / 前置上下文
    ▼ 读 .github/skills/data/database/SKILL.md（薄触发层）
    ▼ 加载 .github/standards/03-database.md（权威规范）
    ▼ 用 templates/ 起骨架，对照 examples/ 校准质量水位
    ▼ 从 spec IPO 表推导实体 → ER / 数据字典 / DDL
    ▼ 执行 34 项验证，自动注入 7 个系统字段、索引、命名前缀
    ↓
《数据库设计》 + DB_REVIEW 验证报告（生成即合规）

用户说："对这个模块做整体评审、出评分"
    │
    ▼ 采集 spec/DB/IF 三份 validate 结论（Sub-01）
    ▼ D4 跨文档三角联动 18 项（Sub-02）
    ▼ 综合评分 + P0 一票否决 + 追溯矩阵（Sub-03）
    ↓
《DESIGN_REVIEW》：仪表盘 + P0 阻断清单 + spec→接口→表 追溯矩阵 + 修复任务

用户说："订单状态新增退回，分析影响并出补丁计划"
    │
    ▼ AI 匹配 cross.changeImpact，确认变更对象/动作/目标描述
    ▼ 加载 .github/standards/09-change-impact.md
    ▼ 逐域判断 spec / glossary / DB / API / prototype / review
    ▼ 输出 P0/P1/P2 补丁任务 + 推荐复验顺序
    ↓
《CHANGE_IMPACT》：影响矩阵 + 补丁计划 + validate/design-review 复验入口
```

---

## 支持的编辑器

自动生成 10 种 AI 编辑器的配置文件，内容统一来自 `.github/copilot-instructions.md`（单一数据源）：

| 编辑器 | 安装后的配置文件 | 头部格式 |
|-------|--------------|---------|
| GitHub Copilot | `.github/copilot-instructions.md` | 无（源文件即输出）|
| Claude Code | `CLAUDE.md` | `<!-- -->` 注释 |
| Cursor | `.cursorrules` | `#` 行注释 |
| Cursor MDC | `.cursor/rules/conventions.mdc` | YAML frontmatter + globs |
| Windsurf | `.windsurfrules` | `#` 行注释 |
| Cline | `.clinerules` | `#` 行注释 |
| Kiro | `.kiro/steering/conventions.md` | YAML（`inclusion: always`）|
| Trae | `.trae/rules/conventions.md` | YAML（`alwaysApply: true`）|
| Generic Agents | `AGENTS.md` | `<!-- -->` 注释 |
| Qoder | `.qoder/rules/conventions.md` | `#` 行注释 |

---

## ⚠️ 仓库结构 vs 安装结构（必看）

本包是一个 npm 模板包：**仓库结构 ≠ `npx` 后目标项目里的结构**。

### A. 本仓库结构（开发 / 维护 wl-skills-design 时）

```
wl-skills-design/                              ← 你正看的这个仓库
├── README.md                                  本文档
├── CHANGELOG.md
├── package.json                               name: @agile-team/wl-skills-design
├── .npmignore                                 排除 kit-internal/ spec-gen/ scripts/ 不发布
│
├── bin/
│   └── wl-skills-design.js                    CLI 实现（init / update / --dry-run）
│
├── scripts/                                   ★ 维护者构建工具（不发布）
│   ├── sync-editors.js                        单一源 → 重建 9 个编辑器配置
│   └── check.js                               doctor：registry/index/引用/漂移 一致性自检
│
├── tests/                                     CLI + 脚本测试（不发布）
│
├── files/                                     ★★★ 真正会被复制到目标项目的内容 ★★★
│   ├── .github/
│   │   ├── copilot-instructions.md            源 AI 主入口（编辑这里）
│   │   ├── standards/                         9 条设计规范 + index.md 门控
│   │   │   ├── 01-flowchart.md ✅  02-prototype.md ✅  03-database.md ✅
│   │   │   ├── 04-api-design.md ✅  05-code-design.md 🔲  06-spec-doc.md ✅
│   │   │   └── 07-design-review.md ✅  08-glossary.md ✅  09-change-impact.md ✅
│   │   ├── skills/
│   │   │   ├── _manifest.json                 ★ 机器可读执行路由：触发词/状态/上下文/输出/闭环
│   │   │   ├── _registry.md                   人读触发词索引（doctor 校验其与 manifest 一致）
│   │   │   ├── _compat/                       多编辑器适配源（editors.json + headers/）
│   │   │   ├── requirements/
│   │   │   │   ├── flowchart/                 SKILL + USAGE + templates/ + examples/
│   │   │   │   ├── spec/                      SKILL + USAGE + 4 sub + templates/ + examples/
│   │   │   │   └── prototype/                 SKILL + USAGE + 2 sub + templates/ + examples/
│   │   │   ├── data/database/                 SKILL + USAGE + 4 sub + templates/ + examples/
│   │   │   ├── api/restful/                   SKILL + USAGE + 4 sub + templates/ + examples/
│   │   │   ├── cross/design-review/           SKILL + USAGE + 3 sub + templates/ + examples/
│   │   │   ├── cross/glossary/                SKILL + USAGE + 3 sub + templates/ + examples/
│   │   │   ├── cross/change-impact/           SKILL + USAGE + 3 sub + templates/ + examples/
│   │   │   └── code/                          代码设计类 🔲（stub）
│   │   ├── prompts/                           VS Code Copilot 提示词（15 个）
│   │   └── guides/                            人读指南（usage / architecture）
│   ├── CLAUDE.md / AGENTS.md / .cursorrules / ...  ← 由 _compat/ 派生（9 份）
│   └── ...
│
└── kit-internal/                              ★★ 仅仓库可见，不发布到 npm ★★
    ├── README.md                              维护者首页
    ├── architecture.md                        架构决策记录（ADR-001~014）
    ├── CONTRIBUTING.md                        贡献流程（含双层资料约定）
    ├── skills/README.md                       Skill 开发状态 + 规划清单
    └── test-flowcharts/                       流程图测试样张（样例来源）
```

> **每个 Skill 目录的标准形态**（双层资料约定，见 ADR-012）：
> ```
> skills/<category>/<skill>/
> ├── SKILL.md      ← AI 触发文件（薄包装：读规范 + 指模板/样例）
> ├── USAGE.md      ← 人读使用说明
> ├── sub/          ← Sub-Skill 分解（按任务拆）
> ├── templates/    ← 空白模板（{占位符}，起点）
> └── examples/     ← 真实样例（填好内容，质量标杆）
> ```

> **维护准则**：
> - 改规范 → `files/.github/standards/0x-xxx.md`
> - 改 Skill → `files/.github/skills/<category>/<name>/SKILL.md`
> - 改空白模板 → 对应 `templates/`（保持纯占位，不要填真实数据）
> - 改/加真实样例 → 对应 `examples/`（填真实内容 + 自检清单）
> - 改多编辑器适配 → `files/.github/skills/_compat/`，然后 `npm run sync`
> - 写维护文档 → `kit-internal/`（不污染目标项目）

### B. 目标项目结构（执行 `npx @agile-team/wl-skills-design` 之后）

```
你的设计项目/
├── .github/
│   ├── copilot-instructions.md           AI 主入口
│   ├── standards/                        9 条设计规范 + index.md 门控
│   ├── skills/                           _manifest.json + 8 个 Skill（每个含 SKILL/USAGE/sub/templates/examples）
│   ├── prompts/                          VS Code Copilot 提示词
│   └── guides/                           使用指南
├── CLAUDE.md / AGENTS.md                 Claude / 通用 Agents 规则
├── .cursorrules / .cursor/…/mdc          Cursor 规则（两种格式）
├── .windsurfrules / .clinerules          Windsurf / Cline 规则
├── .kiro / .trae / .qoder                Kiro / Trae / Qoder 规则
└── ...（你的设计文件）
```

> 注意：`kit-internal/`、`spec-gen/`、`scripts/`、`tests/` **不会**出现在目标项目里。
> 真实样例（examples/）**会**随包发布——这样 AI 在你的项目里就有质量标杆可对照。

---

## 安装与使用

```bash
# 第一次安装
npx @agile-team/wl-skills-design

# 更新到最新版本（覆盖已安装文件，本地改动自动备份为 .bak.<时间戳>）
npx @agile-team/wl-skills-design update

# 预览安装内容，不实际写入
npx @agile-team/wl-skills-design --dry-run

# 查看版本 / 帮助
npx @agile-team/wl-skills-design --version
npx @agile-team/wl-skills-design --help
```

安装完成后，直接在 AI 对话中描述设计需求即可触发对应 Skill。

---

## 设计全链路工作流（最佳实践）

> 每个环节：生成 → 验证 → 自动修复，全链路闭环。VS Code Copilot 中按 `/` 调用对应 prompt。

| # | 环节 | 创建 prompt | 验证 prompt | 关键产出 |
|---|------|-----------|-----------|---------|
| 1 | 流程图 | `/create-flowchart` | `/validate-flowchart` | 符合规范的 .drawio |
| 2 | 需求说明书 | `/create-spec-section` | `/validate-spec-section` | IPO 表 / 流程说明 / 报表 |
| 3 | 原型标注 | `/create-prototype` | `/validate-prototype` | D3 开发就绪页面标注 |
| 4 | 数据库 | `/create-db-design` | `/validate-db-design` | ER / 数据字典 / DDL |
| 5 | 接口 | `/create-if-design` | `/validate-if-design` | 集成报文 / RESTful |
| 6 | 术语词典 | `/create-glossary` | `/validate-glossary` | 字段对齐中央锚点 |
| 7 | 变更影响 | `/analyze-change-impact` | `/validate-change-impact` | 影响矩阵 / 补丁计划 |
| 8 | 集成评审 | `/design-review` | — | 带评分的 DESIGN_REVIEW 报告 |

**推荐顺序**：先建词典骨架 → 再做 spec / 原型 → 推导数据库 / 接口（边做边登记词典）→ 变更时先跑影响分析 → 最后集成评审出评分。
词典先行能让「字段对不齐」从「评审时发现」提前到「设计时杜绝」。

---

## 维护指南

### 新增设计规范

```bash
# 当前已有 01~09，下一个是 10
# 编辑 files/.github/standards/10-xxx.md
# 更新门控索引 files/.github/standards/index.md
npm run check     # 校验 index 引用与路径完整性
```

### 新增 AI Skill（含双层资料）

```bash
mkdir -p files/.github/skills/[category]/[skill-name]/templates
mkdir -p files/.github/skills/[category]/[skill-name]/examples
# 编辑 SKILL.md / USAGE.md
# templates/ 放空白模板（{占位符}）；examples/ 放真实样例（+ 自检清单）
# 在 _manifest.json 注册触发词/上下文/输出/闭环，并同步 _registry.md 人读索引（必须）
npm run check     # 校验 manifest / registry / Skill 文件 / 引用 / 闭环完整性
```

### 多编辑器内容同步

修改 `files/.github/copilot-instructions.md` 后，自动重建全部 9 个编辑器配置（版本号从 `package.json` 注入）：

```bash
npm run sync      # 重建 9 个编辑器配置
npm run check     # 一致性自检（manifest / registry / index / 路径引用 / 闭环 / 编辑器漂移）
```

> 同步规则：`editors.json` 注册 10 个编辑器，其中 GitHub Copilot 的输出即源文件本身（无需重建），
> 故 `npm run sync` 实际重建其余 **9 个**；`npm run check` 对全部 **10 个**做漂移校验。
> `prepublishOnly` 会先跑 `sync --check && check` 挡住漂移，配置不一致时阻断 `npm publish`。

完整贡献流程：[kit-internal/CONTRIBUTING.md](./kit-internal/CONTRIBUTING.md)

---

## spec-gen — 设计文档生成工具集

> 独立于 npm 包主体，供产品设计团队直接使用。**不发布到 npm**。

```
spec-gen/
├── scripts/draw_flow.py    流程图双轨生成器（PNG + drawio，通用工具）
├── templates/              ⚠️ 只读模板区（禁止脚本写入）
├── output/                 生成物（.gitignored）
└── analysis/               参考资料（git 追踪）
```

```bash
pip install Pillow
python spec-gen/scripts/draw_flow.py
```

> 设计文档生成的**正确方式**是通过 Skill 体系（`/create-spec-section` 等 prompt）。
> 项目特定脚本（`generate_spec_doc.py` / `create_skeleton.py`）已废弃删除，详见 [spec-gen/README.md](./spec-gen/README.md)。

---

## CHANGELOG

见 [CHANGELOG.md](./CHANGELOG.md)。
