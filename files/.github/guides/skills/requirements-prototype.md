# 原型标注 Skill — 使用说明

AI 执行入口为 `requirements-prototype/SKILL.md`。

## 能力与边界

该 Skill 把需求功能转换为结构化原型标注，覆盖布局、字段、按钮、状态、权限、交互和跨文档追溯。它产出开发就绪说明，不代替视觉品牌稿或前端实现。

- `create`：生成 D1、D2 或 D3 标注并验证本轮产物。
- `validate` / `review`：只读执行 23 项检查，不默认保存报告。
- `repair`：得到明确授权后修改既有标注。

目标等级未说明时默认 D3，但会把缺少的字段来源、交互或权限标记 Pending。

## 推荐请求

```text
为 REQ002 申请编辑页生成 D3 原型标注，字段来自现有词典。
只读评审 docs/prototype/REQ002-申请编辑页.md，不要修改。
```

## 深度等级

| 等级 | 内容 |
|------|------|
| D1 | 页面模式、区域和导航骨架 |
| D2 | 字段稳定 ID、逻辑类型、控件和词典引用 |
| D3 | 按钮、状态、权限、联动、异常、可访问性和 API 追溯 |

## 输出与验证

默认路径为 `docs/prototype/{功能编码}-{页面名称}.md`。标注需保持 `spec 功能 → 页面 → 字段/按钮 → API/词典` 可追溯，并报告 PT-A/B/C/X 共 23 项的 Pass、Fail、Pending 和 NotApplicable。

空白起点使用 `templates/page-annotation.md`；`examples/01-page-annotation.md` 是匿名合成质量对照，不提供任何项目事实，也不承诺未经基准测试的代码还原比例。
