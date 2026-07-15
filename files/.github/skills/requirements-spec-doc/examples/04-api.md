# 匿名合成样例 · 需求级内部接口

> 本文件只展示需求说明书中的接口追溯；完整契约由接口设计 Skill 维护。

## 4.1.5 内部接口

| 接口稳定 ID | 接口编码 | 名称 | 提供方功能 ID | 消费方功能 ID | 输入字段 ID | 输出字段 ID | 触发时机 |
|------------|---------|------|--------------|--------------|------------|------------|---------|
| API-DEMO-001 | API-REQ-001 | 提交申请 | FUNC-DEMO-02 | FUNC-DEMO-02 | FIELD-DEMO-TITLE、FIELD-DEMO-TYPE、FIELD-DEMO-NOTE | FIELD-DEMO-ID、FIELD-DEMO-STATUS | 用户确认提交时 |
| API-DEMO-002 | API-REQ-002 | 审核申请 | FUNC-DEMO-03 | FUNC-DEMO-03 | FIELD-DEMO-ID、FIELD-DEMO-DECISION | FIELD-DEMO-STATUS | 审核角色提交结论时 |

### API-DEMO-001 需求约束

- 请求字段必须来自词典，并与 IPO Input 一致。
- 成功后返回稳定 ID 和状态；失败时不得改变记录状态。
- 重复提交处理、认证、错误模型和响应包装由接口 profile 决定；未提供时标 Pending。
- OpenAPI 的 `operationId`、schema 和错误响应由接口设计产物负责，说明书只保留引用路径。

追溯链：

```text
FUNC-DEMO-02 → API-DEMO-001 → FIELD-DEMO-* → 对应表字段（若数据库设计已提供）
```
