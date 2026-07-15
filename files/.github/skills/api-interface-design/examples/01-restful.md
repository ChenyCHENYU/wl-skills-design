# 匿名合成样例 · HTTP 申请提交接口

> 本文件不对应任何组织、域名、账号或线上请求。空白起点使用 [HTTP API 模板](../templates/restful-def.md)。

## profile

| 项 | 值 |
|----|----|
| contract | OpenAPI 3.1 + Markdown |
| protocol | HTTPS |
| auth | OAuth2，scope `request:write` |
| responseModel | HTTP 原生状态 + JSON body |
| errorModel | RFC 9457 Problem Details |
| idempotency | `Idempotency-Key`，24 小时 |
| dateTime | RFC 3339 UTC |

## API-DEMO-001 · 提交申请

| 项 | 内容 |
|----|------|
| operationId | `submitRequest` |
| Method / URI | `POST /requests` |
| 成功状态 | `201 Created`，Location 指向新资源 |
| 并发 | 新建不适用；重复幂等键返回首次结果 |

### 请求字段

| 字段 ID | 字段 | schema | 必填 | 约束 |
|---------|------|--------|------|------|
| FIELD-DEMO-TITLE | `requestTitle` | string | 是 | 1～100 字 |
| FIELD-DEMO-TYPE | `requestType` | string | 是 | 词典 `ENUM-DEMO-TYPE` |
| FIELD-DEMO-NOTE | `additionalNote` | string/null | 否 | 最多 500 字；特定类型时必填 |

### 请求示例

```json
{
  "requestTitle": "DEMO request",
  "requestType": "STANDARD",
  "additionalNote": null
}
```

### 成功响应 `201`

```json
{
  "requestId": "DEMO-001",
  "requestStatus": "PENDING",
  "createdAt": "2026-07-15T00:00:00Z"
}
```

### 错误响应

| HTTP 状态 | type | 条件 | 调用方动作 |
|----------|------|------|-----------|
| 400 | `https://example.invalid/problems/validation` | 字段校验失败 | 展示字段问题，不重试 |
| 401 | `https://example.invalid/problems/unauthenticated` | 未认证 | 重新认证 |
| 403 | `https://example.invalid/problems/forbidden` | scope 不足 | 停止并提示授权 |
| 409 | `https://example.invalid/problems/conflict` | 幂等键与不同请求体冲突 | 更换键或核对首次请求 |

```json
{
  "type": "https://example.invalid/problems/validation",
  "title": "Request validation failed",
  "status": 400,
  "instance": "urn:trace:DEMO-TRACE-001",
  "errors": [
    { "field": "requestTitle", "code": "REQUIRED" }
  ]
}
```

## 追溯

`FUNC-DEMO-02 → API-DEMO-001 → FIELD-DEMO-* → req_request.*`。示例 URI 使用保留域名 `.invalid`，不得替换为线上地址后提交。
