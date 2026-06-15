# Demo · 设备点检管理 全链路设计样张

> 一套**最小但骨架完整**的设计交付物，演示 wl-skills-design 七大能力中可落盘的 5 个产物如何串成闭环。
> 业务场景：设备点检（功能编码 `EQIP001`、流程编码 `EQIP-A-01`、服务缩写 `eqm`）。
> 内容精简，但每份产物都严格套用对应 `templates/` 骨架，可直接作为新模块的起点。

## 全链路索引

| # | 设计域 | 文件 | 骨架来源（模板）|
|---|-------|------|----------------|
| 1 | 流程图 | [docs/flow/01-equipment-inspection.drawio](docs/flow/01-equipment-inspection.drawio) | `flowchart/templates/skeleton.drawio` |
| 2 | 系统需求设计 | [docs/spec/equipment/ch1-3.md](docs/spec/equipment/ch1-3.md) · [4.1-inspection.md](docs/spec/equipment/4.1-inspection.md) | `spec/templates/doc-skeleton.md` |
| 3 | 数据库设计 | [docs/db/00-db-overview.md](docs/db/00-db-overview.md) · [01-inspection.md](docs/db/01-inspection.md) | `database/templates/{db-skeleton,data-dictionary}.md` |
| 4 | 接口设计 | [docs/api/00-api-overview.md](docs/api/00-api-overview.md) · [01-inspection.md](docs/api/01-inspection.md) | `restful/templates/{if-skeleton,restful-def}.md` |
| 5 | 原型页面 | [docs/prototype/01-inspection-list.html](docs/prototype/01-inspection-list.html) | `prototype/templates/page-annotation.md` + wl-skills-ui `list-page` 骨架 |

## 设计链路

```
流程图(EQIP-A-01) → 需求设计(EQIP001 IPO) → 原型(LIST 页) ┐
                              ↓                          │
                        数据库(2 表) ── 三角联动 ── 接口(2 个 RESTful)
```

## 三角联动自检（spec → DB → API 字段一致）

| 业务含义 | spec IPO | DB 字段 | API 字段 | 一致 |
|---------|---------|---------|---------|------|
| 点检单号 | 点检单号 | `inspection_no` | `inspectionNo` | ✅ |
| 设备编码 | 设备编码 | `device_code` | `deviceCode` | ✅ |
| 点检日期 | 点检日期 | `inspection_date` | `inspectionDate` | ✅ |
| 点检状态 | 点检状态 | `inspection_status` | `inspectionStatus` | ✅ |
| 点检结论 | 点检结论 | `result` | `result` | ✅ |
| 点检项目 | 点检项目 | `item_name` | `items[].itemName` | ✅ |
| 标准值 | 标准值 | `standard_value` | `items[].standardValue` | ✅ |
| 实测值 | 实测值 | `actual_value` | `items[].actualValue` | ✅ |

> 状态机三处一致：`DRAFT → SUBMITTED → CONFIRMED`（spec §4.1.4.1.2 / DB 默认值 / 原型 data-show 条件）。

## 骨架完整性自检

- ✅ **流程图**：Tab1 图例页 + Tab2 泳道流程；3 层 GROUP 节点（编码/名称/岗位）；紫色起止；菱形判定带「正常/异常」分支标签；活动编码 `EQIP-A-01-E-0x`。
- ✅ **需求设计**：ch1-3（系统目标/组织岗位/术语/流程清单/功能层级）+ 4.1（流程清单/流程说明+活动表/画面对照表/IPO 表+状态机/内部接口）。
- ✅ **数据库**：4 节齐全（ER / DB 清单 / 数据字典含 7 系统字段+索引 / DDL）；overview 含 spec→DB 联动矩阵。
- ✅ **接口**：每接口 4 段（触发条件/请求/应答统一包装/错误码）；overview 含接口清单+错误码清单+安全说明；写操作声明幂等键。
- ✅ **原型**：list-page 骨架（search/toolbar/table/pager）+ 设计令牌；7 区块覆盖；dict 字段标 dictCode；可被 prototype-scan 扫描的 `data-*` 锚点。
