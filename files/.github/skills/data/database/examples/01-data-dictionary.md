# 样例 · 数据字典完整范例（订单主表 + 订单明细表）

> **这是「样例（真实场景）」，不是空模板。** 它演示 `standards/03-database.md` 的最佳实践落地后应达到的质量水位。
> **使用约定**：生成时**对照本样例自检，且必须做得不低于它**——系统字段更全、索引更合理、联动更完整，不得退化。
> 空白起点请用 `../templates/data-dictionary.md`；本文件用于校准「好到什么程度才算达标」。
>
> - **对应规范**：`standards/03-database.md §五（数据字典）/§六（系统字段）/§七（索引）`
> - **来源域**：订单管理模块（订单主表 + 订单明细表），字段命名遵循 camelCase 前缀约定。
> - **达标基线**：7 个系统字段齐全 · 主键/唯一键/外键索引齐全 · spec/接口三方字段联动闭环。

---

## 一、ER 关系（文字版）

```
订单主表 pmom_order_main  1 ──< N  订单明细表 pmom_order_item
                          (orderNo 关联)
订单主表 pmom_order_main  N >── 1  客户主数据 pmbd_customer
                          (custId 关联)
```

---

## 二、pmom_order_main · 订单主表

| 序号 | 字段英文名 | 字段中文名 | 主/外键 | 是否索引 | 类型 | 长度 | 空否 | 缺省 | 备注 |
|------|-----------|-----------|---------|---------|------|------|------|------|------|
| 1 | `id` | 主键 | PK | 是 | bigint | - | N | - | 雪花 ID |
| 2 | `orderNo` | 订单号 | - | 是(UK) | varchar | 40 | N | - | 业务唯一，规则见编码约定 |
| 3 | `custId` | 客户ID | FK | 是 | varchar | 32 | N | - | 关联 pmbd_customer.custId |
| 4 | `custName` | 客户名称 | - | 否 | varchar | 100 | N | - | [冗余:pmbd_customer.custName]，下单时快照，不随客户主数据变更 |
| 5 | `orderDate` | 下单日期 | - | 是 | date | - | N | - | 按日期范围查询高频 |
| 6 | `totalWeight` | 合同数量 | - | 否 | decimal | 12,2 | N | 0 | 单位：吨 |
| 7 | `deliveredWeight` | 已交数量 | - | 否 | decimal | 12,2 | N | 0 | 累计实际交货量 |
| 8 | `orderStatus` | 订单状态 | - | 否 | tinyint | - | N | 0 | 0草稿 1已下达 2执行中 3已完结 4已取消 |
| 9 | `remark` | 备注 | - | 否 | varchar | 500 | Y | - | |
| 10 | `createdBy` | 创建人 | - | 否 | varchar | 32 | N | - | 系统字段 |
| 11 | `createdTime` | 创建时间 | - | 否 | datetime | - | N | CURRENT_TIMESTAMP | 系统字段 |
| 12 | `updatedBy` | 更新人 | - | 否 | varchar | 32 | Y | - | 系统字段 |
| 13 | `updatedTime` | 更新时间 | - | 否 | datetime | - | Y | - | 系统字段 |
| 14 | `deletedFlag` | 删除标志 | - | 否 | tinyint | - | N | 0 | 系统字段 0正常 1删除 |
| 15 | `tenantId` | 租户号 | - | 否 | varchar | 32 | Y | - | 系统字段，多租户 |
| 16 | `version` | 乐观锁版本 | - | 否 | int | - | N | 0 | 系统字段 S8（乐观锁，并发控制）|

### 索引清单

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| `pk_order_main` | 主键 | `id` | 主键 |
| `uk_order_main_orderNo` | 唯一 | `orderNo` | 订单号业务唯一 |
| `idx_order_main_custId` | 普通 | `custId` | 按客户查询 |
| `idx_order_main_orderDate` | 普通 | `orderDate` | 按下单日期范围查询 |

---

## 三、pmom_order_item · 订单明细表

| 序号 | 字段英文名 | 字段中文名 | 主/外键 | 是否索引 | 类型 | 长度 | 空否 | 缺省 | 备注 |
|------|-----------|-----------|---------|---------|------|------|------|------|------|
| 1 | `id` | 主键 | PK | 是 | bigint | - | N | - | 雪花 ID |
| 2 | `orderNo` | 订单号 | FK | 是 | varchar | 40 | N | - | 关联 pmom_order_main.orderNo |
| 3 | `itemNo` | 项次 | - | 否 | varchar | 10 | N | - | 同一订单内唯一 |
| 4 | `productCode` | 产品编码 | - | 是 | varchar | 32 | N | - | |
| 5 | `productName` | 产品名称 | - | 否 | varchar | 100 | N | - | |
| 6 | `steelGrade` | 钢种 | - | 否 | varchar | 32 | Y | - | |
| 7 | `itemWeight` | 项次数量 | - | 否 | decimal | 12,2 | N | 0 | 单位：吨 |
| 8 | `createdBy` | 创建人 | - | 否 | varchar | 32 | N | - | 系统字段 |
| 9 | `createdTime` | 创建时间 | - | 否 | datetime | - | N | CURRENT_TIMESTAMP | 系统字段 |
| 10 | `updatedBy` | 更新人 | - | 否 | varchar | 32 | Y | - | 系统字段 |
| 11 | `updatedTime` | 更新时间 | - | 否 | datetime | - | Y | - | 系统字段 |
| 12 | `deletedFlag` | 删除标志 | - | 否 | tinyint | - | N | 0 | 系统字段 |
| 13 | `tenantId` | 租户号 | - | 否 | varchar | 32 | Y | - | 系统字段 |

### 索引清单

| 索引名 | 类型 | 字段 | 用途 |
|--------|------|------|------|
| `pk_order_item` | 主键 | `id` | 主键 |
| `idx_order_item_orderNo` | 普通 | `orderNo` | 按订单号查明细 |
| `idx_order_item_productCode` | 普通 | `productCode` | 按产品查询 |

---

## 四、字段联动说明（与 spec / 接口对齐）

| spec IPO 字段 | 数据库字段（中文名）| 接口字段（英文名）| 状态 |
|--------------|-------------------|-----------------|------|
| 订单号 | orderNo · 订单号 | orderNo | ✅ 闭环 |
| 客户名称 | custName · 客户名称 | custName | ✅ 闭环 |
| 合同数量 | totalWeight · 合同数量 | totalWeight | ✅ 闭环 |
| 已交数量 | deliveredWeight · 已交数量 | deliveredWeight | ✅ 闭环 |

> 三方字段中文名/英文名一一对应，是「设计集成评审」D4 联动校验通过的前提。

---

## 自检：本样例为何达标（生成时对齐这些点，并设法超过）

- ✅ 每张业务表注入了全部系统字段（创建/更新/删除/租户，主表含乐观锁 version）。
- ✅ 主键、业务唯一键（UK）、外键、高频查询列均建索引，索引命名 `pk_/uk_/idx_` 规范统一。
- ✅ 冗余字段明确标注 `[冗余:来源]` 与「快照」语义，避免读者误以为是实时关联。
- ✅ 枚举字段（orderStatus）在备注中钉死取值域，与词典/接口枚举一致。
- ✅ 末尾给出三方字段联动表，让 D4 评审一眼可查。
