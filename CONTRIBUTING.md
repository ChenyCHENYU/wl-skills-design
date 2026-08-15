# 贡献指南

感谢参与 wl-skills-design。本项目是面向 AI Agent 的产品设计技能包：设计规范、原生 Skill、机器验证 CLI 与安全安装器。

## 快速开始

```bash
git clone https://github.com/ChenyCHENYU/wl-skills-design.git
cd wl-skills-design
npm ci --ignore-scripts
npm run verify
```

Node.js >= 20。`npm run verify` 覆盖：结构检查（doctor）、编辑器派生漂移、CLI 事务测试、机械验证测试与真实 npm 载荷冒烟。

## 项目结构

```text
files/.github/standards/   设计规范（唯一规则源，含 [M]/[J] 验证标记）
files/.github/skills/      原生 Agent Skill + manifest + 路由语料
files/.github/prompts/     VS Code Prompt
bin/ lib/                  安全安装 CLI、design-model 校验、机械验证器
scripts/                   doctor、派生同步、打包冒烟
demo/                      匿名合成全链路样例（verify 全绿）
kit-internal/              维护者文档与内部材料（不发布）
```

## 贡献原则

- 规范是规则真源；Skill 只写工作流；模板只含占位符；样例必须匿名合成。
- 修改检查项数量或触发词时，同步 manifest、Prompt、模板、指南、测试与 README（详见 `kit-internal/CONTRIBUTING.md`）。
- 新增触发词必须同时补路由正例、负例或歧义例（`_route-evals.json`）。
- `validate`、`review`、`impact` 默认只读；`repair` 必须明确授权。
- 任何提交不得包含客户、组织、地点、账号、令牌或生产数据；隐私扫描在 doctor 中强制执行。
- 验证清单改动需保持 [M]/[J] 标记与 `wl-skills-design verify` 实现一致；[M] 项必须有对应机械实现或明确列为 skip。

## 提交规范

使用简洁中文 Conventional Commit：

```text
feat: 新增文档接入差距分析能力
fix: 修正活动编码连续性判定
docs: 同步验证标记说明
```

提交前运行 `npm run verify`；CI 在 Windows/Linux × Node 20/22/24 矩阵上复验。

## 发布

维护者发布流程见 `kit-internal/README.md`；发布由 CI 使用 npm Trusted Publishing 完成，不接受人工 token 提交。

## 行为准则与安全披露

见 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) 与 [SECURITY.md](./SECURITY.md)。
