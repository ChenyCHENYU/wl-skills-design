# kit-internal — 维护者入口

本目录不随 npm 包发布，只记录维护流程、架构决策与内部验证材料。

## 当前约定

- 发布内容来自 `files/`、`bin/`、`lib/`、`README.md`、`README.en.md` 和 `CHANGELOG.md`；`LICENSE`/`NOTICE` 由 npm 自动随包。
- 每个 Skill 位于 `files/.github/skills/<skill-name>/SKILL.md`，目录名必须与 frontmatter 的 `name` 完全一致。
- 人读指南集中在 `files/.github/guides/skills/`，Skill 目录内不放 `README.md` 或 `USAGE.md`。
- `_manifest.json` 是路由执行源，`_route-evals.json` 是确定性回归集，`_registry.md` 是人读索引。
- `templates/` 只含占位结构；`examples/` 必须是匿名合成数据，不得包含客户、地点、人员、域名、账号或生产数据。
- 验证与评审默认只读；只有明确授权后才可修复既有文件。
- 编辑器配置由 `scripts/sync-editors.js` 生成，禁止手工修改派生文件。

## 维护命令

```bash
npm ci --ignore-scripts
npm run sync
npm run verify
npm audit --audit-level=moderate
npm pack --dry-run --ignore-scripts
```

详细流程见 [贡献指南](./CONTRIBUTING.md)，当前架构见 [ADR](./architecture.md)，Skill 清单见 [维护清单](./skills/README.md)。

## 发布约定

1. 更新代码、README、维护文档和 CHANGELOG。
2. 运行 `npm run verify`、`npm audit` 与 `npm pack --dry-run`。
3. 使用 `npm version minor --no-git-tag-version` 更新版本并同步派生文件。
4. 提交并推送后创建同名 `vX.Y.Z` 标签。
5. 通过 GitHub Actions `Publish` 工作流（npm 环境 + OIDC provenance）发布；不在本机保存或使用 npm token。

鉴权信息只能放在受保护的 CI secret 中，不得写入仓库或本地文件。
