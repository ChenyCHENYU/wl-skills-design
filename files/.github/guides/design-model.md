# 统一设计模型

`docs/design-model.json` 是可选的机器可读事实层，schema 位于 [设计模型 schema](../skills/_design-model.schema.json)。Markdown、DDL、OpenAPI、原型和 draw.io 仍是交付层。

它不是 kit 或 bd 的必需输入。未维护 design-model 时，下游仍可从已评审需求独立建立契约；维护时则使用稳定 ID 增强跨文档追踪。

```bash
wl-skills-design validate-model --model docs/design-model.json
wl-skills-design validate-model --model docs/design-model.json --json
```

校验器检查 JSON、稳定 ID 格式与全局唯一性、字段/功能/页面/表/API 引用、追踪端点和兼容 profile 版本。后端实体 externalId 对应 `table.id`，前端页面 externalId 对应 `screen.id`，字段对应 `field.id`。

错误码速查：

| 码 | 含义 |
|----|------|
| DM001–DM002 | 稳定 ID 格式非法 / 引用数组重复 |
| DM003–DM005 | schemaVersion、必填数组或集合元素类型错误 |
| DM006 / DM007–DM010 | 稳定 ID 重复 / 各类引用字段不是数组或引用断链 |
| DM011–DM013 | 追踪端点、追踪类型或 API profile 协议问题 |
| DM014–DM018 | 缺少必填字段、含未定义字段、`nameEn`/`operationId` 命名非法、`source.path` 缺失 |
| DM101–DM104 | 警告：协议版本漂移、页面/表/API 集合为空 |

## 使用原则

1. 为字段、功能、流程、页面、表和 API 分配稳定 ID。
2. 在模型中维护名称、类型、来源和追踪关系；展示文档引用这些 ID。
3. 跨文档检查优先做 ID 集合比较，再回到源文件输出证据位置。
4. 模型与现有文档冲突时先报告差异，不自动覆盖任何一方。
5. 不掌握的事实省略或标记 Pending，不写虚构值。

## 推荐演进

- 新项目：先建立字段、功能和 profile，再逐步补流程、页面、表和 API。
- 既有项目：先从词典和功能编码抽取最小模型，不要求一次迁移所有内容。
- CI：校验 schema、ID 唯一性、引用存在性和关键集合闭环。
