# kit-internal — 维护者专用文档

> ⚠️ **本目录不属于 AI 工具链**，不会被 AI 读取。  
> 这里存放的是**维护者视角**的文档：架构决策、贡献指南、待规划技能清单。

---

## 目录说明

| 文件/目录 | 说明 |
|---------|------|
| `README.md` | 本文件，维护者入口 |
| `architecture.md` | 架构决策记录（ADR） |
| `CONTRIBUTING.md` | 贡献流程与规范 |
| `skills/README.md` | Skill 维护清单与规划 |

> **样例（examples）与模板（templates）现已随包发布**，分别位于每个 Skill 目录下的 `examples/`（真实场景质量标杆）与 `templates/`（空白起点）。
> 详见 `architecture.md` ADR-012。维护样例请改 `files/.github/skills/<category>/<skill>/examples/`。

---

## 核心设计决策

本包遵循以下核心设计原则（详见 `architecture.md`）：

1. **单一执行源**：`_manifest.json` 是 AI 路由的机器可读来源，`_registry.md` 只做人读索引
2. **规范与工具分离**：`standards/` 存放工具无关的规范，`skills/` 是工具相关的触发层
3. **多编辑器适配**：`_compat/` 统一管理多编辑器头部格式
4. **架构先行**：目录结构反映未来规划，stub 占位确保扩展路径清晰

---

## 快速上手（维护者）

```bash
# 1. 新增一条设计规范（当前已有 01~09，下一个是 10；05 为规划 stub）
vim .github/standards/10-xxx.md
vim .github/standards/index.md   # 更新表格

# 2. 新增一个 Skill
mkdir -p .github/skills/[category]/[skill-name]
vim .github/skills/[category]/[skill-name]/SKILL.md
vim .github/skills/[category]/[skill-name]/USAGE.md
vim .github/skills/_manifest.json # 注册触发词、上下文、输出、闭环
vim .github/skills/_registry.md   # 同步人读索引

# 3. 同步多编辑器配置（改 copilot-instructions.md 后）
npm run sync     # 由 scripts/sync-editors.js 重建 9 个编辑器配置
npm run check    # 一致性自检（manifest / registry / index / 路径引用 / 编辑器漂移）
```

---

## 发布到 npm

> 路径已为纯 ASCII，可直接在仓库根目录发布，无需复制到临时目录。

```bash
# 1. bump 版本 + 记录 CHANGELOG，并 commit / tag / push
npm version <patch|minor|major>

# 2. 发布（prepublishOnly 会先跑 sync --check + check 挡住漂移）
npm publish --access public
```

> 发布前确认：`package.json` version 已 bump、CHANGELOG 已记录本次变更、git 已 commit + tag + push。
> npm 鉴权用本机 `npm login` 或 CI 环境变量 `NODE_AUTH_TOKEN`，**不要**把 token 写进仓库内的 `.npmrc`。

