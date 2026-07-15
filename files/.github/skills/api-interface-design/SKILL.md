---
name: api-interface-design
description: 从需求和数据库设计生成或检查系统集成报文、RESTful 接口及可选 OpenAPI 3.1，覆盖触发条件、请求响应、错误、安全、幂等和跨文档追溯。用于接口设计、API 设计、接口文档、报文、OpenAPI 或 Swagger；不要用于排查 API 调用错误、网络问题或 SDK bug。
---

# 接口设计

## 模式与契约

- `create`：生成接口设计并验证本轮产物。
- `validate`：只读执行 38 项检查。
- `review`：与 `validate` 相同，只读给出评审结论，不默认保存报告。
- `repair`：用户明确授权后修改既有设计。

至少确认接口目标或调用场景。生成前确认协议、认证、响应包装、分页、幂等和版本策略；这些策略不得被描述成所有项目通用的固定值。

## 执行流程

1. 读取唯一规则源：[接口标准](../../standards/04-api-design.md)。
2. 从 [接口分册骨架](./templates/if-skeleton.md) 开始，按需读取：
   - [接口清单](./sub/01-interface-list.md)
   - [系统集成报文](./sub/02-integration.md)
   - [RESTful 接口](./sub/03-restful.md)
   - [接口评审](./sub/04-if-review.md)
3. 用户要求 OpenAPI/Swagger 时，以 [OpenAPI 3.1 模板](./templates/openapi-3.1.yaml) 生成机器可读契约，并与 Markdown 字段一致。
4. 建立 `spec 功能 → 接口 → DB/词典字段` 追溯，执行 IF-A/B/C/D/X 共 38 项检查。

## 交付约束

- 响应包装、错误模型和分页格式必须来自项目 profile；未提供时给出推荐值并标注假设。
- OpenAPI 文件必须可解析，operationId 唯一，schema 引用有效。
- 验证模式只读；创建模式仅自动修复本轮新产物。
- 最终说明接口清单、契约、38 项结果和保存状态；只有实际生成或保存的文件才给出路径。
