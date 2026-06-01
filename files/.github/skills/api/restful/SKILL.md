---
name: api-interface-design
description: >
  **接口设计技能** — 按照团队标准生成接口设计（系统集成报文 + HTTP/RESTful）。
  USE FOR: 设计系统集成接口（触发条件五要素 + 主档/明细档报文 + JSON 示例）；
  设计 HTTP/RESTful 接口（URL/Method/状态码/统一响应包装）；从需求说明书（spec）功能编码推导接口清单；
  设计错误码、安全方案、幂等重试；审查已有接口设计是否符合规范。
  DO NOT USE FOR: 数据库设计（用 data/database/SKILL.md）；需求说明书（用 requirements/spec/SKILL.md）；
  流程图（用 requirements/flowchart/SKILL.md）。
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# 接口设计规范（wl-skills-design）

---

## ⚠️ 首先必读：文档拆分策略

**在生成任何内容之前，必须先明确输出文件结构。**

读取 `.github/skills/api/restful/templates/if-skeleton.md`，该文件定义：
- 一份接口分册由哪些文件组成
- 每个接口含哪 4 段（触发条件 / 请求报文 / 应答报文 / 数据结构示例）
- 每部分由哪个 Sub-Skill 生成
- 合并为完整分册的顺序

---

## 第一步（必须）：加载规范

```
.github/standards/04-api-design.md
```

该文件是唯一权威来源，包含：接口分类、命名、HTTP/RESTful 规范、报文结构、触发五要素、统一响应包装、错误码、安全、幂等、与 spec/DB 联动、验证清单（38 项）。**不读规范，不执行任何生成操作。**

---

## 第二步：识别任务类型，加载对应 Sub-Skill

| 任务 | Sub-Skill 路径 | 写入目标 |
|------|--------------|---------|
| 从 spec 功能编码推导接口清单、做覆盖检查 | `sub/01-interface-list.md` | 分册「接口清单」节 |
| 设计系统集成接口（触发五要素 + 主档/明细档 + JSON）| `sub/02-integration.md` ⬅ **核心** | 接口「集成」段 |
| 设计 HTTP/RESTful 接口（URL/Method/错误码/包装）| `sub/03-restful.md` | 接口「RESTful」段 |
| 审查 + 自动修复 + 出报告 | `sub/04-if-review.md` | 验证报告 |

---

## 第三步（可选）：参考模板

| 模板 | 用途 |
|------|------|
| `templates/if-skeleton.md` | 分册文件结构 + 每接口 4 段骨架 |
| `templates/interface-list.md` | 接口清单表（含关联 spec / DB 列）|
| `templates/integration-def.md` | 集成接口完整定义（触发五要素 + 主档/明细档 + JSON）|
| `templates/restful-def.md` | RESTful 接口完整定义（URL/Method/包装/错误码）|

---

## ⚠️ 闭环工作流（必须遵循）

> 所有内容生成必须遵循「生成 → 验证 → 修复 → 复验」四阶段循环，**不允许跳过验证直接交付**。

```
[阶段1] 生成（按接口逐段：触发条件 → 请求 → 应答 → 示例）
      ↓
[阶段2] 验证（执行 38 项检查清单）
      ↓ 有失败项？
[阶段3] 修复（按 04-api-design.md §十二 修复优先级）
      ↓
[阶段4] 复验（全部 38 项通过）→ ✅ DONE
```

### 执行规则

| 规则 | 说明 |
|------|------|
| **逐接口验证** | 完成一个接口（4 段完整）后立即验证，不等全分册生成完再统一验证 |
| **验证范围** | 执行 `standards/04-api-design.md §十` 中全部 **38 项**（IF-A/B/C/D/X 组）|
| **修复优先级** | IF-X（联动）→ IF-A（命名，尤其编码唯一）→ IF-C（安全）→ IF-B（报文）→ IF-D（文档）|
| **编码唯一强制** | 接口编码必须递增唯一，禁止重复（真实文档反面教材 PP_MW_B_01 全重复）|
| **统一响应强制** | 应答报文必须采用 `{code,msg,data,traceId}` 包装 |
| **暂挂项** | 缺调研数据时写 `【待补充：{描述}】`，标注「Pending」，不算失败 |

### 跨文档一致性检查（IF-X 组，每接口/分册执行一次）

按 `04-api-design.md §十一` 构建集合并比对：

```
SET_SPEC_FN = { spec 中标"需接口"的功能编码 }
SET_IF_FN   = { 接口清单"关联 spec 功能编码"列 }
SET_IF_FLD  = { 接口报文所有字段英文名 }
SET_DB_FLD  = { DB 数据字典所有字段英文名 }

X01：SET_SPEC_FN ⊆ SET_IF_FN（功能全覆盖）
X02：SET_IF_FN ⊆ SET_SPEC_FN（无凭空接口）
X03：SET_IF_FLD ⊆ SET_DB_FLD（字段英文名都能在 DB 找到）
X08：接口编码集合无重复
```

### 验证报告格式（每次验证后必须输出）

```
接口设计验证报告 — [模块/分册名]
总项数：35 | 通过：N | 失败：M | 暂挂：K
失败项：
  [A02] QM_PM_B_01 编码重复（应递增为 _02）
  [X03] aimPackWt 在 DB 数据字典中不存在
状态：❌ 需修复后继续
```

---

## 操作入口（完整闭环）

| 任务 | 使用方式 |
|------|---------|
| 初始化分册结构 | 在对话中说「初始化 {模块名} 接口设计结构」|
| 生成并写入指定接口 | 使用 `.github/prompts/create-if-design.prompt.md` |
| 验证已有设计 | 使用 `.github/prompts/validate-if-design.prompt.md` |
| 查阅完整规范 | 读取 `.github/standards/04-api-design.md` |
