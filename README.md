# @agile-team/wl-skills-design

**产品设计 AI 技能包** — 7 条设计规范 + AI Skill 自动调度，支持 10 种 AI 编辑器，一条命令导入设计项目。

让 AI 编辑器（Copilot / Cursor / Windsurf / Claude Code / Cline / Kiro / Trae / Qoder / 通用 Agents）**真正理解产品设计规范**，从流程图、需求说明书到数据库、接口设计、集成评审全链路 AI 辅助。

---

## TL;DR

```bash
npx @agile-team/wl-skills-design          # 安装 AI 设计技能包到当前项目
# 在 AI 对话中：
"帮我画一个废钓采购流程图，涉及采购部、质检部、仓储部"
"帮我编写订单管理模块的需求设计说明书 IPO 表"
"帮我设计订单模块的数据库表结构和数据字典"
"帮我设计订单创建接口（RESTful）"
"对订单模块三份设计文档做一次整体评审，给我出评分报告"
```

---

## 这个包干什么？

```
用户说："帮我设计订单模块的数据库"
    │
    ▼ AI 识别关键词 → 查阅 .github/skills/_registry.md
    ▼ 读取 .github/skills/data/database/SKILL.md
    ▼ 加载 .github/standards/03-database.md（规范）
    ▼ 从 spec IPO 表推导实体 → Sub-01/02/03（ER / 数据字典 / DDL）
    ▼ 执行 30 项验证，自动注入 7 个系统字段、索引、命名前缀
    ↓
《数据库设计（ER / DB 清单 / 数据字典 / DDL）》 + DB_REVIEW 验证报告

用户说："对这个模块做整体评审、出评分"
    │
    ▼ 采集 spec/DB/IF 三份 validate 结论（Sub-01）
    ▼ D4 跨文档三角联动 18 项（Sub-02）
    ▼ 综合评分 + P0 一票否决 + 追溯矩阵（Sub-03）
    ↓
《 DESIGN_REVIEW》：仔表盘 + P0 阶断清单 + spec→接口→表 追溯矩阵 + 修复任务
```

---

## 技能覆盖

| 设计域 | 技能 | 状态 |
|-------|------|------|
| 系统需求设计 | draw.io 业务流程图 | ✅ 已发布 |
| 系统需求设计 | 需求设计说明书（IPO / 流程说明 / 功能设计 / 数据报表）| ✅ 已发布 |
| 系统需求设计 | 原型设计 | 🔲 v2.0 规划中 |
| 数据设计 | 数据库设计（ER / DB 清单 / 数据字典 / DDL）| ✅ 已发布 |
| 接口设计 | 接口设计（系统集成报文 / RESTful / OpenAPI）| ✅ 已发布 |
| 跨域评审 | 设计集成评审（评分 / 追溯矩阵 / 跨文档一致性）| ✅ 已发布 |
| 代码设计 | 业务逻辑代码结构 | 🔲 v3.0 规划中 |

---

## 支持的编辑器

自动生成 10 种 AI 编辑器的配置文件，内容统一来自 `.github/copilot-instructions.md`：

