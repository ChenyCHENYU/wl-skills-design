# _compat — 多编辑器适配层

> **唯一数据源原则**：所有编辑器配置由 `.github/copilot-instructions.md` 衍生，  
> 通过在文件头部追加 `headers/` 中对应的模板，生成各编辑器所需的配置格式。

---

## 设计原则

1. **单一内容源**：内容只维护在 `.github/copilot-instructions.md`，各编辑器文件不单独维护内容
2. **头部差异化**：各编辑器仅头部格式不同（YAML frontmatter / 注释 / 无头部），通过 `headers/` 模板抽象
3. **按需启用**：`editors.json` 中 `enabled: false` 可禁用某编辑器，不影响其他编辑器
4. **路径注册**：所有输出路径在 `editors.json` 中统一注册，不在各处硬编码

---

## 同步流程

```
.github/copilot-instructions.md（内容源）
    │
    ├── + headers/github-copilot.txt  →  .github/copilot-instructions.md（原文）
    ├── + headers/claude-code.txt     →  CLAUDE.md
    ├── + headers/cursor-rules.txt    →  .cursorrules
    ├── + headers/cursor-mdc.txt      →  .cursor/rules/conventions.mdc
    ├── + headers/windsurf.txt        →  .windsurfrules
    ├── + headers/cline.txt           →  .clinerules
    ├── + headers/kiro.txt            →  .kiro/steering/conventions.md
    ├── + headers/trae.txt            →  .trae/rules/conventions.md
    ├── + headers/agents.txt          →  AGENTS.md
    └── + headers/qoder.txt           →  .qoder/rules/conventions.md
```

**手动同步**：`copilot-instructions.md` 更新后，将内容复制到对应编辑器文件，保留文件头部不变。

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `editors.json` | 编辑器注册表，定义 ID / 输出路径 / 头部模板映射 |
| `headers/*.txt` | 各编辑器配置文件的头部模板（YAML frontmatter 或注释） |

---

## 各编辑器头部格式说明

| 编辑器 | 头部格式 | 特殊配置 |
|-------|---------|---------|
| GitHub Copilot | 无（直接使用 md） | — |
| Claude Code | 注释 | — |
| Cursor (.cursorrules) | 注释 | — |
| Cursor MDC | YAML frontmatter | `alwaysApply: true`, globs |
| Windsurf | 注释 | — |
| Cline | 注释 | — |
| Kiro | YAML frontmatter | `inclusion: always` |
| Trae | YAML frontmatter | `alwaysApply: true`, globs |
| AGENTS.md | 注释 | — |
| Qoder | 注释 | — |
