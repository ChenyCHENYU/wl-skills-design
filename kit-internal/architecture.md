# 架构决策记录（ADR）

> 记录每次重大架构决策的背景、决策内容和权衡。  
> 格式：`## ADR-NNN 标题` + 日期 + 状态 + 决策内容

---

## ADR-001 · 采用 _registry.md 作为 Skill 触发词单一数据源

**日期**：2025-05  
**状态**：✅ 已采纳

### 背景
早期版本的 SKILL.md 文件中各自定义了触发关键词，维护时容易出现不一致。

### 决策
所有 Skill 的触发词只在 `.github/skills/_registry.md` 中定义，SKILL.md 中不重复定义。

### 权衡
- **优点**：触发词一览，避免冲突，新人维护时有明确入口
- **代价**：需要维护者有意识地不在 SKILL.md 写触发词（需规范约束）

---

## ADR-002 · 规范与工具分离

**日期**：2025-05  
**状态**：✅ 已采纳

### 背景
最初将规范内容直接写在 SKILL.md 中（与工具绑定），导致规范无法跨工具复用。

### 决策
`standards/` 存放纯粹的设计规范（工具无关），`skills/` 中的 SKILL.md 只负责工具层的操作指令，通过 `read_file` 按需加载规范。

### 权衡
- **优点**：规范可复用，draw.io / Figma / SQL 工具均可引用同一份规范
- **代价**：AI 每次需要额外一步读规范文件（可接受，延迟极低）

---

## ADR-003 · 采用 _compat/ 多编辑器适配层

**日期**：2025-05  
**状态**：✅ 已采纳

### 背景
团队成员使用不同编辑器（VS Code / Cursor / Claude / Windsurf 等），每个编辑器的 AI 配置格式不同，手动维护 10 个文件内容同步成本高。

### 决策
所有编辑器配置文件的**内容**均来自 `.github/copilot-instructions.md`（单一内容源），`_compat/headers/` 中只存储各编辑器特有的头部格式差异，`editors.json` 注册映射关系。

### 权衡
- **优点**：内容只维护一处，格式差异清晰隔离
- **代价**：目前同步为手动操作（未来可自动化）

---

## ADR-004 · workspace 即 package，无 files/ 分层

**日期**：2025-05  
**状态**：❌ 已废弃（被 ADR-005 取代）

### 背景
参考项目 `wl-skills-kit` 是 npm 包，区分 `files/`（部署到业务项目）和 `kit-internal/`（维护者专用）。`wl-skills-design` 是独立设计工作区，无需 npm 部署。

### 决策
工作区根目录即为包根目录，`.github/` 直接承担 AI 工具链职责，`kit-internal/` 保留维护者文档的分离性。

### 废弃原因
"全部做好了发包，再引入这个项目" — 用户明确需要将此包发布为 npm，直接 `npx` 初始化设计项目。workspace-as-package 模式无法区分"包里的内容"和"要发布的内容"，不符合 npm 模板包的最佳实践。

---

## ADR-005 · 采用 files/ 分层，构建为可发布 npm 包

**日期**：2025-05  
**状态**：✅ 已采纳（取代 ADR-004）

### 背景
用户决定将 `wl-skills-design` 作为 `@agile-team/wl-skills-design` 发布到 npm，通过 `npx` 命令将设计规范 + AI Skill 一键安装到设计项目。需要与 `wl-skills-kit` 保持一致的架构模式。

### 决策
采用 `files/` 分层：
- `files/` — 存放所有将被 `npx` 复制到目标项目的内容（`.github/`、10 种编辑器配置）
- `kit-internal/` — 仅在仓库可见，不发布到 npm（`.npmignore` 排除）
- `bin/wl-skills-design.js` — CLI 入口，`init` 命令将 `files/` 全量复制到 `process.cwd()`
- `package.json` `files` 字段：`["bin/", "files/", "README.md", "CHANGELOG.md"]`

### 权衡
- **优点**：
  - 发布与维护边界清晰（`files/` vs `kit-internal/`）
  - 与 `wl-skills-kit` 架构对齐，维护者学习成本低
  - `npx` 一行命令即可将设计规范安装到任意设计项目
  - `kit-internal/` 的架构文档、贡献指南不污染目标项目
- **代价**：
  - 开发 `wl-skills-design` 包本身时，VS Code 无法直接发现 `files/.github/skills/`（路径含 `files/` 前缀）
  - 维护者需要记住"改规范要进 `files/.github/`，不是直接改包根目录"
