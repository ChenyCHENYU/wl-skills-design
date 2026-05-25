# CHANGELOG

所有显著变更将记录在本文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [1.0.0] — 2025-05

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

### 架构决策
- ADR-001: `_registry.md` 单一数据源
- ADR-002: 规范与工具分离（standards/ vs skills/）
- ADR-003: `_compat/` 多编辑器适配层
- ADR-004: workspace 即 package，无 files/ 分层

---

## [0.1.0] — 2025-05（初版，已重构）

> ⚠️ 此版本已废弃，被 v1.0.0 重构替代。

### 原始内容（已迁移）
- `wl-skills-design/requirements/flowchart/standards.md` → `standards/01-flowchart.md`
- `wl-skills-design/requirements/flowchart/templates/skeleton.drawio` → `skills/requirements/flowchart/templates/`
- `.github/skills/drawio-flowchart/SKILL.md` → `skills/requirements/flowchart/SKILL.md`
