# Sub-Skill 02 — 跨文档三角联动校验（Cross-Check）⬅ 核心

> 规范来源：`standards/07-design-review.md §四（D4 18 项）/ §五（追溯矩阵）`。
> 目标：现场计算 spec→DB、spec→IF、IF→DB 三角一致性，并构建正向追溯矩阵。这是集成评审独有、必须现场算的部分。

## 步骤

### Step 1 — 构建九个集合（§四）

从三份文档抽取：

```
SET_SPEC_OUT  = spec IPO Output 持久化对象
SET_SPEC_FLD  = spec IPO 需持久化字段（中文名）
SET_SPEC_FUNC = spec 功能编码
SET_DB_TABLE  = DB 业务表实体
SET_DB_FLD_CN = DB 数据字典中文名
SET_DB_FLD_EN = DB 数据字典英文名
SET_IF_LIST   = 接口清单
SET_IF_FLD_EN = 接口报文字段英文名
SET_IF_FUNC   = 接口覆盖的功能编码
```

> 缺某份文档 → 与之相关的集合为空 → 对应检查项标「跨文件暂挂」。

### Step 2 — 执行 18 项（按 §四 A/B/C/D/E 组）

| 组 | 项 | 比对 | 失败severity |
|----|----|------|------------|
| A spec→DB | V01 | SPEC_OUT ⊆ DB_TABLE | P0 |
| | V02 | SPEC_FLD ⊆ DB_FLD_CN | P0 |
| | V03 | 匹配字段口径一致 | P2 |
| | V04 | 无孤儿表（或有说明） | P2 |
| B spec→IF | V05 | SPEC_FUNC ⊆ IF_FUNC | P0 |
| | V06 | 集成类功能均有集成接口 | P0 |
| | V07 | 无接口超载 | P2 |
| | V08 | 无孤儿接口 | P2 |
| C IF→DB | V09 | IF_FLD_EN∩持久 ⊆ DB_FLD_EN | P0 |
| | V10 | 字段类型兼容 | P1 |
| | V11 | 字段中文描述一致 | P2 |
| D 命名口径 | V12 | 业务对象命名一致 | P1 |
| | V13 | 字段英文名拼写一致 | P1 |
| | V14 | 模块码/领域码一致 | P2 |
| | V15 | 状态码/枚举一致 | P1 |
| E 可追溯 | V16 | 存在追溯链路 | P1 |
| | V17 | P0/P1 可定位文档位置 | P1 |
| | V18 | 追溯矩阵行数==功能数 | P2 |

每项记：`通过 ✅ / 失败 ❌(severity) / 暂挂 ⚠️` + 证据（哪个元素缺对端）。

### Step 3 — 构建追溯矩阵（§五，必出）

遍历 `SET_SPEC_FUNC`，每个功能编码连出接口与落库表：

| spec 功能编码 | 功能名称 | 对应接口 | 落库表 | 状态 |
|--------------|---------|---------|--------|------|
| PP-OM-001 | 创建订单 | order_create | pmom_order_main | ✅ 闭环 |
| PP-OM-003 | 订单作废 | —(缺) | pmom_order_main | ❌ 断点(V05/P0) |

状态：`✅ 闭环` / `❌ 断点(项号/等级)` / `⚠️ 暂挂(缺对端)`。

### Step 4 — 汇总 D4 计数

```
D4 总项=18，通过=N，失败=M，暂挂=K
失败明细按 severity 标 P0/P1/P2
```

> 缺对端文档时，报告须标「⚠️ 缺 {文档}，X 项联动未校验」。

## 交付检查（交给 Sub-03）

- [ ] 18 项全部有结论（通过/失败/暂挂）（RV-R07）
- [ ] 追溯矩阵覆盖所有 spec 功能编码（RV-R08）
- [ ] 每条断点带项号 + severity + 位置（RV-R09）
