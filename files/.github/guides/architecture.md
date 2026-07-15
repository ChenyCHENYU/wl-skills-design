# 架构说明

## 分层

```text
_manifest.json   路由、状态、动作和上下文事实源
SKILL.md         原生发现元数据与核心工作流
standards/       唯一规则源
sub/             按需加载的领域步骤
templates/       无业务数据的输出骨架
examples/        匿名合成质量对照
prompts/         人工调用快捷入口
guides/          人读文档
```

Skill 目录扁平化放在 `.github/skills/{skill-name}/`，目录名必须与 frontmatter `name` 一致。SKILL 只保留 `name`、`description` 和必要流程，通过相对 Markdown 链接渐进加载资源。

## 路由

动作优先级为 impact、review、validate、repair、maintain、create。精确领域词、负向词、最低分和领先分差共同决定是否运行；回归语料在 `_route-evals.json`。

## 安全边界

验证、评审和影响分析默认只读。创建过程可修复本轮新产物；修改既有文件必须获得明确授权。

## 多编辑器

`.github/copilot-instructions.md` 是精简调度正文，`_compat/editors.json` 和 headers 生成 9 个 profile。CLI 默认只安装 `agents`，避免同一客户端同时读取 AGENTS、Copilot、Cursor 或兼容规则造成重复上下文。

## 扩展 Skill

1. 创建 `.github/skills/{skill-name}/SKILL.md`，名称使用小写连字符。
2. frontmatter 只写 `name` 和包含使用场景/负例的 `description`。
3. 详细规则放 standards，资源放 sub/templates/examples 并从 SKILL 直接链接。
4. 更新 manifest、registry、路由语料、README 和测试。
5. 运行 `npm run sync && npm run verify`。
