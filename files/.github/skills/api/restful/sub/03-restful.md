# Sub-Skill 03 — HTTP / RESTful 接口设计

> 规范来源：`standards/04-api-design.md §三/§四（4.3）/§五/§六/§七`。本文件只讲操作。

## 目标

设计一个内部 HTTP/RESTful 接口：URL/Method/鉴权 + 请求参数 + 统一响应包装 + 错误码。

## 步骤

### Step 1 — URL 与 Method（§三）

- 资源名词复数 + 版本号：`POST /api/v1/orders`、`GET /api/v1/orders/{id}`。
- 方法语义：GET 查 / POST 增 / PUT 全量改 / PATCH 部分改 / DELETE 删（逻辑删）。

### Step 2 — 鉴权与安全（§六）

标注：认证方式（Token/JWT）、是否签名、HTTPS、敏感字段加密、防重放。

### Step 3 — 请求参数表（6 列，复用报文格式）

| 序号 | 中文字段 | 英文字段 | 类型 | 描述 | 备注 |
|------|---------|---------|------|------|------|

### Step 4 — 统一响应包装（§4.3）

```json
{ "code": "0", "msg": "success", "traceId": "...",
  "data": { } }
```

### Step 5 — 状态码 + 错误码（§3.3 + §五）

- HTTP 状态码：200/201/400/401/403/404/409/500。
- 业务错误码：`[模块码]-[类型E/S/V]-[序号]`，如 `PM-V-001`。

### Step 6 — 幂等与 SLA（§七）

POST/PATCH 定义业务幂等键；标注超时阈值与重试策略。

## 验证（交给 04-if-review）

IF-A 命名（URL/Method）、IF-B 包装、IF-C 安全/幂等、IF-D 错误码。
