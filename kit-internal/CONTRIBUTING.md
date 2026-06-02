# 贡献指南

> 本指南面向 `wl-skills-design` 包的维护者。

---

## 一、贡献类型

| 类型 | 说明 | 优先级 |
|------|------|-------|
| 完善已有规范 | 补充 `standards/0x-xxx.md` 中的 TODO 内容 | 🔴 高 |
| 新增 Skill | 为某个设计域创建 `SKILL.md` + `USAGE.md` | 🟡 中 |
| 新增设计规范 | 创建新的 `standards/0N-xxx.md` | 🟡 中 |
| 修复触发词 | 更新 `_registry.md` 中的触发关键词 | 🟢 低 |
| 编辑器适配 | 调整 `_compat/headers/` 或 `editors.json` | 🟢 低 |

---

## 二、新增设计规范

```bash
# 1. 在 files/standards/ 下创建下一个编号文件
#    当前已有 01/02/03/04/05/06/07/08，下一个是 09
vim files/.github/standards/09-xxx.md

# 2. 更新 index.md 中的规范表格
vim files/.github/standards/index.md

# 3. 如有对应 Skill，创建 SKILL.md + USAGE.md（见下节）
```

**规范文件结构模板**：
```markdown
# NN — 规范名称

## 一、[章节]
...

## 验证清单
- [ ] 检查项 1
- [ ] 检查项 2
```

---

## 三、新增 Skill

```bash
# 1. 确定 Skill 所属类别（requirements / data / api / code / cross）
#    cross = 跨域聚合类（如设计集成评审，消费多个产物的结论）
mkdir -p files/.github/skills/[category]/[skill-name]/templates
mkdir -p files/.github/skills/[category]/[skill-name]/examples

# 2. 创建 SKILL.md（AI 触发文件）
vim files/.github/skills/[category]/[skill-name]/SKILL.md

# 3. 创建 USAGE.md（人读指南）
vim files/.github/skills/[category]/[skill-name]/USAGE.md

# 4. 在 _registry.md 中注册（！必须！）
vim files/.github/skills/_registry.md
# → 将状态从 🔲 改为 ✅，补充触发关键词
```

**SKILL.md 结构要求**：
- YAML frontmatter：`name`, `description`, `tools`
- 第一步：读取规范文件（`read_file`）
- 第二步：读取模板（如有）
- 快速参考表（颜色、尺寸、格式等高频查询项）
- 操作入口（对应 prompt 或操作指令）

### 双层资料约定（templates vs examples · 见 ADR-012）

每个 Skill **必须**提供两层资料，且**两层都随包发布**：

| 目录 | 角色 | 内容要求 |
|------|------|---------|
| `templates/` | **默认模板（空白起点）** | 纯结构 + `{占位符}`，**零业务数据**；由本 Skill 的 skills 规则派生 |
| `examples/` | **真实样例（质量标杆）** | 真实场景填充内容；AI 生成时**必须做得不低于它** |

约定：
- 模板里**不得**出现成片真实业务数据（那是样例的职责）；模板只示意结构与占位。
- 每个样例文件结尾附「**自检：本样例为何达标**」清单，把标杆显式化为可对照的检查点。
- SKILL.md 第三步同时指向两层，并注明 examples 是「质量标杆，须不低于它」。
- 规范升级时，样例的自检清单门槛要同步抬高，确保样例始终是最佳实践。

---

## 四、多编辑器同步

修改 `files/.github/copilot-instructions.md` 后，运行同步脚本自动重建全部编辑器配置
（内容从 `copilot-instructions.md` 派生，版本号从 `package.json` 注入）：

```bash
npm run sync       # 重建 9 个编辑器配置
npm run check      # 一致性自检（registry / index / 路径引用 / 编辑器漂移）
```

> ℹ️ 脚本直接在仓库根目录运行即可，无需额外准备。

派生关系（由 `scripts/sync-editors.js` 自动处理，无需手动操作）：

```
# 所有路径均相对于 files/ 目录根
files/CLAUDE.md         ← headers/claude-code.txt + 正文
files/.cursorrules      ← headers/cursor-rules.txt + 正文
files/.cursor/rules/conventions.mdc  ← headers/cursor-mdc.txt + 正文
files/.windsurfrules    ← headers/windsurf.txt + 正文
files/.clinerules       ← headers/cline.txt + 正文
files/.kiro/steering/conventions.md  ← headers/kiro.txt + 正文
files/.trae/rules/conventions.md     ← headers/trae.txt + 正文
files/AGENTS.md         ← headers/agents.txt + 正文
files/.qoder/rules/conventions.md    ← headers/qoder.txt + 正文
```

---

## 五、记录架构决策

每次做出重大架构决策时，在 `kit-internal/architecture.md` 中追加 ADR：

```markdown
## ADR-NNN · 标题

**日期**：YYYY-MM  
**状态**：✅ 已采纳 / 🔲 提案中 / ❌ 已否决

### 背景
...

### 决策
...

### 权衡
...
```
