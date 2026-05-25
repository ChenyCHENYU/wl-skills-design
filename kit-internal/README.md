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

---

## 核心设计决策

本包遵循以下核心设计原则（详见 `architecture.md`）：

1. **单一数据源**：`_registry.md` 是所有 Skill 触发词的唯一来源
2. **规范与工具分离**：`standards/` 存放工具无关的规范，`skills/` 是工具相关的触发层
3. **多编辑器适配**：`_compat/` 统一管理多编辑器头部格式
4. **架构先行**：目录结构反映未来规划，stub 占位确保扩展路径清晰

---

## 快速上手（维护者）

```bash
# 1. 新增一条设计规范
vim .github/standards/06-xxx.md
vim .github/standards/index.md   # 更新表格

# 2. 新增一个 Skill
mkdir -p .github/skills/[category]/[skill-name]
vim .github/skills/[category]/[skill-name]/SKILL.md
vim .github/skills/[category]/[skill-name]/USAGE.md
vim .github/skills/_registry.md   # 注册触发词

# 3. 同步多编辑器配置
# 手动将 .github/copilot-instructions.md 内容同步到各编辑器根配置文件
# 参见 .github/skills/_compat/README.md
```
