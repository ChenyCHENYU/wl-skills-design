# 贡献指南

## 修改原则

- 保持 Skill 原生、精简和渐进加载：`SKILL.md` 只描述何时使用、核心流程和资源入口。
- 规范是规则真源；模板是空白起点；匿名合成样例只用于校准质量。
- 不为缺失上下文猜默认技术栈。数据库、接口、安全、分页和并发策略先读取设计画像；缺失时询问或标暂挂。
- validate、review、impact 默认只读；repair 必须明确授权。
- 新增触发词时必须同时新增正例、负例或歧义例路由回归。
- 不修改与当前任务无关的工作区文件。

## 新增 Skill

```text
files/.github/skills/<skill-name>/
├── SKILL.md
├── templates/
├── examples/
└── sub/                 # 仅在确有渐进加载价值时添加

files/.github/guides/skills/<skill-name>.md
```

要求：

1. `<skill-name>` 使用小写字母、数字和连字符，且与 frontmatter `name` 一致。
2. frontmatter 只保留 `name` 和 `description`；description 同时说明能力与触发场景。
3. 所有资源使用相对 Markdown 链接。
4. 模板只含占位符；样例在首段声明“匿名合成”。
5. 在 `_manifest.json` 注册路径、intent、触发词、负向词、上下文和输出。
6. 在 `_route-evals.json` 增加回归语料，并同步 `_registry.md`。
7. 若提供 prompt，使用当前 `agent` frontmatter，不声明旧版 `mode` 或内置工具名。

## 修改规范或计数

规范中的编号检查项是唯一口径。调整数量时同步检查：

- 对应 Skill 和 sub 文件；
- create / validate / repair prompt；
- templates、examples 和人读指南；
- 集成评审的维度总数；
- README、CHANGELOG 与 doctor 断言。

不要只替换总数；必须验证编号连续、计算公式和样例问题数量一致。

## 编辑器适配

编辑器定义在 `files/.github/skills/_compat/editors.json`，头部模板在 `_compat/headers/`。当前输出路径：

```text
.github/copilot-instructions.md
CLAUDE.md
.cursor/rules/conventions.mdc
.windsurf/rules/conventions.md
.clinerules/conventions.md
.kiro/steering/conventions.md
.trae/rules/conventions.md
AGENTS.md
.qoder/rules/conventions.md
```

修改单一内容源或头部后运行：

```bash
npm run sync
node scripts/sync-editors.js --check
```

不得重新生成 `.cursorrules`、`.windsurfrules` 或文件形态的 `.clinerules`。

## 验证门禁

```bash
npm run verify
npm audit --audit-level=moderate
npm pack --dry-run --ignore-scripts
git diff --check
```

`npm run verify` 覆盖结构、链接、路由、隐私、模板纯度、draw.io、编辑器漂移、CLI 事务行为、安装烟测和测试套件。新增行为必须补回归测试。

## 提交与发布

提交信息使用简洁 Conventional Commit，例如：

```text
feat: 强化技能包安全与兼容性
fix: 修正接口路由歧义
docs: 同步发布说明
```

版本发布步骤以 [维护者入口](./README.md) 为准。
