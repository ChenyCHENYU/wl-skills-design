# 匿名合成样例 · 申请状态事件

> 本文件使用 `SRC/DST/DEMO` 合成代号，不对应任何组织、产品或线上消息。

## profile

| 项 | 值 |
|----|----|
| protocol | 消息代理，JSON Schema |
| auth | mTLS，由平台管理 |
| delivery | at-least-once，按 `eventId` 幂等 |
| ordering | 同一 `requestId` 分区内有序 |
| dateTime | RFC 3339 UTC |
| retry | 指数退避 3 次，之后进入隔离队列 |

## API-DEMO-EVT-001 · `SRC_DST_EVT_01`

### 触发与投递

| 项 | 内容 |
|----|------|
| 业务触发 | 申请状态从 `PENDING` 变为最终状态后发布 |
| 频次与容量 | 单事件；峰值和大小上限由平台 profile 提供 |
| 协议与版本 | 已声明消息协议；schemaVersion `1` |
| 序列化 | UTF-8 JSON |
| 数据通道 | `SRC → DST` |
| 投递语义 | 至少一次；同一申请有序；消费者按 eventId 去重 |

### 字段

| # | 字段 ID | 中文字段 | 英文字段 | 契约类型 | 必填/可空 | 约束 |
|---|---------|---------|---------|---------|----------|------|
| 1 | FIELD-DEMO-EVENT-ID | 事件 ID | `eventId` | string | 必填/非空 | 全局唯一 |
| 2 | FIELD-DEMO-ID | 申请 ID | `requestId` | string | 必填/非空 | 分区键 |
| 3 | FIELD-DEMO-STATUS | 申请状态 | `requestStatus` | string | 必填/非空 | 词典枚举 |
| 4 | FIELD-DEMO-OCCURRED | 发生时间 | `occurredAt` | string(date-time) | 必填/非空 | RFC 3339 UTC |
| 5 | FIELD-DEMO-VERSION | schema 版本 | `schemaVersion` | integer | 必填/非空 | 当前为 1 |

### 消息示例

```json
{
  "eventId": "DEMO-EVENT-001",
  "requestId": "DEMO-REQUEST-001",
  "requestStatus": "APPROVED",
  "occurredAt": "2026-07-15T00:00:00Z",
  "schemaVersion": 1
}
```

### 失败与恢复

- schema 不合法：拒绝并记录稳定错误标识，不自动转换字段。
- 短暂依赖失败：按 profile 退避重试。
- 超过最大次数：进入隔离队列并生成可追踪告警。
- 重复 eventId：返回已处理，不重复执行业务副作用。

消息不含个人信息、账号、令牌或内部地址；日志只记录事件 ID、schema 版本和处理结果。
