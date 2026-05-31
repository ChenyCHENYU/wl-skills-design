# CHANGELOG

所有显著变更将记录在本文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [0.0.9] — 2026-05（一致性补丁：流程五要素 + 活动编码格式对齐）

### 修复
- **`create-spec-section.prompt.md` 默认落盘路径修正**：与 spec §十.2/§十.3 单一权威保持一致
- **流程说明五要素格式对齐**：`examples/spec/01-flow-desc-example.md` 与 `sub/02-module-flow.md` 统一为 `【触发条件】【主要角色】【核心路径】【关键判断】【流程产出】`
- **活动编码格式统一**：`sub/02-module-flow.md` 对齐 `[流程编码]-[E/C/M]-[NN]` 标准格式

---

## [0.0.8] — 2026-05（全面闭环修复：43 项单一权威 + 表列对齐 + 编码统一）

### 修复
- **验证清单彻底单一权威化（M1）**：`validate-spec-section.prompt.md` 整体重写——不再自定义检查清单，全部指向 `06-spec-doc.md §十一（43 项）`，消除双源脱节根因；X 组集合比对算法与暂挂处理走 §十三+§十四，P0~P3 修复优先级对齐 §十四 第三阶段
- **验证总项数从 42 修正为 43**：逐组实际清点（A5+B6+C4+D4+E11+F3+G2+H2+X6）并全文同步；`create-spec` prompt / `SKILL.md` / `06-spec-doc.md` §十一标题、§十三、§十四 全部改为 43
- **Sub-Skill 生成表列数对齐规范（M4）**：
  - `sub/01-overview.md`：岗位定义表 3 列→5 列（增序号/岗位职责/在本系统中的角色），专有名称表 2 列→4 列（增序号/类别）
  - `sub/04-data-report.md`：BIP 输入表补「取数条件」列、数据输出表「触发条件」改为「推送时机」并补「用途说明」列、报表清单 5 列→8 列（增主要使用角色/数据刷新策略/导出支持）
  - `templates/doc-skeleton.md`：占位表列数同步
- **活动编码格式统一（M5）**：`01-flowchart.md §七` 从旧 `FGPM-E-01` 格式重写为指向 spec §十.2/§十.3 单一权威（`[流程编码]-[E/C/M]-[NN]`），示例改为 `PMMB-A-02-E-01`；`06-spec-doc.md §十.3` 补 C/M 类型说明及 FC-01 互引要求；验证清单 C02、flowchart SKILL 快速参考均同步
- **06-spec §六.2 流程说明格式（A1）**：从旧叙事段落（"第一步…第二步…"）改为五要素结构（`【触发条件】【主要角色】【核心路径】【关键判断】【流程产出】`），与 `sub/02-module-flow.md` 保持一致
- **Sub-Skill 落盘路径统一（A2）**：02/03 均写入同一 `docs/spec/{项目代号}/4.{序号}-{子模块名}.md`，04 写入 `4.N-data-report.md`，消除多文件分散与五文件结构冲突；各 Sub-Skill 内旧 validate 调用的"X 类 N 项"硬编码改为引用适用检查组名
- **`sub/01-overview.md` 删除冗余信息确认表（A7）**：删除与推断/确认双表重叠的「章节\|必须知道的信息」旧表，保留精简版
- **`sub/03-function-ipo.md` PMMB001 示例补「重置」按钮（A6）**：列表页由 4 行→5 行，与标准列表页模板一致
- **`sub/02-module-flow.md` 图例格式统一（B4）**：从自定义表格改为与 spec §六.2 一致的固定 list 格式

### 新增
- **H03（条件项）**：`06-spec-doc.md §十一 H 组` 新增行级数据权限（Row-level Security）验证条目，标注「仅当系统存在行级权限需求时计入」，不影响强制总数 43

---

## [0.0.7] — 2026-05（详说规范全面重写，覆盖 Word 模板 + IPO 代码设计标准）

### 重写
- **`standards/06-spec-doc.md` 全面重写 v2.0**（从约 400 行扩展到 870 行）
  - 新增 **§零 Word 文档模板固定结构**：页眉公司标识带、页脚3行元数据带、第一封面（信息表）、第二封面（审批签字表）、修订记录页、目录页，全部含固定字段+变量字段说明
  - 升级 **功能设计详规（§七）**：画面逻辑写法添加控件类型表；字段描述模板（外键关联/枚举下拉/数字/日期/文本/只读带出）；四段式写法要求明确正反按子段寻找；状态机表格模板；主从表结构模板
  - 升级 **流程说明规范（§六）**：流程说明固定段落结构（触发条件+关键环节+业务产出）；活动说明表新增输入/输出列
  - 升级 **验证清单**：从 18 项扩展到 32 项，新增固定页面完整性（5项）+组织架构章节质量（4项）+流程说明质量（3项）
  - 每个节末新增 **“代码设计视角”**：说明该节产出如何作为 AI 代码设计输入

---

## [0.0.6] — 2026-05（文档拆分蓝图 + SKILL.md 结构化策略）

