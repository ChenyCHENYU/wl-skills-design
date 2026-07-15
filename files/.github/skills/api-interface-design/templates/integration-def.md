# 模板 · 系统集成接口

> 纯结构占位符。所有 profile 和业务事实都必须由项目确认。

## `{API-ID}` `{接口名称}`

### 元信息与触发

| 项 | 内容 |
|----|------|
| 编码 | `{SRC}_{DST}_{KIND}_{NN}` |
| 业务触发 | `{事件与前置状态}` |
| 频次与容量 | `{频次/峰值/大小上限}` |
| 协议与版本 | `{协议/版本}` |
| 序列化 | `{格式/字符集/schema 版本}` |
| 数据通道 | `{SRC} → {DST}` |
| 投递语义 | `{单笔/批量/顺序/至少一次等}` |

### 请求字段

| # | 字段稳定 ID | 中文字段 | 英文字段 | 契约类型 | 必填/可空 | 描述与约束 |
|---|------------|---------|---------|---------|----------|-----------|
| 1 | `{FIELD-ID}` | `{名称}` | `{fieldName}` | `{schema type}` | `{required/nullable}` | `{约束}` |

### 响应/回执与错误

`{按 responseModel/errorModel profile 定义；不固定包装}`

### 匿名合成示例

```json
{
  "requestId": "DEMO-001",
  "status": "PENDING"
}
```

### 安全、可靠性与追溯

`{auth/authorization/transport/privacy/idempotency/timeout/retry/compensation/trace links}`
