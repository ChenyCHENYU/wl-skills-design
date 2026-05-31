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
| `examples/` | 各设计域真实样例（spec / db / api），供 few-shot 参考，不发布 |

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
# 1. 新增一条设计规范（当前已有 01~07，下一个是 08）
vim .github/standards/08-xxx.md
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

---

## 发布到 npm（重要）

> ⚠️ 本仓库路径含 `#` / `【】` 特殊字符，会破坏 npm 打包。
> **必须**复制到无特殊字符的临时目录再发布。

```bash
# 1. 准备干净目录（只拷发布所需文件）
TMP=$(mktemp -d)
cp -r bin files package.json README.md CHANGELOG.md "$TMP"/
cd "$TMP"

# 2. 写入发布 token（发布后立即删除，切勿提交）
echo "//registry.npmjs.org/:_authToken=<NPM_TOKEN>" > .npmrc

# 3. 发布（跳过 husky 等脚本）
npm publish --ignore-scripts --access public

# 4. 清理
rm -f .npmrc && cd - && rm -rf "$TMP"
```

> 发布前确认：`package.json` version 已 bump、CHANGELOG 已记录、git 已 commit + tag + push。

