# Skill 触发词路由表（人读索引）

> **AI 执行规则**：机器可读路由以 `_manifest.json` 为唯一执行源。  
> 本文件仅作为人读索引，必须与 `_manifest.json` 保持一致，由 `npm run check` 校验。  
> 禁止在各 `SKILL.md` 中重复定义触发关键词。

---

## 路由总表

| Skill 名称 | 状态 | SKILL.md 路径 | 触发关键词 |
|-----------|------|--------------|-----------|
| 流程图设计 | ✅ v1.0 | `requirements/flowchart/SKILL.md` | 流程图、泳道图、泳道、flowchart、draw.io、业务流程、生产流程、工作流 |
| 需求设计说明书 | ✅ v1.0 | `requirements/spec/SKILL.md` | 需求设计说明书、spec、功能设计、IPO表、IPO、流程说明、活动说明、画面逻辑、功能规格、处理逻辑、说明书 |
| 原型设计 | ✅ v1.0 | `requirements/prototype/SKILL.md` | 原型、线框图、prototype、页面设计、UI 草图、页面标注、交互模式、原型标注、页面清单 |
| 数据库设计 | ✅ v1.0 | `data/database/SKILL.md` | 数据库、ER 图、表结构、实体关系、数据字典、DDL、database、schema |
| 接口设计 | ✅ v1.0 | `api/restful/SKILL.md` | 接口、API、RESTful、OpenAPI、接口文档、报文、集成接口、swagger |
| 设计集成评审 | ✅ v1.0 | `cross/design-review/SKILL.md` | 评审、评审报告、评分、设计评审、集成评审、质量评审、追溯矩阵、一致性检查、整体评审、review |
| 术语字段词典 | ✅ v1.0 | `cross/glossary/SKILL.md` | 术语、词典、字段词典、统一语言、字段对齐、字段映射、glossary、术语表、数据字典对齐、命名统一 |
| 代码结构设计 | 🔲 规划中 | `code/architecture/SKILL.md` | 代码结构、分层设计、架构设计、领域模型、DDD |

> ⚠️ **规划中（🔲）的 Skill 其 SKILL.md 文件尚未创建**。命中其触发词时，**不要尝试读取对应 SKILL.md**（会失败），应直接告知用户「该能力规划中，当前不可用」并建议改用已发布能力。

---

## 调度规则（摘要）

完整可执行规则见 `_manifest.json.routingPolicy`。

### 1. 意图识别优先级

```
精确触发词 > 语义触发描述 > 上下文完整度 > 询问用户确认
```

### 2. 调度前置检查

调用任意 Skill 前，先读取 `_manifest.json` 并确认：
- [ ] Skill 状态为 ✅（规划中的 Skill 不可调用，提示用户）
- [ ] 用户意图达到最低置信度
- [ ] `requiredContext` 已满足或只缺少少量可追问信息
- [ ] 无歧义（若有歧义，列出候选 Skill 供用户选择）

### 3. 调度后置输出

执行完成后，输出：
- 使用了哪个 Skill
- 参考了哪个规范文件
- 产物路径（如有）

---

## 维护说明

- **新增 Skill**：在表格末尾追加一行，状态设为 🔲；在对应目录创建 `SKILL.md` + `USAGE.md` 后，改状态为 ✅
- **修改触发词**：先改 `_manifest.json`，再同步本表；各 `SKILL.md` 中不得出现触发词定义
- **弃用 Skill**：状态改为 ⚠️ 已弃用，保留记录，不要删除行
