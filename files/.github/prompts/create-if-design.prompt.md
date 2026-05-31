---
mode: agent
description: 生成接口设计（触发条件 / 请求报文 / 应答报文 / JSON 示例），并写入 .md 文件，自动保证编码唯一、统一响应、spec/DB 联动
tools:
  - create_file
  - read_file
  - replace_string_in_file
---

# 接口设计生成（含文件输出）

## 使用方式

```
帮我设计【订单下达推送】接口（QM→PM），
基于 docs/spec/PM/4.3-order.md 与 docs/db/01-order.md，
输出到 docs/api/01-order.md
```

> 若未指定路径，默认输出到 `docs/api/{NN}-{模块名}.md`，分册总览写 `docs/api/00-api-overview.md`。

---

## 执行步骤

### Step 1：加载规范与 sub-skill

1. 读取 `.github/skills/api/restful/SKILL.md`，确认任务类型
2. 读取 `.github/standards/04-api-design.md`（唯一权威规范）
3. 按任务加载 sub-skill：
   - 接口清单推导 → `sub/01-interface-list.md`
   - 系统集成接口 → `sub/02-integration.md`
   - HTTP/RESTful 接口 → `sub/03-restful.md`
4. 参考模板 `templates/if-skeleton.md`、`templates/integration-def.md`、`templates/restful-def.md`

### Step 2：从 spec / DB 推导

- 从 spec 提取需接口的功能编码 → 分配**唯一递增**接口编码。
- 报文「英文字段」与 DB 数据字典字段英文名一致；「中文字段」与 spec IPO 字段名一致。

### Step 3：生成内容（每接口固定 4 段）

1. 触发条件（集成：五要素六行表 / HTTP：URL+Method+鉴权）
2. 请求报文（主档 + 明细档，6 列）
3. 应答报文（统一包装 `{code,msg,data,traceId}`）
4. 数据结构示例（请求 + 响应 JSON）

同时在 `00-api-overview.md` 维护接口清单 + 错误码清单 + 安全说明。

### Step 4：写入文件（必须执行）

用 `create_file` 写入指定路径。**不允许只展示不落盘。**

### Step 5：自动验证（闭环）

- 对照 `.github/standards/04-api-design.md §十`（35 项 IF-A/B/C/D/X）逐项检查
- **特别检查 A02：接口编码无重复**
- 执行 §十一 IF-X 集合比对（spec/DB 联动）
- 发现失败项 → 按 §十二 优先级修复 → 复验
- 输出：`✅ 文件已写入 [路径]，通过 N/35 项验证`，并写报告 `docs/api/reports/IF_REVIEW_{模块}_{日期}.md`
