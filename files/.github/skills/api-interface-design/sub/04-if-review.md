# Sub-Skill 04 — 接口设计只读评审

> 唯一检查源：[接口标准](../../../standards/04-api-design.md) §十～§十二。

1. 读取接口 profile、Markdown、OpenAPI、spec、词典和 DB；缺失输入显著标注。
2. 执行 IF-A/B/C/D/X 共 38 项，每项记录 `Pass/Fail/Pending/NotApplicable`、规则 ID、证据路径和锚点。
3. 检查计数守恒：`Pass + Fail + Pending + NotApplicable = 38`。
4. OpenAPI profile 下解析契约，检查 operationId、schema、`$ref`、security 和示例。
5. 执行稳定 ID 集合比对；字段不持久化或功能无需服务端行为时，只有存在证据才可标 NotApplicable。
6. 按跨文档断点、安全/正确性、契约完整性、文档质量排序问题。

默认只在对话中返回报告，不修改、不保存。用户明确要求 repair 后才修改既有文件并复验；用户明确要求保存报告时写入 `docs/api/reports/IF_REVIEW_{模块}_{日期}.md` 并回显路径。
