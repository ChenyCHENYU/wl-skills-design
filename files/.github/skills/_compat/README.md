# 编辑器 profile 生成层

`.github/copilot-instructions.md` 是精简正文，`editors.json` 定义 profile 和目标路径，`headers/` 只保存平台差异。

| profile | 目标路径 | 策略 |
|---------|---------|------|
| agents | `AGENTS.md` | CLI 默认 |
| copilot | `.github/copilot-instructions.md` | 原生 Skills + Prompt |
| claude | `CLAUDE.md` | 精简调度 |
| cursor | `.cursor/rules/conventions.mdc` | `alwaysApply: false` |
| windsurf | `.windsurf/rules/conventions.md` | 当前项目规则路径 |
| cline | `.clinerules/conventions.md` | 主规则目录 |
| kiro | `.kiro/steering/conventions.md` | `inclusion: auto` |
| qoder | `.qoder/rules/conventions.md` | 项目规则 |
| trae | `.trae/rules/conventions.md` | 项目规则 |

运行 `npm run sync` 生成文件，运行 `node scripts/sync-editors.js --check` 检查漂移。不要重新加入 `.cursorrules`、`.windsurfrules` 等旧版单文件。
