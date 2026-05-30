---
name: requirements-spec-doc
description: >
  **需求设计说明书编写技能** — 按照团队标准生成系统需求设计说明书（单模块卷）。
  USE FOR: 生成需求设计说明书全文或任意章节；编写系统目标/组织架构/总体设计；
  编写子模块流程清单/流程说明/活动说明表；编写功能 IPO 表（处理逻辑）；
  生成报表设计说明；补全已有说明书的缺失章节。
  DO NOT USE FOR: 流程图绘制（用 requirements/flowchart/SKILL.md）；
  数据库设计、接口设计、代码设计。
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# 需求设计说明书编写规范（wl-skills-design）

---

## ⚠️ 首先必读：文档拆分策略

**在生成任何内容之前，必须先明确输出文件结构。**

读取 `.github/skills/requirements/spec/templates/doc-skeleton.md`，该文件定义：
- 一份完整说明书由哪 5 个文件组成
- 每个文件对应哪些章节（`ch1-3.md` / `4.x-{name}.md` / `4.N-data-report.md`）
- 每个文件由哪个 Sub-Skill 生成
- 合并为完整文档的顺序

> **禁止任意命名输出文件**（如 `PMPM007-ipo.md`）。所有生成内容必须写入上述 5 类文件之一，用 `replace_string_in_file` 替换对应占位符，或 `create_file` 创建对应文件。

---

## 第一步（必须）：加载规范

```
.github/standards/06-spec-doc.md
```

该文件是唯一权威来源，包含：文档结构、各章节写法、IPO 表规范、编码约定、验证清单（43 项）。**不读规范，不执行任何生成操作。**

---

## 第二步：识别任务类型，加载对应 Sub-Skill

根据用户的具体需求，加载以下对应的 sub-skill 文件：

| 任务 | Sub-Skill 路径 | 写入目标文件 |
|------|--------------|------------|
| 第 1 章 系统目标 / 第 2 章 组织架构 / 第 3 章 总体设计 | `sub/01-overview.md` | `ch1-3.md` |
| 4.x.1 流程清单 / 4.x.2 流程说明 / 4.x.3 对照表 | `sub/02-module-flow.md` | `4.x-{name}.md`（流程部分）|
| 4.x.4 功能设计（画面逻辑 + IPO 表）| `sub/03-function-ipo.md` ⬅ **核心** | `4.x-{name}.md`（IPO 部分，追加写入同文件）|
| 4.N 数据需求表 / 4.N+1 报表设计 | `sub/04-data-report.md` | `4.N-data-report.md` |

> **关键**：流程部分（02）和 IPO 部分（03）写入**同一个子模块文件**，不是两个文件。

---

## 第三步（可选）：参考真实样例

`kit-internal/examples/spec/` 目录下有源自真实项目的参考样例：

| 样例文件 | 用途 |
|---------|------|
| `00-doc-outline-reference.md` | 完整标题树（验证结构完整性）|
| `01-flow-desc-example.md` | 流程说明 + 活动说明表的完整写法 |
| `02-function-ipo-example.md` | IPO 表的完整写法（含多页面）|
| `03-flow-screen-map-example.md` | 流程与作业画面对照表的写法 |

---

## 操作入口（完整闭环）

| 任务 | 使用方式 |
|------|---------|
| 初始化文档目录（生成5个空白文件）| 在对话中说「初始化 {项目名} 需求设计说明书文档结构」|
| 生成并写入指定章节 | 使用 `.github/prompts/create-spec-section.prompt.md` |
| 验证已有文件 | 使用 `.github/prompts/validate-spec-section.prompt.md` |
| 查阅文档拆分策略 | 读取 `templates/doc-skeleton.md` |
| 查阅完整规范 | 读取 `.github/standards/06-spec-doc.md` |

---

## ⚠️ 闭环工作流（必须遵循）

> 所有内容生成必须遵循「生成 → 验证 → 修复 → 复验」四阶段循环，**不允许跳过验证直接交付**。

```
[阶段1] 生成（按子模块逐章节）
      ↓
[阶段2] 验证（执行43项检查清单）
      ↓ 有失败项？
[阶段3] 修复（按06-spec-doc.md §十四修复协议）
      ↓
[阶段4] 复验（全部43项通过）→ ✅ DONE
```

### 执行规则

| 规则 | 说明 |
|------|------|
| **逐子模块验证** | 完成一个子模块（4.x 完整一节）后立即验证，不等全文生成完再统一验证 |
| **验证范围** | 执行 `standards/06-spec-doc.md §十一` 中全部 **43 项**（A/B/C/D/E/F/G/H/X 组）|
| **修复优先级** | X 组（跨文档一致性）→ C 组（编码格式）→ E 组（IPO 完整性）→ 其他 |
| **禁止跳过修复** | 若有 ❌ 项，禁止继续生成下一子模块，必须先修复当前子模块 |
| **暂挂项** | 缺少调研数据无法填写时，写 `【待补充：{描述}】`，标注为「Pending」，不算 ❌ |

### 跨文档一致性检查（X 组，每子模块执行一次）

完成每个子模块后，构建以下集合并比对：

```
SET_D = { 4.x.4 中所有功能编码小节标题 }
SET_C = { 4.x.3 对照表中所有功能编码引用 }
SET_E = { 4.x.6 权限矩阵所有行的功能编码 }
SET_F = { 4.x.6 权限矩阵所有列头岗位名 }
SET_G = { 2.2 岗位定义表所有岗位名 }

X03：SET_C == SET_D（双向）
X04：SET_E == SET_D（双向）
X06：SET_F ⊆ SET_G
```

### 验证报告格式（每次验证后必须输出）

```
验证报告 — [子模块名称]（[子模块编码]）
总项数：43 | 通过：N | 失败：M | 暂挂：K
失败项：
  [X03] SET_C \ SET_D = { PMPM019 }（对照表引用了功能设计中不存在的编码）
  [I07] PMPM007 确认按钮 Process 列缺少「触发事件」子段
状态：❌ 需修复后继续
```

---

## 完成后验证

生成完成后，对照 `standards/06-spec-doc.md §十一` 全部 **43 项**逐项检查。  
发现不合格项 → 立即按 `§十四修复协议` 修复，无需等待用户提示。

---

## 快速参考：各章节对应 sub-skill

| 章节 | Sub-Skill | 写入文件 |
|------|----------|---------|
| 1. 系统目标 | `sub/01-overview.md` | `ch1-3.md` |
| 2. 组织架构及业务单位 | `sub/01-overview.md` | `ch1-3.md` |
| 3. 总体设计 | `sub/01-overview.md` | `ch1-3.md` |
| 4.x.1 系统流程清单 | `sub/02-module-flow.md` | `4.x-{name}.md` |
| 4.x.2 系统流程说明 | `sub/02-module-flow.md` | `4.x-{name}.md` |
| 4.x.3 流程与画面对照表 | `sub/02-module-flow.md` | `4.x-{name}.md` |
| 4.x.4 功能设计（IPO）| `sub/03-function-ipo.md` | `4.x-{name}.md`（追加）|
| 4.x.5 内部接口（API）| `sub/02-module-flow.md` Step 5 | `4.x-{name}.md`（追加）|
| 4.x.6 权限矩阵 | `standards/06-spec-doc.md` §6.6 | `4.x-{name}.md`（追加）|
| 4.N 数据需求表 | `sub/04-data-report.md` | `4.N-data-report.md` |
| 4.N+1 报表设计 | `sub/04-data-report.md` | `4.N-data-report.md` |
