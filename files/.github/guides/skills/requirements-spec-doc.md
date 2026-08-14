# 需求设计说明书 Skill — 使用说明

AI 执行入口为 `requirements-spec-doc/SKILL.md`；本文只供维护者和使用者阅读。

## 能力与边界

该 Skill 生成、验证或修复需求设计说明书的总体设计、流程与活动、功能 IPO、需求级内部接口、权限、数据和报表章节，并维护稳定 ID 追溯。

- `create`：写入五类约定文件，只修复本轮新内容。
- `validate` / `review`：只读返回 43 项结果，不默认保存报告。
- `repair`：用户明确授权后修改既有内容并复验。

它不生成 OpenAPI、DDL 或 draw.io XML；这些任务分别交给接口、数据库和流程图 Skill。

## 推荐请求

```text
为 DEMO 模块生成需求说明书骨架，先列出必须确认的信息。
为 REQ002“提交申请”编写画面逻辑和 IPO，未知规则保留 Pending。
只读评审这份需求说明书，不要修改，也不要保存报告。
```

如果项目代号、模块范围、角色、字段规则或交付格式不清楚，Skill 会使用 `【待补充：说明】` 并标记 Pending，不会从样例补造事实。

## 文件边界

```text
docs/spec/{project-code}/
├── ch1-3.md
├── 4.1-{submodule}.md
├── 4.2-{submodule}.md
├── ...
└── 4.N-data-report.md
```

流程说明与 IPO 必须写入同一子模块文件，不为单个功能创建任意文件。

## 交付阶段

`deliveryFormat=markdown-source` 时，P01–P05 固定页面项标记 Pending；完成 Word 装配并渲染检查后切换为 `final-word`，再验证封面、目录、页眉页脚和分页。Markdown 无法表达的分页能力不能被误判为失败。

## 颗粒度基线

命令按钮（状态变更操作）的处理逻辑必须达到步骤级颗粒度：一行一按钮、编号步骤、一步一事，写明表/字段、字典稳定值、前置校验、审计与履历、联动与外部同步、异常文案原文和展示规则。基线定义见标准 §5.1/§5.2（GB 系列），结构对照见 `examples/05-ipo-granularity.md`。执行类活动（`E`）与命令按钮一一对应，是后端命令端点的需求侧投影。

## 资源

| 路径 | 用途 |
|------|------|
| `standards/06-spec-doc.md` | 唯一规则源和 43 项检查 |
| `templates/doc-skeleton.md` | 文件与章节空白骨架 |
| `sub/01-overview.md` | 第 1～3 章 |
| `sub/02-module-flow.md` | 流程、活动、画面对照和需求级接口 |
| `sub/03-function-ipo.md` | 画面逻辑、状态、联动和 IPO |
| `sub/04-data-report.md` | 外部输入、数据输出和报表 |
| `examples/05-ipo-granularity.md` | 命令按钮步骤级 IPO 颗粒度对照 |
| `examples/`（其余） | `DEMO/REQ` 匿名合成质量对照 |

样例只展示结构。组织、地点、人员、联系方式、域名、账号、令牌和线上数据不得进入样例或模板。