| 编辑器 | 安装后的配置文件 | 头部格式 |
|-------|--------------|---------|
| GitHub Copilot | `.github/copilot-instructions.md` | 无（源文件即输出） |
| Claude Code | `CLAUDE.md` | `<!-- -->` 注释 |
| Cursor | `.cursorrules` | `#` 行注释 |
| Cursor MDC | `.cursor/rules/conventions.mdc` | YAML frontmatter + globs |
| Windsurf | `.windsurfrules` | `#` 行注释 |
| Cline | `.clinerules` | `#` 行注释 |
| Kiro | `.kiro/steering/conventions.md` | YAML（`inclusion: always`） |
| Trae | `.trae/rules/conventions.md` | YAML（`alwaysApply: true`） |
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
├── .npmignore                                 排除 kit-internal/ 不发布
│
├── bin/
│   └── wl-skills-design.js                   CLI 实现（init / update）
│
├── files/                                     ★★★ 真正会被复制到目标项目的内容 ★★★
│   ├── .github/
│   │   ├── copilot-instructions.md            源 AI 主入口（编辑这里，不要改目标项目副本）
│   │   ├── standards/                         7 条设计规范（01/03/04/06/07 ✅，02/05 规划中）
│   │   │   ├── index.md                       规范门控
│   │   │   ├── 01-flowchart.md                draw.io 泳道流程图规范（15 章节）✅
│   │   │   ├── 02-prototype.md                原型规范（stub）
│   │   │   ├── 03-database.md                 数据库规范（30 项验证）✅
│   │   │   ├── 04-api-design.md               接口规范（35 项验证）✅
│   │   │   ├── 05-code-design.md              代码设计规范（stub）
│   │   │   ├── 06-spec-doc.md                 需求说明书规范✅
│   │   │   └── 07-design-review.md            集成评审规范（评分 + D4 联动 18 项）✅
│   │   ├── skills/
│   │   │   ├── _registry.md                   ★ 触发词路由 — 唯一数据源
│   │   │   ├── _compat/                       多编辑器适配源（editors.json + headers/）
│   │   │   ├── requirements/flowchart/        流程图 Skill ✅
│   │   │   │   ├── SKILL.md                   AI 触发文件
│   │   │   │   ├── USAGE.md                   人读版使用说明
│   │   │   │   └── templates/skeleton.drawio  骨架模板
│   │   │   ├── requirements/spec/             需求设计说明书 Skill ✅
│   │   │   │   ├── SKILL.md                   AI 触发文件
│   │   │   │   ├── USAGE.md                   人读版使用说明
│   │   │   │   └── sub/                       Sub-Skill 分解（4个文件）
│   │   │   ├── data/database/             数据库设计 Skill ✅（4 sub + 3 templates）
│   │   │   ├── api/restful/               接口设计 Skill ✅（4 sub + 4 templates）
│   │   │   ├── cross/design-review/       设计集成评审 Skill ✅（3 sub + 1 template）
│   │   │   └── code/                      代码设计类（规划中）
│   │   ├── prompts/                           VS Code Copilot 提示词（9 个）
│   │   │   ├── create-flowchart.prompt.md
│   │   │   ├── validate-flowchart.prompt.md
│   │   │   ├── create-spec-section.prompt.md
│   │   │   ├── validate-spec-section.prompt.md
│   │   │   ├── create-db-design.prompt.md / validate-db-design.prompt.md
│   │   │   ├── create-if-design.prompt.md / validate-if-design.prompt.md
│   │   │   └── design-review.prompt.md          集成评审出报告
│   │   └── guides/                            人读指南
│   │       ├── usage.md
│   │       └── architecture.md
│   ├── CLAUDE.md                              ← 由 _compat/ 生成（Claude Code）
│   ├── AGENTS.md                              ← 由 _compat/ 生成（通用 Agents）
│   ├── .cursorrules                           ← 由 _compat/ 生成
│   ├── .cursor/rules/conventions.mdc          ← 由 _compat/ 生成
│   ├── .windsurfrules                         ← 由 _compat/ 生成
│   ├── .clinerules                            ← 由 _compat/ 生成
│   ├── .kiro/steering/conventions.md          ← 由 _compat/ 生成
│   ├── .trae/rules/conventions.md             ← 由 _compat/ 生成
│   └── .qoder/rules/conventions.md            ← 由 _compat/ 生成
│
└── kit-internal/                              ★★ 仅仓库可见，不发布到 npm ★★
    ├── README.md                              维护者首页 + 快速命令
    ├── architecture.md                        架构决策记录（ADR-001~007）
    ├── CONTRIBUTING.md                        贡献流程（新增规范/Skill/多编辑器同步）
    ├── skills/README.md                       Skill 开发状态 + 规划清单
    └── examples/
        └── spec/                              需求设计说明书真实样例（不发布）
            ├── 00-doc-outline-reference.md    完整标题树（199条目，华新项目）
            ├── 01-flow-desc-example.md        流程说明+活动说明表完整示例
            ├── 02-function-ipo-example.md     IPO 表完整示例（含格式规范说明）
            ├── 03-flow-screen-map-example.md  流程与作业画面对照表示例
            └── 04-api-example.md              接口说明示例
```

> **维护准则**：
> - 规范内容要改 → 改 `files/.github/standards/0x-xxx.md`
> - Skill 要改 → 改 `files/.github/skills/<category>/<name>/SKILL.md`
> - 多编辑器适配要改 → 改 `files/.github/skills/_compat/`（不是改 `files/` 根的配置文件）
> - 维护文档要写 → 进 `kit-internal/`（不会污染目标项目）

### B. 目标项目结构（执行 `npx @agile-team/wl-skills-design` 之后）

```
你的设计项目/
│
├── .github/                              ← 来自本包 files/.github/
│   ├── copilot-instructions.md           AI 主入口
│   ├── standards/                        7 条设计规范 + index.md 门控
│   ├── skills/
│   │   ├── _registry.md                  ★ 触发词路由（单一数据源）
│   │   ├── _compat/                      多编辑器适配配置
│   │   ├── requirements/flowchart/       流程图 Skill ✅
│   │   ├── requirements/spec/            需求设计说明书 Skill ✅
│   │   ├── data/database/                数据库设计 Skill ✅
│   │   ├── api/restful/                  接口设计 Skill ✅
│   │   ├── cross/design-review/          设计集成评审 Skill ✅
│   │   └── code/                         代码设计类 🔲
│   ├── prompts/                          VS Code Copilot 提示词
│   └── guides/                           使用指南
│
├── CLAUDE.md / AGENTS.md                 Claude / 通用 Agents 规则
├── .cursorrules / .cursor/…/mdc          Cursor 规则（两种格式）
├── .windsurfrules / .clinerules          Windsurf / Cline 规则
├── .kiro / .trae / .qoder               Kiro / Trae / Qoder 规则
└── ...（你的设计文件）
```

---

## 使用方法

```bash
# 第一次安装
npx @agile-team/wl-skills-design

