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

---

## 规划中 Skill

| Skill | 优先级 | 类别 | 关联规范 | 预估工作量 |
|-------|-------|------|---------|---------|
| 原型设计 | 🟡 中 | requirements | 02-prototype.md（待写） | 规范 + SKILL.md + 模板 |
| 代码结构设计 | 🟢 低 | code | 05-code-design.md（待写） | 规范 + SKILL.md |

---

## 开发新 Skill 的步骤

参见 `kit-internal/CONTRIBUTING.md` 第三节。
