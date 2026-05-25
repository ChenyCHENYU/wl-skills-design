# CHANGELOG

所有显著变更将记录在本文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

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
