# 样例 · 术语 / 字段词典完整范例（订单 + 计划域）

> **这是「样例（真实场景）」，不是空模板。** 它演示 `standards/08-glossary.md` 四类词条 + 9 列字段词条 + 枚举 + 编码注册 + 联动矩阵的完整落地。
> **使用约定**：生成时**对照本样例自检，且必须做得不低于它**——四类词条齐全、英文名/中文名全局唯一、枚举与编码注册成体系、联动矩阵闭环，不得退化。
> 空白起点请用 `../templates/glossary.md`；本文件用于校准达标程度。
>
> - **对应规范**：`standards/08-glossary.md §一~§四 / §六.3`
> - **来源域**：生产管理 · 订单管理（PMOM）+ 计划管理（PMPM）。
> - **达标基线**：4 类词条齐全 · 字段英文名全局唯一 · 枚举组 UPPER_SNAKE · 编码注册三段 · 末尾联动矩阵闭环。

---

# 术语 / 字段词典 — 烟台华新 · 生产管理

- 版本：v1.0
- 维护范围：订单管理（PMOM）+ 计划管理（PMPM）
- 说明：本词典是字段对齐的中央锚点；spec/DB/接口取名以此为准。

## 一、编码注册表

### 1.1 领域码（2 位小写）

| 领域码 | 业务域 | 大写模块前缀 |
|-------|-------|------------|
| `pm` | 生产管理 | `PM` |
| `qm` | 品质管理 | `QM` |

### 1.2 子模块代码

| 子模块代码（spec）| DB 前缀 | 子模块 |
|------------------|--------|-------|
| `PMOM` | `pmom` | 生产 · 订单管理 |
| `PMPM` | `pmpm` | 生产 · 计划管理 |

### 1.3 系统简码（接口）

| 简码 | 系统 |
|------|------|
| `PM` | 生产系统 |
| `QM` | 品质系统 |
| `MW` | 中间件 |

## 二、业务术语词条

| 中文术语 | 类别 | 标准字段名 | 定义 | 同义词 |
|---------|------|----------|------|-------|
| 炉号 | 业务术语 | `heatNo` | 一炉钢水的唯一生产批次号 | 炉次号（→统一为「炉号」）|
| 钢种 | 业务术语 | `steelGrade` | 钢材的牌号分类 | 牌号（→统一为「钢种」）|
| 组炉 | 业务术语 | - | 将多条钢坯需求合并为一炉的排产动作 | - |

## 三、字段词条（核心）

| 序号 | 字段中文名 | 字段英文名 | 逻辑类型 | 所属域 | 枚举组 | 定义 | spec 出处 | DB 落点 | 接口出现 |
|------|-----------|-----------|---------|-------|-------|------|----------|---------|---------|
| 1 | 订单号 | `orderNo` | varchar(40) | 订单 | - | 业务唯一单据号 | PMOM IPO | `pmom_order_main.orderNo` | ORD_RST_03 |
| 2 | 订单状态 | `orderStatus` | tinyint | 订单 | `ORDER_STATUS` | 订单生命周期状态 | PMOM IPO | `pmom_order_main.orderStatus` | ORD_RST_04 |
| 3 | 客户名称 | `custName` | varchar(100) | 订单 | - | 下单客户名称（快照）| PMOM IPO | `pmom_order_main.custName` | ORD_RST_01 |
| 4 | 炉号 | `heatNo` | varchar(40) | 生产 | - | 炉次唯一批号 | PMPM IPO | `pmpm_smelt_plan.heatNo` | - |
| 5 | 钢种 | `steelGrade` | varchar(32) | 生产 | `STEEL_GRADE` | 钢材牌号分类 | PMPM IPO | `pmpm_smelt_plan.steelGrade` | - |
| 6 | 计划状态 | `planStatus` | varchar(16) | 生产 | `PLAN_STATUS` | 计划生命周期状态 | PMPM IPO | `pmpm_smelt_plan.planStatus` | - |
| 7 | 计划重量 | `planWeight` | decimal(12,2) | 生产 | - | 计划重量（吨）| PMPM IPO | `pmpm_smelt_plan.planWeight` | - |

## 四、枚举 / 状态码词条

| 枚举组 | 值 | 标签（中文）| 英文常量 | 说明 |
|--------|----|-----------|---------|------|
| `ORDER_STATUS` | 0 | 草稿 | `DRAFT` | 新建默认 |
| `ORDER_STATUS` | 1 | 已下达 | `RELEASED` | 下达至生产 |
| `ORDER_STATUS` | 2 | 执行中 | `PROCESSING` | - |
| `ORDER_STATUS` | 3 | 已完结 | `COMPLETED` | 终态 |
| `ORDER_STATUS` | 4 | 已取消 | `CANCELLED` | 终态 |
| `PLAN_STATUS` | DRAFT | 草稿 | `DRAFT` | 计划员起草 |
| `PLAN_STATUS` | PENDING | 待审核 | `PENDING` | 已提交审批 |
| `PLAN_STATUS` | CONFIRMED | 已确认 | `CONFIRMED` | 审核通过 |
| `PLAN_STATUS` | ISSUED | 已下发 | `ISSUED` | 下发至工序 |

## 五、字段联动矩阵

| 字段英文名 | 词典中文名 | spec 出现 | DB 落点 | 接口出现 | 一致性 |
|-----------|-----------|----------|---------|---------|-------|
| `orderNo` | 订单号 | ✅ PMOM IPO | ✅ pmom_order_main | ✅ ORD_RST_03 | ✅ 一致 |
| `orderStatus` | 订单状态 | ✅ PMOM IPO | ✅ pmom_order_main | ✅ ORD_RST_04 | ✅ 一致 |
| `heatNo` | 炉号 | ✅ PMPM IPO | ✅ pmpm_smelt_plan | ⚠️ 暂无接口 | ✅ 一致 |
| `steelGrade` | 钢种 | ✅ PMPM IPO | ✅ pmpm_smelt_plan | - | ✅ 一致 |

---

## 自检：本样例为何达标（生成时对齐这些点，并设法超过）

- ✅ 四类词条齐全：业务术语 / 字段（9 列）/ 枚举 / 编码注册，缺一不可。
- ✅ 字段英文名全局唯一、标准中文名唯一，同义词（炉次号/牌号）在业务术语登记并指向标准名（GL-B 核心）。
- ✅ 枚举组名 UPPER_SNAKE，tinyint 用 0/1/2、varchar 用英文常量，与 DB 存储值一致。
- ✅ 编码注册表三段齐全（领域码/子模块代码/系统简码），PMOM↔pmom 大小写一一对应。
- ✅ 末尾联动矩阵让三方 ⊆ 词典一目了然，缺对端接口的字段明确标「暂无接口/暂挂」。
