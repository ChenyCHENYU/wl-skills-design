# 模板 · HTTP API

> 纯结构占位符。不得把示例 profile 当成项目事实。

## `{API-ID}` `{接口名称}`

### 元信息

| 项 | 内容 |
|----|------|
| operationId | `{operationId}` |
| Method / URI | `{METHOD} {resource-uri}` |
| 成功状态 | `{HTTP status}` |
| 认证/授权 | `{security scheme + scope/policy}` |
| 幂等/并发 | `{策略/NA + 理由}` |
| 分页 | `{profile/NA}` |

### 请求与响应 schema

| # | 字段稳定 ID | 字段 | 契约类型 | 必填/可空 | 约束 |
|---|------------|------|---------|----------|------|
| 1 | `{FIELD-ID}` | `{fieldName}` | `{schema type}` | `{required/nullable}` | `{约束}` |

### 错误响应

| HTTP 状态 | 稳定错误标识/type | 条件 | 字段问题 | 调用方动作 |
|----------|-------------------|------|---------|-----------|

### 匿名合成示例

```json
{
  "requestId": "DEMO-001",
  "status": "PENDING"
}
```

### 安全、可靠性、兼容性与追溯

`{privacy/logging/rate limits/timeout/retry/version/deprecation/spec-field-db links}`
