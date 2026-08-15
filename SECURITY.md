# 安全策略

## 支持版本

| 版本 | 状态 |
| ---- | ---- |
| 0.10.x | 支持 |
| < 0.10 | 不支持 |

## 报告漏洞

请勿在公开 issue 中报告安全漏洞。使用 GitHub 私有漏洞报告（Security → Report a vulnerability）提交，包含：

- 影响范围（安装 CLI、验证器、发布载荷或规范内容）
- 复现步骤与最小样例
- 您建议的缓解措施

我们会在 5 个工作日内响应。修复将按严重度排期，并在 CHANGELOG 中记录（不含敏感细节）。

## 安全边界声明

- CLI 的 `init/update/uninstall` 仅写入受管文件并使用事务备份；`validate-model`、`verify`、`status`、`doctor` 为只读。
- 包内容不执行任何网络请求；`npm pack` 载荷不包含 scripts/tests/kit-internal。
- 供应链：CI 使用 npm Trusted Publishing 与 provenance；依赖审计在 CI 强制执行。
