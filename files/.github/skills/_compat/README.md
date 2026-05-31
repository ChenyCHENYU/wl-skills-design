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

**自动同步（推荐）**：在仓库根目录运行 `npm run sync`，由 `scripts/sync-editors.js`
读取 `editors.json` + `headers/` + `copilot-instructions.md` 重新生成全部 9 个编辑器配置，
并从 `package.json` 注入版本号（无需手改 10 处版本号）。

```bash
npm run sync          # 重新生成全部编辑器配置
node scripts/sync-editors.js --check   # 只校验是否漂移，不写入（CI / 发布前）
```

> ⚠️ 本仓库路径含特殊字符（`【】` / `#`），会导致 node 执行脚本文件崩溃。
> 运行脚本前需将 `files/` `scripts/` `package.json` 复制到无特殊字符的临时目录执行，
> 再把生成的编辑器配置拷回。详见 `kit-internal/README.md` 发布章节。

**发布前自检**：`prepublishOnly` 已接入 `sync --check` + `check`，配置漂移会直接阻断发布。

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