### 新增
- **`templates/doc-skeleton.md`**：完整文档「拆分蓝图」文件，明确规定一份说明书由 5 个文件组成（`ch1-3.md` / `4.x-{name}.md` × N / `4.N-data-report.md`），每文件的内容边界、生成职责、命名规则、7步生成操作流程、速查表
- **`SKILL.md` 重写**：删除内联骨架模板，改为强制首读 `templates/doc-skeleton.md`，明确每个 Sub-Skill 对应写入哪个目标文件（流程节和 IPO 节写入同一子模块文件），新增「写入文件」列
- **实际验证样例** `docs/spec/huaxin/4.3-plan.md`：PMPM007 炼钢计划编制完整 IPO 表（列表页7行+新增页3行，含状态机、四段式确认逻辑）

### 修复
- `docs/spec/huaxin/4.3-plan.md` A10 自动修复：取消按钮处理逻辑去除「返回」字眼

---

## [0.0.5] — 2026-05（全类型 Skill 验证闭环完整覆盖）

### 新增
- **D 类检查（6 项）**：概述章节（1～3章）结构验证（组织架构图占位 / 岗位表格 / 本语表 / 功能层级表）
- **E 类检查（5 项）**：数据需求表+报表设计验证（编码对应 / 查询条件表+输出字段表 / 报表样例占位）
- `sub/01-overview.md` 补充落盘路径说明及 validate 引用
- `sub/04-data-report.md` 补充落盘路径说明及 validate 引用
- `validate-spec-section.prompt.md` 章节类型识别表更新，报告模板补充 D/E 类，修复优先级升级

---

## [0.0.4] — 2026-05（需求设计说明书 Skill + 闭环升级）

### 新增
- **需求设计说明书 Skill 全套**（`requirements/spec/`）
  - 权威规范：`standards/06-spec-doc.md`（8章，18项验证清单，IPO表四段式格式规范）
  - 主入口：`SKILL.md` + `USAGE.md`
  - 4 个 Sub-Skill：总体设计 / 流程说明体系 / 功能 IPO 表（核心）/ 数据报表
  - VS Code Prompt：`create-spec-section.prompt.md`（含文件落盘）
  - VS Code Prompt：`validate-spec-section.prompt.md`（A类12项+B类8项+C类5项，自动修复）
  - 真实样例：`kit-internal/examples/spec/`，4个文件（如菜项目 199 条目大纲、PMMB001 完整 IPO、流程画面对照表）
- **IPO 表 Sub-Skill 补充场景模板**：多 Tab 页 / 状态机功能 / 主从表功能

### 调整
- `_registry.md` 添加需求设计说明书触发词（9 个关键词）
- `standards/index.md` 添加 06 条目
- `kit-internal/skills/README.md` 添加 spec skill 行
- `README.md` 技能覆盖表 / 仓库结构图全面同步

---

## [0.0.2] — 2025-05（Patch 优化）

### 修复
- 连线规范关键错误：source 应指向 **name 层**（非 code 层），target 指向 code 层；跨泳道 parent 必须是外层主容器 id
- `standards/01-flowchart.md` 示例中 `source="n1-dept"` 改为 `source="n1-name"`（dept 层在最底部，非退出点）
- `create-flowchart.prompt.md` 错误描述"source/target 指向 code 层"
- `package.json` description 包含错误版本号 `v1.0.0`

### 新增
- CLI `--version` / `-v` 标志：`npx @agile-team/wl-skills-design --version`
- `validate-flowchart.prompt.md` 添加 `replace_string_in_file` 工具，验证后自动执行修复（真正闭环）
- `package.json` 补全 `homepage`、`bugs` 字段及 `scripts.cz`
- `.gitignore` 补充 `*.tgz` 和 `package-lock.json`
- `SKILL.md` 连线规范表新增 source/target 层级和跨泳道 parent 规则说明

### 调整
- `editors.json` 版本号从错误的 `1.0.0` 修正为 `0.0.1`

---

## [0.0.1] — 2025-05（首次发布）

### 新增
- 流程图设计 Skill（draw.io 泳道图规范）
  - 完整规范文件：`.github/standards/01-flowchart.md`（15 章节，画布/泳道/节点/色标/连线/编码/验证）
  - AI 触发文件：`.github/skills/requirements/flowchart/SKILL.md`
  - 骨架模板：`.github/skills/requirements/flowchart/templates/skeleton.drawio`
  - VS Code 创建提示词：`.github/prompts/create-flowchart.prompt.md`
  - VS Code 验证提示词：`.github/prompts/validate-flowchart.prompt.md`
- 多编辑器适配层（`_compat/`）支持 10 种编辑器
- Skill 触发词路由（`_registry.md`）单一数据源架构
- 规范门控索引（`standards/index.md`）
- 规划中规范占位文件（02～05）
- 各编辑器根配置文件（CLAUDE.md, .cursorrules, .windsurfrules 等）
- 维护者文档（`kit-internal/`）：ADR、CONTRIBUTING、Skill 维护清单
