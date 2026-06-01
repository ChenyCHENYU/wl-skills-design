---
mode: agent
description: 验证数据库设计是否符合 wl-skills-design 规范，输出结构化报告并自动修复不合格项
tools:
  - read_file
  - replace_string_in_file
---

# 验证数据库设计（wl-skills-design 规范）

## 使用方式

```
/validate-db-design
目标文件：docs/db/01-order.md
```

或：`帮我验证 docs/db/01-order.md 是否符合规范`

---

## 第一步：加载规范

读取 `.github/standards/03-database.md`，作为验证基准。**唯一权威检查清单为 §八（34 项，DB-A/B/C/D/E/X 六组）**；DB-X 集合比对算法见 §九。

> ⚠️ 本 prompt **不自行定义检查项**，所有检查项以 §八 为准，避免双源脱节。

## 第二步：读取目标文件

读取用户指定的 `.md` 文件全部内容（必要时读取关联的 spec / 接口文件用于 X 组比对）。

## 第三步：按内容确定适用检查组，执行 §八 的 34 项

> **DB-B（系统字段）与 DB-X（spec 联动）对所有数据库设计强制执行。**

| 内容特征 | 适用组 |
|---------|-------|
| 含表名/字段名 | DB-A 命名（A01~A08）|
| 含字段清单 | DB-B 系统字段（B01~B07）|
| 含索引清单 | DB-C 索引（C01~C05）|
| 含 4 节结构 | DB-D 文档完整性（D01~D05）|
| **所有数据库设计** | **DB-X 联动（X01~X05）强制** |

### DB-X 集合比对（强制，按 §九 执行）

```
SET_SPEC_OUT = { spec IPO Output 涉及的持久化对象 }
SET_DB_TABLE = { 本分册业务表实体 }
SET_SPEC_FLD = { spec IPO 需持久化字段 }
SET_DB_FLD   = { DB 数据字典所有字段 }
SET_API_FLD  = { 接口报文字段英文名 }

X01：SET_SPEC_OUT ⊆ SET_DB_TABLE
X02：SET_SPEC_FLD ⊆ SET_DB_FLD（中文名匹配）
X03：匹配字段中文名一一对应
X04：SET_DB_FLD 英文名 ⊇ SET_API_FLD ∩ 本模块
X05：联动矩阵行数 == |SET_SPEC_FLD|
```

> 对端文档（spec / 接口）不在工作区时，标注对应 X 项为「跨文件暂挂」。

## 第四步：自动修复

按 §十 优先级（DB-X → DB-B → DB-C → DB-A → DB-D）用 `replace_string_in_file` 修复，修复后复验全部 34 项。

## 第五步：输出验证报告

```
数据库设计验证报告 — [模块名]
验证时间：[时间] ｜ 覆盖表数：N
总项数：30 | 通过：N | 失败：M | 暂挂：K
[✅ 全部通过 / ❌ 存在失败项 / ⚠️ 含暂挂项]

失败项：
  [B04] pmom_order_main 缺少 deletedFlag 字段
  [X03] orderNo 中文名与 spec IPO 不一致
修复动作：
  [B04] 已补 deletedFlag
  [X03] 已统一为"订单号"
复验：34/34 通过 → ✅ DONE
```

> 报告同时写入 `docs/db/reports/DB_REVIEW_{模块}_{日期}.md`。