# 更新到最新版本
npx @agile-team/wl-skills-design update

# 预览安装内容，不实际写入
npx @agile-team/wl-skills-design --dry-run

# 查看当前版本
npx @agile-team/wl-skills-design --version
```

安装完成后，直接在 AI 对话中描述设计需求即可触发对应 Skill。

---

## 设计全链路工作流（最佳实践）

> 每个环节：生成 → 验证 → 自动修复，全链路闭环

### 1. 流程图（需求设计朴限）

VS Code Copilot 中按 `/` 用 prompt：
- **创建**：`/create-flowchart` → 描述业务需求
- **验证**：`/validate-flowchart` → 自动对照 20 项规范，发现即修复

### 2. 需求设计说明书

- **创建**：`/create-spec-section` → 指定模块，生成 IPO 表 / 流程说明 / 活动说明 / 报表设计
- **验证**：`/validate-spec-section` → 验证字段完整性、编码格式、流程与 IPO 一致性

### 3. 数据库设计

- **创建**：`/create-db-design` → 从 spec IPO 表推导 ER 图 / 数据字典（10 列）/ DDL
- **验证**：`/validate-db-design` → 执行 30 项，强制注入 7 个系统字段、索引、spec 字段联动

### 4. 接口设计

- **创建**：`/create-if-design` → 从 spec 功能编码推导接口清单 / 集成报文 / RESTful 定义
- **验证**：`/validate-if-design` → 执行 35 项，检查统一响应包装、安全、幂等、spec/DB 字段联动

### 5. 集成评审（最终闭环）

- **评审**：`/design-review` → 自动采集三份 validate 结果，计算 D4 三角联动 18 项，出带评分的 `DESIGN_REVIEW_*.md`
  - 仔表盘：D1–D4 四维度得分 + 综合等级 🟢🟡🟠🔴
  - P0 阶断清单（缺表、缺接口、字段对不上…）
  - spec→接口→落库表 正向追溯矩阵

---

## 维护指南

### 新增设计规范

```bash
vim files/.github/standards/08-xxx.md     # 创建规范文件（当前已生 01/03/04/06/07，下一个是 08）
vim files/.github/standards/index.md      # 更新门控索引
```

### 新增 AI Skill

```bash
mkdir -p files/.github/skills/[category]/[skill-name]/templates
vim files/.github/skills/[category]/[skill-name]/SKILL.md
vim files/.github/skills/[category]/[skill-name]/USAGE.md
vim files/.github/skills/_registry.md     # 注册触发词（必须）
```

### 多编辑器内容同步

修改 `files/.github/copilot-instructions.md` 后，参考 `files/.github/skills/_compat/README.md` 同步到 `files/` 根目录的各编辑器配置文件。

完整贡献流程：[kit-internal/CONTRIBUTING.md](./kit-internal/CONTRIBUTING.md)

---

## spec-gen — Word 规格文档自动生成流水线

> 独立于 npm 包主体，供产品设计团队直接使用。不发布到 npm。

### 目录结构

```
spec-gen/
├── scripts/          Python 源码（git 追踪）
│   ├── generate_spec_doc.py   ★ 主生成器（模板基生成）
│   ├── draw_flow.py           流程图模块（脚本基生成：PNG + drawio 双轨）
│   └── create_skeleton.py    一次性骨架提取（勿重复运行）
├── templates/        ⚠️ 只读模板区（禁止脚本写入）
│   └── template_skeleton.docx
├── output/           生成物（.gitignored）
│   └── assets/       中间图片（流程图 PNG / drawio / UI 占位图）
└── analysis/         参考资料（git 追踪）
    └── doc_deep_analysis.txt
```

### 快速生成文档

```bash
pip install python-docx Pillow
python spec-gen/scripts/generate_spec_doc.py
# 输出：spec-gen/output/华新计划模块需求设计说明书_v2.0.docx
```

### 生成策略：模板基 vs 脚本基

| 策略 | 适用场景 | 工具 |
|------|---------|------|
| **模板基**（Template-based）| 文档结构固定，改内容/数据，快速批量出稿 | `generate_spec_doc.py` |
| **脚本基**（Script-based）| 流程图节点动态/数据源驱动，高度灵活 | `draw_flow.py` |
| **混合** | 先脚本基生成流程图 PNG → 再模板基嵌入文档 | 两者配合 |

> 日常迭代推荐**模板基**；流程图变更用**脚本基**；两者可混用。

### 模板保护约定

- `spec-gen/templates/` 内文件为**只读基准**，任何脚本输出**不得**写入此目录
- 所有生成物（docx/png/drawio）统一写入 `spec-gen/output/`，已加入 `.gitignore`
- 如需重新提取骨架，修改 `create_skeleton.py` 后确认 `OUT` 路径指向 `templates/`，且不覆盖已确认的版本

详见 [spec-gen/README.md](./spec-gen/README.md)

---

## CHANGELOG

见 [CHANGELOG.md](./CHANGELOG.md)。


