# @agile-team/wl-skills-design

**产品设计 AI 技能包 v1.0.0** — 5 条设计规范 + AI Skill 自动调度，支持 10 种 AI 编辑器，一条命令导入设计项目。

让 AI 编辑器（Copilot / Cursor / Windsurf / Claude Code / Cline / Kiro / Trae / Qoder / 通用 Agents）**真正理解产品设计规范**，从流程图到数据库、接口、代码结构设计全链路 AI 辅助。

---

## TL;DR

```bash
npx @agile-team/wl-skills-design          # 安装 AI 设计技能包到当前项目
# 在 AI 对话中：
"帮我画一个废钢采购流程图，涉及采购部、质检部、仓储部"
```

---

## 这个包干什么？

```
用户说："帮我画一个废钢入库检验流程图"
    │
    ▼ AI 识别关键词 → 查阅 .github/skills/_registry.md
    ▼ 读取 .github/skills/requirements/flowchart/SKILL.md
    ▼ 加载 .github/standards/01-flowchart.md（规范）
    ▼ 使用 templates/skeleton.drawio（骨架模板）
    ↓
《符合团队规范的 draw.io XML》
（泳道图 / 三层节点 / 色标统一 / 编码格式 / 图例页）
```

---

## 技能覆盖

| 设计域 | 技能 | 状态 |
|-------|------|------|
| 系统需求设计 | draw.io 业务流程图 | ✅ v1.0 |
| 系统需求设计 | 原型设计 | 🔲 v2.0 规划中 |
| 数据设计 | 数据库 ER 设计 | 🔲 v2.0 规划中 |
| 接口设计 | RESTful / OpenAPI | 🔲 v3.0 规划中 |
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
│   │   ├── standards/                         5 条设计规范（01 ✅，02~05 规划中）
│   │   │   ├── index.md                       规范门控
│   │   │   ├── 01-flowchart.md                draw.io 泳道流程图规范（15 章节）
│   │   │   ├── 02-prototype.md                原型规范（stub）
│   │   │   ├── 03-database.md                 数据库规范（stub）
│   │   │   ├── 04-api-design.md               接口规范（stub）
│   │   │   └── 05-code-design.md              代码设计规范（stub）
│   │   ├── skills/
│   │   │   ├── _registry.md                   ★ 触发词路由 — 唯一数据源
│   │   │   ├── _compat/                       多编辑器适配源（editors.json + headers/）
│   │   │   ├── requirements/flowchart/        流程图 Skill ✅
│   │   │   │   ├── SKILL.md                   AI 触发文件
│   │   │   │   ├── USAGE.md                   人读版使用说明
│   │   │   │   └── templates/skeleton.drawio  骨架模板
│   │   │   ├── data/                          数据设计类（规划中）
│   │   │   ├── api/                           接口设计类（规划中）
│   │   │   └── code/                          代码设计类（规划中）
│   │   ├── prompts/                           VS Code Copilot 提示词
│   │   │   ├── create-flowchart.prompt.md
│   │   │   └── validate-flowchart.prompt.md
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
    ├── architecture.md                        架构决策记录（ADR-001~004）
    ├── CONTRIBUTING.md                        贡献流程（新增规范/Skill/多编辑器同步）
    └── skills/README.md                       Skill 开发状态 + 规划清单
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
│   ├── standards/                        5 条设计规范 + index.md 门控
│   ├── skills/
│   │   ├── _registry.md                  ★ 触发词路由（单一数据源）
│   │   ├── _compat/                      多编辑器适配配置
│   │   ├── requirements/flowchart/       流程图 Skill ✅
│   │   ├── data/                         数据设计类 🔲
│   │   ├── api/                          接口设计类 🔲
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
```

安装完成后，直接在 AI 对话中描述设计需求即可触发对应 Skill。

---

## 维护指南

### 新增设计规范

```bash
vim files/.github/standards/06-xxx.md     # 创建规范文件
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

## CHANGELOG

见 [CHANGELOG.md](./CHANGELOG.md)。


