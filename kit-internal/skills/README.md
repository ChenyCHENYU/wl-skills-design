# Skill 维护清单

> 本文件记录当前 Skill 的开发状态、规划优先级和接手说明。  
> AI 不读本文件。仅供维护者使用。

---

## 已发布 Skill

| Skill | 版本 | 路径 | 关联规范 | 备注 |
|-------|------|------|---------|------|
| 流程图设计 | v1.0 | `requirements/flowchart/` | `standards/01-flowchart.md` | draw.io 泳道图规范 |
| 需求设计说明书 | v1.0 | `requirements/spec/` | `standards/06-spec-doc.md` | IPO 表 / 流程说明 / 活动说明表 / 报表设计，含 4 个 sub-skill + 4 个 examples |
| 数据库设计 | v1.0 | `data/database/` | `standards/03-database.md` | ER / DB 清单 / 数据字典（10 列）/ DDL，含 4 sub + 3 templates，30 项验证 + spec 联动 |
| 接口设计 | v1.0 | `api/restful/` | `standards/04-api-design.md` | 集成报文 / RESTful，含 4 sub + 4 templates，35 项验证 + spec/DB 联动 |
| 设计集成评审 | v1.0 | `cross/design-review/` | `standards/07-design-review.md` | 聚合 spec/DB/IF 三份产物，4 维度评分 + D4 联动 18 项 + 追溯矩阵 + P0 一票否决，含 3 sub + 1 template |
| 术语字段词典 | v1.0 | `cross/glossary/` | `standards/08-glossary.md` | 字段对齐中央锚点：中英文名/枚举/编码统一语言，18 项验证（GL-A/B/C/X），含 3 sub + 1 template |

---

## 规划中 Skill

| Skill | 优先级 | 类别 | 关联规范 | 预估工作量 |
|-------|-------|------|---------|---------|
| 测试用例/验收标准设计 | 🟡 中 | (待定) | 待写 | 从 IPO 处理逻辑 + 状态机推导 Given-When-Then 用例 |
| 非功能性需求（NFR）规范 | 🟡 中 | (待定) | 待写 | 性能/并发/可用性/安全/数据量级清单，补集成评审易漏维度 |
| 数据指标/埋点设计 | 🟢 低 | (待定) | 待写 | 从功能 IPO 推导埋点事件与指标口径 |
| 原型设计 | 🟡 中 | requirements | 02-prototype.md（待写） | 规范 + SKILL.md + 模板 |
| 代码结构设计 | 🟢 低 | code | 05-code-design.md（待写） | 规范 + SKILL.md |

> **术语词典已落地（v0.4.0）**：作为 spec↔DB↔接口字段对齐的中央锚点，
> 字段对不齐从「评审时发现」提前到「设计时杜绝」，并将 DB-X / IF-X / D4 的两两互比升级为「各自与词典比对」。

---

## 开发新 Skill 的步骤

参见 `kit-internal/CONTRIBUTING.md` 第三节。
