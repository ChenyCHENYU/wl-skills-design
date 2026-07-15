# Sub-Skill 01 — 接口清单与覆盖

> 规则来源：[接口标准](../../../standards/04-api-design.md) §二、§九、§十一。

## 步骤

1. 从 spec 提取明确需要服务端行为、跨系统交换或已有内部接口声明的功能。
2. 记录接口稳定 ID、编码/operationId、类型、协议、提供方、消费方、关联功能 ID、字段 ID 和数据落点。
3. 系统代号、KIND/type 码和命名格式必须来自词典/profile，不从样例复制。
4. 执行集合检查：

```text
SET_SPEC_SERVER_FN ⊆ SET_API_FN
SET_API_FN ⊆ SET_SPEC_FN ∪ SET_INTEGRATION_EVENT ∪ SET_ARCH_EXCEPTION
API 稳定 ID、编码和 operationId 均唯一
```

并非每个页面操作都需要独立 API。无法判断是否有服务端行为时标 Pending，不得为了“覆盖率”制造接口。

## 输出

| API 稳定 ID | 编码/operationId | 名称 | 类型/协议 | 提供方→消费方 | 功能 ID | 字段 ID | 数据落点 |
|-------------|------------------|------|----------|----------------|---------|---------|---------|

验证 IF-A 与 IF-X01/X02/X07/X08；缺对端时保留 Pending 和证据需求。
