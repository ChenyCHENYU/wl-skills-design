# 模板 — 接口清单（interface-list）

> 规范见 `standards/04-api-design.md §九`。置于分册 `00-api-overview.md` 开头。

## 接口清单

| 接口编码 | 接口名称 | 类型 | 源→目标 | 关联 spec 功能编码 | 关联 DB 表 |
|---------|---------|------|---------|-------------------|-----------|
| `QM_PM_B_01` | 订单下达推送 | 集成-批次 | QM→PM | PMPM007 | `pmom_order_main` |
| `QM_PM_B_02` | 订单完工回传 | 集成-批次 | PM→QM | PMPM012 | `pmom_order_main` |
| `POST /api/v1/orders` | 新增订单 | RESTful | 前端→PM | PMPM007 | `pmom_order_main` |

> 约束：
> - 集成接口编码 **递增唯一**，禁止重复（IF-A02）。
> - 「关联 spec 功能编码」「关联 DB 表」两列必填（IF-X07）。
> - 覆盖检查：spec 需接口功能集合 == 本表关联功能集合（IF-X01/X02）。
