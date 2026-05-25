# CHANGELOG

所有显著变更将记录在本文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

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
