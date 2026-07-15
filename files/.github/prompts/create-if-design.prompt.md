---
agent: agent
description: 生成集成报文、RESTful 接口及可选 OpenAPI 3.1 契约
---

# 创建接口设计

任务：`${input:task:请描述接口目标、调用方、触发条件、字段和安全要求}`

1. 读取 [接口 Skill](../skills/api-interface-design/SKILL.md) 和 [接口标准](../standards/04-api-design.md)。
2. 确认协议、认证、响应包装、分页、版本和幂等 profile。
3. 使用 [接口骨架](../skills/api-interface-design/templates/if-skeleton.md) 生成接口清单和定义。
4. 用户要求 OpenAPI/Swagger 时，同时使用 [OpenAPI 3.1 模板](../skills/api-interface-design/templates/openapi-3.1.yaml) 生成可解析契约。
5. 对本轮新产物执行 IF-A/B/C/D/X 共 38 项验证、必要修复和复验。
