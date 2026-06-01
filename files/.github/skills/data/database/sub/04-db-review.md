# Sub-Skill 04 — 数据库设计审查（验证 + 自动修复 + 报告）

> 规范来源：`standards/03-database.md §八（34 项）/§九（集合比对）/§十（修复协议）`。
> 本文件**不自行定义检查项**，所有检查以 §八 为准，避免双源脱节。

## 目标

对一份数据库设计执行 34 项验证，自动修复失败项，输出标准化报告。

## 步骤

### Step 1 — 加载规范

读取 `standards/03-database.md`，以 §八 的 34 项（DB-A/B/C/D/E/X）为唯一检查清单。

### Step 2 — 确定适用检查组

| 内容特征 | 适用组 |
|---------|-------|
| 含表名/字段名 | DB-A 命名 |
| 含字段清单 | DB-B 系统字段 |
| 含索引清单 | DB-C 索引 |
| 含 4 节结构 | DB-D 文档完整性 |
| **所有数据库设计** | **DB-X 联动（强制）** |

### Step 3 — 执行 DB-X 集合比对（强制，§九）

```
X01：SET_SPEC_OUT ⊆ SET_DB_TABLE
X02：SET_SPEC_FLD ⊆ SET_DB_FLD（按中文名匹配）
X03：匹配字段中文名一一对应
X04：SET_DB_FLD 英文名 ⊇ SET_API_FLD ∩ 本模块
X05：联动矩阵行数 == |SET_SPEC_FLD|
```

> spec/接口文档不在工作区 → 标「跨文件暂挂」。

### Step 4 — 自动修复（§十 优先级）

DB-X → DB-B → DB-C → DB-A → DB-D。修复后**必须复验**全部 34 项。

### Step 5 — 输出报告

写入 `docs/db/reports/DB_REVIEW_{模块}_{日期}.md`：

```
数据库设计验证报告 — [模块名]
验证时间：[时间]
覆盖表数：N
总项数：30 | 通过：N | 失败：M | 暂挂：K
[✅ / ❌ / ⚠️]

失败项：
  [B04] pmom_order_main 缺少 deletedFlag 字段
  [X03] orderNo 中文名"订单编号"与 spec IPO"订单号"不一致
修复动作：
  [B04] 已补 deletedFlag tinyint default 0
  [X03] 已统一为"订单号"
复验：34/34 通过 → ✅ DONE
```
