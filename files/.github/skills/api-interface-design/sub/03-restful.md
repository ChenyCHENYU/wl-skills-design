# Sub-Skill 03 — HTTP API

> 规则来源：[接口标准](../../../standards/04-api-design.md) §三～§七。

## 输入门禁

先确认 protocol、auth、responseModel、errorModel、pagination、versioning、idempotency、dateTime 和 decimal profile。未确认项给出建议并标注假设或 Pending，不得描述为全项目固定规则。

## 步骤

1. 定义稳定 API ID、operationId、URI、HTTP 方法和状态码语义。
2. 定义请求、成功响应和错误响应 schema；字段使用稳定 ID 和 OpenAPI/JSON Schema 逻辑类型。
3. 列表接口声明分页、排序稳定性、过滤和空值语义。
4. 写操作声明幂等、并发冲突、超时、重试与补偿。
5. 按暴露面定义认证、授权、数据最小化、日志脱敏和速率限制等安全策略。
6. 提供语法有效且符合 schema 的匿名合成 JSON；OpenAPI profile 下同步生成或更新 OpenAPI 3.1。

## 输出检查

- HTTP 状态和错误模型一致，不把所有结果包装为 200。
- 时间使用 RFC 3339 时区，布尔使用 JSON boolean；小数服从 profile。
- security scheme 与文档一致，不放实际 Token、域名或账号。
- API 字段与 spec/词典/DB 通过稳定 ID 追溯。

验证 IF-A/B/C/D/X；缺对端时标 Pending。
