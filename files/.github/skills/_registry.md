# Skill 触发词路由表

> **AI 读取规则**：本文件是所有 Skill 的**唯一调度数据源**。  
> 禁止在各 `SKILL.md` 中重复定义触发关键词。  
> 调度流程：识别关键词 → 找到路径 → 读取对应 `SKILL.md` → 执行。

---

## 路由总表

| Skill 名称 | 状态 | SKILL.md 路径 | 触发关键词 |
|-----------|------|--------------|-----------|
| 流程图设计 | ✅ v1.0 | `requirements/flowchart/SKILL.md` | 流程图、泳道图、泳道、flowchart、draw.io、业务流程、生产流程、工作流 |
| 需求设计说明书 | ✅ v1.0 | `requirements/spec/SKILL.md` | 需求设计说明书、spec、功能设计、IPO表、IPO、流程说明、活动说明、画面逻辑、功能规格、处理逻辑、说明书 |
| 原型设计 | 🔲 规划中 | `requirements/prototype/SKILL.md` | 原型、线框图、prototype、页面设计、UI 草图 |
| 数据库设计 | ✅ v1.0 | `data/database/SKILL.md` | 数据库、ER 图、表结构、实体关系、数据字典、DDL、database、schema |
| 接口设计 | ✅ v1.0 | `api/restful/SKILL.md` | 接口、API、RESTful、OpenAPI、接口文档、报文、集成接口、swagger |
| 代码结构设计 | 🔲 规划中 | `code/architecture/SKILL.md` | 代码结构、分层设计、架构设计、领域模型、DDD |

---

## 调度规则

### 1. 意图识别优先级

```
精确匹配触发词 > 上下文语义推断 > 询问用户确认
```

### 2. 调度前置检查

调用任意 Skill 前，先确认：
- [ ] Skill 状态为 ✅（规划中的 Skill 不可调用，提示用户）
- [ ] 用户意图与触发词匹配
- [ ] 无歧义（若有歧义，列出候选 Skill 供用户选择）

### 3. 调度后置输出

执行完成后，输出：
- 使用了哪个 Skill
- 参考了哪个规范文件
- 产物路径（如有）

---

## 维护说明

- **新增 Skill**：在表格末尾追加一行，状态设为 🔲；在对应目录创建 `SKILL.md` + `USAGE.md` 后，改状态为 ✅
- **修改触发词**：只在本文件修改，各 `SKILL.md` 中不得出现触发词定义
- **弃用 Skill**：状态改为 ⚠️ 已弃用，保留记录，不要删除行
