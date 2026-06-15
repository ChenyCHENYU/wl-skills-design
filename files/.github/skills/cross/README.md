# cross — 跨域集成类 Skill

> ✅ **可用** — v1.0

## Skill 清单

| Skill | 路径 | 触发场景 | 关联规范 |
|-------|------|---------|---------|
| 设计集成评审 | `cross/design-review/SKILL.md` | 对需求/数据库/接口三份产物做整体评审、评分、出报告 | `standards/07-design-review.md` ✅ |
| 术语字段词典 | `cross/glossary/SKILL.md` | 建立字段对齐的中央词典，统一 spec/DB/接口的中英文名/枚举/编码 | `standards/08-glossary.md` ✅ |
| 变更影响分析 | `cross/change-impact/SKILL.md` | 对字段/状态/接口/页面变更做跨文档影响矩阵和补丁计划 | `standards/09-change-impact.md` ✅ |

## 说明

cross 类 Skill 跨越多个设计域（需求 / 数据 / 接口），不属于任何单一域。
设计集成评审消费各产物 validate 的结论（DB_REVIEW / IF_REVIEW / spec），叠加跨文档三角联动与综合评分。
术语字段词典作为字段对齐的中央锚点，让各产物先查词典取标准名、评审时与词典比对（而非两两互比）。
变更影响分析负责增量设计协同：先判断影响域和补丁顺序，再调用单域 Skill 修复并复验。

## 新增 Skill 参考

参见 `kit-internal/CONTRIBUTING.md` 第三节。
